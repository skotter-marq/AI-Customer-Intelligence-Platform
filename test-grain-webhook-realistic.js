// test-grain-webhook-realistic.js
/**
 * Test script to simulate realistic Grain webhook data
 * This simulates the full flow: recorded → transcribed → analyzed
 */

const fetch = require('node-fetch');

const WEBHOOK_URL = 'http://localhost:3000/api/grain-webhook';

// Realistic sample meeting data that matches Grain's webhook format
const sampleMeetings = [
  {
    // Meeting 1: Sales Demo
    recorded: {
      event: 'meeting.recorded',
      meeting_id: 'grain_demo_001',
      meeting: {
        id: 'grain_demo_001',
        title: 'Product Demo - TechFlow Solutions',
        started_at: '2024-01-29T14:00:00Z',
        duration: 2700, // 45 minutes in seconds
        attendees: [
          { name: 'Sarah Johnson', email: 'sarah@company.com', role: 'host' },
          { name: 'Mike Chen', email: 'mike@techflow.com', role: 'attendee' },
          { name: 'Lisa Wong', email: 'lisa@techflow.com', role: 'attendee' }
        ],
        organizer: { email: 'sarah@company.com', name: 'Sarah Johnson' },
        recording_url: 'https://grain.com/recordings/demo_001',
        share_url: 'https://grain.com/share/demo_001',
        type: 'customer_demo'
      },
      workspace: { name: 'Sales Team' }
    },
    transcribed: {
      event: 'meeting.transcribed',
      meeting_id: 'grain_demo_001',
      meeting: {
        id: 'grain_demo_001',
        title: 'Product Demo - TechFlow Solutions',
        transcript_url: 'https://grain.com/transcripts/demo_001',
        transcript: `Sarah Johnson: Thanks for joining today's demo, Mike and Lisa. I'm excited to show you our analytics platform.

Mike Chen: Great, we're looking forward to it. We're currently using Salesforce but we're finding it quite complex for our team.

Sarah Johnson: I understand. That's actually a common pain point we hear. Let me show you our dashboard interface first.

Lisa Wong: This looks much cleaner than what we're used to. How customizable are these reports?

Sarah Johnson: Very customizable. You can create custom dashboards, set up automated alerts, and even build your own widgets.

Mike Chen: That sounds promising. What about pricing compared to what we're paying for HubSpot currently?

Sarah Johnson: I'd be happy to put together a custom quote for you. Can you tell me more about your current setup and pain points?

Lisa Wong: Our biggest issue is the reporting. It takes hours to generate the reports we need, and they're not very visual.

Sarah Johnson: Our platform can generate those same reports in under 30 seconds, and everything is highly visual with interactive charts.

Mike Chen: That would save us a lot of time. We spend about 10 hours a week just on reporting.

Sarah Johnson: Exactly. Let me show you a real example. Here's how you'd create a sales pipeline report.

Lisa Wong: Wow, that's impressive. How quickly could we get onboarded?

Sarah Johnson: Typically 2-3 weeks for full onboarding, including data migration and team training.

Mike Chen: We'd need to integrate with our existing CRM. Do you support Salesforce integration?

Sarah Johnson: Absolutely. We have native Salesforce integration, plus API connections to over 200 tools.

Lisa Wong: What about data security? That's a big concern for us.

Sarah Johnson: We're SOC 2 compliant, GDPR compliant, and use enterprise-grade encryption.

Mike Chen: This looks really good. What are the next steps?

Sarah Johnson: I'll send you a custom proposal by Thursday, and we can schedule a technical deep-dive with your IT team.

Lisa Wong: Perfect. We're excited to move forward with this.`
      }
    }
  },
  {
    // Meeting 2: Customer Support Call
    recorded: {
      event: 'meeting.recorded',
      meeting_id: 'grain_support_002',
      meeting: {
        id: 'grain_support_002',
        title: 'Support Escalation - DataCorp API Issues',
        started_at: '2024-01-29T10:30:00Z',
        duration: 1800, // 30 minutes
        attendees: [
          { name: 'Alex Thompson', email: 'alex@company.com', role: 'host' },
          { name: 'Robert Kim', email: 'robert@datacorp.com', role: 'attendee' }
        ],
        organizer: { email: 'alex@company.com', name: 'Alex Thompson' },
        recording_url: 'https://grain.com/recordings/support_002',
        share_url: 'https://grain.com/share/support_002',
        type: 'support_call'
      },
      workspace: { name: 'Customer Success' }
    },
    transcribed: {
      event: 'meeting.transcribed',
      meeting_id: 'grain_support_002',
      meeting: {
        id: 'grain_support_002',
        title: 'Support Escalation - DataCorp API Issues',
        transcript_url: 'https://grain.com/transcripts/support_002',
        transcript: `Alex Thompson: Hi Robert, thanks for jumping on this call. I understand you're experiencing some API issues.

Robert Kim: Yes, we've been getting 429 rate limit errors since yesterday, and it's causing our production system to fail.

Alex Thompson: I'm really sorry about that. Let me look into your account right now. Can you tell me your API key prefix?

Robert Kim: It starts with 'dc_prod_'. This is critical for us - our customers can't access their dashboards.

Alex Thompson: I see the issue. There was a change to rate limits yesterday that affected some enterprise accounts. I'm escalating this immediately.

Robert Kim: How long until it's fixed? We're losing customers over this.

Alex Thompson: I'm getting our engineering team involved right now. This should be resolved within the hour.

Robert Kim: We also need better error handling in your API. The error messages are too generic.

Alex Thompson: That's excellent feedback. I'll make sure that gets prioritized in our next release.

Robert Kim: And we need some kind of status page. We had no idea this was a platform-wide issue.

Alex Thompson: You're absolutely right. We're actually launching a status page next month, but I'll see if we can expedite that.

Robert Kim: What about compensation for the downtime?

Alex Thompson: I'll work with billing to apply appropriate credits to your account for the disruption.

Robert Kim: I appreciate that. Can we also schedule regular check-ins to prevent issues like this?

Alex Thompson: Absolutely. I'll set up monthly health checks with your team starting next week.`
      }
    }
  },
  {
    // Meeting 3: Feature Discussion
    recorded: {
      event: 'meeting.recorded',
      meeting_id: 'grain_feature_003',
      meeting: {
        id: 'grain_feature_003',
        title: 'Feature Request Discussion - StartupXYZ Dashboard',
        started_at: '2024-01-29T16:00:00Z',
        duration: 1500, // 25 minutes
        attendees: [
          { name: 'Emma Davis', email: 'emma@startupxyz.com', role: 'attendee' },
          { name: 'Tom Wilson', email: 'tom@company.com', role: 'host' },
          { name: 'Rachel Green', email: 'rachel@company.com', role: 'attendee' }
        ],
        organizer: { email: 'tom@company.com', name: 'Tom Wilson' },
        recording_url: 'https://grain.com/recordings/feature_003',
        share_url: 'https://grain.com/share/feature_003',
        type: 'feature_discussion'
      },
      workspace: { name: 'Product Team' }
    },
    transcribed: {
      event: 'meeting.transcribed',
      meeting_id: 'grain_feature_003',
      meeting: {
        id: 'grain_feature_003',
        title: 'Feature Request Discussion - StartupXYZ Dashboard',
        transcript_url: 'https://grain.com/transcripts/feature_003',
        transcript: `Tom Wilson: Hi Emma, thanks for setting up time to discuss your dashboard customization needs.

Emma Davis: Thanks for making time. We really need more flexibility in our dashboard layouts.

Rachel Green: Can you tell us more about what you're looking for specifically?

Emma Davis: We need to be able to drag and drop widgets, resize them, and create multiple dashboard views.

Tom Wilson: That's definitely something we've been considering. How critical is this for your Q2 goals?

Emma Davis: Very critical. Our executives want different views than our analysts, and right now everyone sees the same thing.

Rachel Green: What about user permissions? Would you need role-based dashboard access?

Emma Davis: Absolutely. Our C-level wants high-level metrics, but our operations team needs detailed breakdowns.

Tom Wilson: This sounds like a comprehensive dashboard personalization feature. Let me check our roadmap.

Emma Davis: We'd also love the ability to share specific dashboard views via URL.

Rachel Green: Like a public sharing feature for reports?

Emma Davis: Exactly. Sometimes we need to share metrics with our board or investors.

Tom Wilson: That's a great use case. How soon would you need this functionality?

Emma Davis: Ideally by end of Q2. We're presenting to our board in June.

Rachel Green: I think we can prioritize the core customization features for Q2, and the sharing for Q3.

Emma Davis: That would be amazing. This is exactly what we need to scale our analytics adoption.

Tom Wilson: I'll get this into our sprint planning for next week and send you a timeline.

Emma Davis: Perfect. Is there a beta program we could join to test early versions?

Rachel Green: We can definitely include you in our beta testing. I'll add you to our product preview list.`
      }
    }
  }
];

async function testRealisticWebhook() {
  console.log('🧪 Testing Grain webhook with realistic meeting data...\n');

  for (const [index, meeting] of sampleMeetings.entries()) {
    console.log(`📋 Testing Meeting ${index + 1}: ${meeting.recorded.meeting.title}`);
    
    try {
      // Step 1: Send meeting.recorded event
      console.log('  📹 Sending meeting.recorded event...');
      const recordedResponse = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meeting.recorded)
      });
      
      const recordedResult = await recordedResponse.json();
      if (recordedResult.success) {
        console.log(`  ✅ Meeting recorded: ${recordedResult.meeting_id}`);
      } else {
        console.log(`  ❌ Recording failed: ${recordedResult.error}`);
        continue;
      }

      // Wait a moment before sending transcription
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Send meeting.transcribed event
      console.log('  📝 Sending meeting.transcribed event...');
      const transcribedResponse = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meeting.transcribed)
      });
      
      const transcribedResult = await transcribedResponse.json();
      if (transcribedResult.success) {
        console.log(`  ✅ Meeting transcribed and AI analysis initiated`);
      } else {
        console.log(`  ❌ Transcription failed: ${transcribedResult.error}`);
      }

      console.log(''); // Empty line for readability
      
      // Wait before processing next meeting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`  ❌ Error processing meeting ${index + 1}:`, error.message);
    }
  }

  console.log('🎉 Webhook testing completed!');
  console.log('\n📊 Check your database and dashboard to see the imported meetings.');
  console.log('🤖 AI analysis should be running in the background.');
}

// Run the test
testRealisticWebhook().catch(console.error);