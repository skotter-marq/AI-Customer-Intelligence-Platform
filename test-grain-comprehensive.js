const fetch = require('node-fetch');

// Test the comprehensive Grain webhook with your actual Zapier payload
const grainPayload = {
  "recording_id": "72d72955-b1ba-42de-bfec-59bd70ad4cbb",
  "recording_title": "Chad Collett and Spencer Kotter",
  "data_owners": 1,
  "data_source": "zoom", 
  "recording_url": "https://grain.com/share/recording/72d72955-b1ba-42de-bfec-59bd70ad4cbb/Tk8c7AVnGAMaVZk9PmnG8z9Cw2MidV80OuwZDhNR",
  "data_summary": "Implementing single sign-on (SSO) for Morehead State University using Marq's platform and configuring Azure Active Directory settings.",
  "recording_start_datetime": "2025-07-30T18:59:53Z",
  "recording_end_datetime": "2025-07-30T19:16:14Z",
  "data_participants": [
    {
      "data_participants_id": "3cbd06e9-536e-44ab-ad6a-22498779a644",
      "data_participants_name": "Sean Anderson", 
      "data_participants_scope": "internal",
      "data_participants_email": "sanderson@marq.com",
      "data_participants_confirmed_attendee": false
    },
    {
      "data_participants_id": "2479fc43-d710-414b-8e17-2c7e4af08576",
      "data_participants_name": "t.hobbs",
      "data_participants_scope": "external", 
      "data_participants_email": "t.hobbs@moreheadstate.edu",
      "data_participants_confirmed_attendee": false
    },
    {
      "data_participants_id": "9ff2c01c-8224-4c0d-a412-954c798d1e80",
      "data_participants_name": "Shahar Yar",
      "data_participants_scope": "internal",
      "data_participants_email": "c-syar@marq.com", 
      "data_participants_confirmed_attendee": false
    },
    {
      "data_participants_id": "63f2b479-a23d-4f07-8055-e2369df34c8d",
      "data_participants_name": "c.collett",
      "data_participants_scope": "external",
      "data_participants_email": "c.collett@moreheadstate.edu",
      "data_participants_confirmed_attendee": true
    },
    {
      "data_participants_id": "d8f6ce90-6acd-4f44-9497-4bbcb995fde6", 
      "data_participants_name": "Spencer Kotter",
      "data_participants_scope": "internal",
      "data_participants_email": "skotter@marq.com",
      "data_participants_confirmed_attendee": true
    },
    {
      "data_participants_id": "485d9f85-6661-42fe-8930-11e1d3fb1328",
      "data_participants_name": "a.nutter",
      "data_participants_scope": "external",
      "data_participants_email": "a.nutter@moreheadstate.edu", 
      "data_participants_confirmed_attendee": true
    },
    {
      "data_participants_id": "8fee17dd-e266-4fd7-be94-531c7e0b41a0",
      "data_participants_name": "Natalie Bigler",
      "data_participants_scope": "internal",
      "data_participants_email": "nbigler@marq.com",
      "data_participants_confirmed_attendee": true
    }
  ],
  "data_ical_uid": "i86p17np2eehaij5e456pp7lrk@google.com",
  "summary_points": [
    {
      "data_summary_points_timestamp": 547,
      "data_summary_points_text": "Natalie Bigler and April Nutter discuss health concerns. Chad Collett is the primary contact for single sign-on. Excitement grows for the new product's benefits."
    },
    {
      "data_summary_points_timestamp": 166717, 
      "data_summary_points_text": "Natalie Bigler introduces Spencer Kotter for support. Spencer explains the single sign-on process. Chad Collett confirms Azure Enterprise usage and seeks domain clarification."
    },
    {
      "data_summary_points_timestamp": 456950,
      "data_summary_points_text": "Natalie Bigler addresses the unsigned contract status. Chad Collett emphasizes the need for a valid agreement. Spencer Kotter discusses integration requirements and access concerns."
    },
    {
      "data_summary_points_timestamp": 665450,
      "data_summary_points_text": "Chad Collett suggests initial view access for users. April Nutter confirms user group management capabilities. Natalie Bigler emphasizes the urgency of finalizing the contract."
    }
  ],
  "recording_viewer-only_url": "https://grain.com/share/recording/72d72955-b1ba-42de-bfec-59bd70ad4cbb/Tk8c7AVnGAMaVZk9PmnG8z9Cw2MidV80OuwZDhNR",
  "data_transcript_json_url": "https://grain.com/_/public-api/recordings/72d72955-b1ba-42de-bfec-59bd70ad4cbb/transcript",
  "data_transcript_srt_url": "https://grain.com/_/public-api/recordings/72d72955-b1ba-42de-bfec-59bd70ad4cbb/transcript.srt", 
  "data_transcript_txt_url": "https://grain.com/_/public-api/recordings/72d72955-b1ba-42de-bfec-59bd70ad4cbb/transcript.txt",
  "data_transcript_vtt_url": "https://grain.com/_/public-api/recordings/72d72955-b1ba-42de-bfec-59bd70ad4cbb/transcript.vtt",
  "recording_intelligence_notes_(markdown)": `**Key Takeaways** 
 [(03:22)](https://grain.com/share/recording/72d72955-b1ba-42de-bfec-59bd70ad4cbb/Tk8c7AVnGAMaVZk9PmnG8z9Cw2MidV80OuwZDhNR?t=202270) - The client is using Azure Active Directory for single sign-on (SSO) integration, which requires specific configuration steps.
 [(07:03)](https://grain.com/share/recording/72d72955-b1ba-42de-bfec-59bd70ad4cbb/Tk8c7AVnGAMaVZk9PmnG8z9Cw2MidV80OuwZDhNR?t=423330) - The contract with the client is still pending approval, impacting the setup of user accounts and SSO testing.
 [(12:25)](https://grain.com/share/recording/72d72955-b1ba-42de-bfec-59bd70ad4cbb/Tk8c7AVnGAMaVZk9PmnG8z9Cw2MidV80OuwZDhNR?t=745063) - The client prefers to manage user permissions within the Lucidpress platform rather than through Azure, allowing for more flexibility.

**Action Items** 
 [(09:14)](https://grain.com/share/recording/72d72955-b1ba-42de-bfec-59bd70ad4cbb/Tk8c7AVnGAMaVZk9PmnG8z9Cw2MidV80OuwZDhNR?t=554890) - Follow up on the contract status with Andrea
 [(15:35)](https://grain.com/share/recording/72d72955-b1ba-42de-bfec-59bd70ad4cbb/Tk8c7AVnGAMaVZk9PmnG8z9Cw2MidV80OuwZDhNR?t=935420) - Send a follow-up email once the contract is received`
};

async function testComprehensiveGrainWebhook() {
  console.log('🧪 Testing comprehensive Grain webhook with real payload...');
  
  try {
    const response = await fetch('http://localhost:3000/api/grain-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(grainPayload)
    });

    const result = await response.json();
    
    console.log('📊 Webhook Response:');
    console.log('  Success:', result.success);
    console.log('  Message:', result.message);
    console.log('  Meeting ID:', result.meeting_id);
    console.log('  Source:', result.source);
    
    if (result.features_extracted) {
      console.log('\n🎯 Features Extracted:');
      console.log('  Transcript:', result.features_extracted.transcript);
      console.log('  Summary:', result.features_extracted.summary);
      console.log('  Intelligence Notes:', result.features_extracted.intelligence_notes);
      console.log('  Summary Points:', result.features_extracted.summary_points);
      console.log('  Participants:', result.features_extracted.participants);
      console.log('  Customer Identified:', result.features_extracted.customer_identified);
    }
    
    if (result.data_completeness) {
      console.log('\n📈 Data Completeness:', result.data_completeness);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testComprehensiveGrainWebhook();