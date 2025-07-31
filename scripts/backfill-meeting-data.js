const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function backfillMeetingData() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    console.log('🔄 Starting meeting data backfill...');
    
    // Get all meetings with missing data
    const { data: meetings, error } = await supabase
      .from('meetings')
      .select('*')
      .or('duration_minutes.is.null,customer_id.is.null,raw_transcript.is.null');
    
    if (error) {
      throw error;
    }
    
    console.log(`📊 Found ${meetings.length} meetings needing data enrichment`);
    
    for (const meeting of meetings) {
      console.log(`\n🔍 Processing: ${meeting.title}`);
      
      // Calculate what's missing
      const missingFields = [];
      if (!meeting.duration_minutes) missingFields.push('duration');
      if (!meeting.customer_id) missingFields.push('customer');  
      if (!meeting.raw_transcript) missingFields.push('transcript');
      
      console.log(`   Missing: ${missingFields.join(', ')}`);
      
      // Estimate duration from meeting title patterns or defaults
      let estimatedDuration = meeting.duration_minutes;
      if (!estimatedDuration) {
        estimatedDuration = estimateDurationFromTitle(meeting.title);
        console.log(`   ⏱️ Estimated duration: ${estimatedDuration} minutes`);
      }
      
      // Try to match/create customer
      let customerId = meeting.customer_id;
      if (!customerId && meeting.participants) {
        customerId = await matchOrCreateCustomerFromParticipants(supabase, meeting.participants, meeting.title);
        if (customerId) {
          console.log(`   👤 Matched/created customer ID: ${customerId}`);
        }
      }
      
      // Enhanced customer name from attendees
      const enhancedCustomerName = extractCustomerFromAttendees(meeting.participants);
      if (enhancedCustomerName) {
        console.log(`   🏢 Enhanced customer name: ${enhancedCustomerName}`);
      }
      
      // Update meeting with enriched data
      const updates = {};
      if (estimatedDuration && !meeting.duration_minutes) {
        updates.duration_minutes = estimatedDuration;
      }
      if (customerId && !meeting.customer_id) {
        updates.customer_id = customerId;
      }
      
      // Note: No metadata column in current schema, so we'll just update the core fields
      console.log(`   🔧 Applying updates:`, Object.keys(updates));
      
      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from('meetings')
          .update(updates)
          .eq('id', meeting.id);
        
        if (updateError) {
          console.error(`   ❌ Failed to update meeting:`, updateError.message);
        } else {
          console.log(`   ✅ Updated meeting with enriched data`);
        }
      } else {
        console.log(`   ⏭️ No enrichment needed`);
      }
    }
    
    console.log('\n🎉 Meeting data backfill completed!');
    
    // Show summary
    const { data: updatedMeetings } = await supabase
      .from('meetings')
      .select('duration_minutes, customer_id, raw_transcript')
      .not('duration_minutes', 'is', null);
    
    console.log(`📈 Meetings with duration: ${updatedMeetings?.length || 0}/${meetings.length}`);
    
  } catch (error) {
    console.error('❌ Backfill failed:', error);
  }
}

function estimateDurationFromTitle(title) {
  const titleLower = title.toLowerCase();
  
  // Common meeting duration patterns
  if (titleLower.includes('demo') || titleLower.includes('presentation')) {
    return 45; // Demos are usually 45 minutes
  }
  if (titleLower.includes('qbr') || titleLower.includes('quarterly')) {
    return 60; // QBRs are usually 1 hour
  }
  if (titleLower.includes('standup') || titleLower.includes('daily')) {
    return 15; // Standups are short
  }
  if (titleLower.includes('training') || titleLower.includes('workshop')) {
    return 90; // Training sessions are longer
  }
  if (titleLower.includes('quick') || titleLower.includes('sync')) {
    return 30; // Quick syncs are 30 minutes
  }
  
  // Check for time indicators in title
  const timeMatch = titleLower.match(/(\\d+)\\s*(min|hour|hr)/);
  if (timeMatch) {
    const number = parseInt(timeMatch[1]);
    const unit = timeMatch[2];
    return unit.startsWith('hour') || unit === 'hr' ? number * 60 : number;
  }
  
  // Default meeting duration
  return 30;
}

async function matchOrCreateCustomerFromParticipants(supabase, participants, meetingTitle) {
  try {
    if (!participants || !Array.isArray(participants)) {
      return null;
    }
    
    // Find external attendees (non-internal domains)
    const externalAttendees = participants.filter(p => 
      p.email && !isInternalDomain(p.email)
    );
    
    if (externalAttendees.length === 0) {
      return null;
    }
    
    const primaryAttendee = externalAttendees[0];
    const domain = primaryAttendee.email.split('@')[1];
    const companyName = extractCompanyNameFromDomain(domain);
    
    // Try to find existing customer by domain
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .ilike('domain', domain)
      .limit(1)
      .single();
    
    if (existingCustomer) {
      return existingCustomer.id;
    }
    
    // Create new customer
    const { data: newCustomer, error } = await supabase
      .from('customers')
      .insert({
        name: companyName,
        domain: domain,
        status: 'active',
        source: 'meeting_backfill',
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();
    
    if (error) {
      console.warn(`   ⚠️ Failed to create customer: ${error.message}`);
      return null;
    }
    
    return newCustomer.id;
    
  } catch (error) {
    console.warn(`   ⚠️ Customer matching failed: ${error.message}`);
    return null;
  }
}

function extractCustomerFromAttendees(participants) {
  if (!participants || !Array.isArray(participants)) {
    return null;
  }
  
  const externalAttendees = participants.filter(p => 
    p.email && !isInternalDomain(p.email)
  );
  
  if (externalAttendees.length > 0) {
    const domain = externalAttendees[0].email.split('@')[1];
    return extractCompanyNameFromDomain(domain);
  }
  
  return null;
}

function extractCompanyNameFromDomain(domain) {
  // Convert domain to company name
  const companyName = domain.split('.')[0];
  return companyName.charAt(0).toUpperCase() + companyName.slice(1).toLowerCase();
}

function isInternalDomain(email) {
  const internalDomains = [
    'marq.com',        // Your actual company domain
    'company.com',     // Replace with actual
    'gmail.com'        // Often used for testing
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  return internalDomains.includes(domain);
}

// Run the backfill
backfillMeetingData();