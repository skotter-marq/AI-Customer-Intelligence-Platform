import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase-client';

export async function POST() {
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
  }

  try {
    // First, create sample customers using actual schema
    const customers = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'TechFlow Solutions',
        email: 'contact@techflow.com',
        company: 'TechFlow Solutions',
        industry: 'Technology',
        segment: 'Enterprise'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'DataCorp Analytics', 
        email: 'info@datacorp.io',
        company: 'DataCorp Analytics',
        industry: 'Data & Analytics',
        segment: 'Enterprise'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'StartupX',
        email: 'hello@startupx.co', 
        company: 'StartupX',
        industry: 'Software',
        segment: 'SMB'
      }
    ];

    // Insert customers (ignore conflicts)
    const { error: customersError } = await supabase
      .from('customers')
      .upsert(customers, { onConflict: 'id' });

    if (customersError) {
      console.error('Error inserting customers:', customersError);
    }

    // Now create sample meetings using actual schema (only existing columns)
    const meetings = [
      {
        id: '660e8400-e29b-41d4-a716-446655440001',
        grain_id: 'grain-demo-001',
        customer_id: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Product Demo - TechFlow Solutions',
        date: '2025-08-05T14:00:00Z',
        duration_minutes: 45,
        participants: [
          {"name": "Sarah Chen", "email": "sarah.chen@techflow.com", "role": "VP Engineering"},
          {"name": "Mike Johnson", "email": "mike.johnson@techflow.com", "role": "Data Team Lead"},
          {"name": "Alex Rodriguez", "email": "alex@ourcompany.com", "role": "Solutions Engineer"},
          {"name": "Jessica Park", "email": "jessica@ourcompany.com", "role": "Account Executive"}
        ],
        raw_transcript: `Sarah Chen: Hi everyone, thanks for taking the time to show us your platform today. We are really excited to see how this could help streamline our customer research process.

Alex Rodriguez: Absolutely, Sarah. Let me start by showing you our dashboard. As you can see, we aggregate all customer touchpoints - meetings, support tickets, feature requests - into a single intelligence layer.

Mike Johnson: This looks really impressive. How does the sentiment analysis work? We have been struggling to get meaningful insights from our customer calls.

Alex Rodriguez: Great question, Mike. Our AI analyzes transcripts in real-time and identifies key themes, pain points, and opportunities. For example, if customers mention competitors or express frustration about specific features, we flag those automatically.

Sarah Chen: That would be incredibly valuable. We currently have someone manually reviewing all our customer calls, which takes forever.

Jessica Park: And the best part is it integrates directly with your existing tools - HubSpot, Jira, Slack. You would not need to change your workflow.

Mike Johnson: What about data privacy and security? We handle sensitive customer information.

Alex Rodriguez: Security is our top priority. All data is encrypted at rest and in transit. We are SOC 2 compliant and can provide detailed security documentation.

Sarah Chen: This looks like exactly what we need. What would be the next steps to move forward?

Jessica Park: I would love to set up a technical deep-dive session with your team next week. We can also start a pilot program to test it with some of your actual customer data.

Mike Johnson: That sounds perfect. We are particularly interested in the JIRA integration and how it handles feature request prioritization.`
      },
      {
        id: '660e8400-e29b-41d4-a716-446655440002',
        grain_id: 'grain-qbr-002',
        customer_id: '550e8400-e29b-41d4-a716-446655440002',
        title: 'Quarterly Business Review - DataCorp Analytics',
        date: '2025-08-03T10:30:00Z',
        duration_minutes: 60,
        participants: [
          {"name": "Jennifer Liu", "email": "jennifer.liu@datacorp.io", "role": "Head of Product"},
          {"name": "David Park", "email": "david.park@datacorp.io", "role": "Engineering Manager"},
          {"name": "Rachel Green", "email": "rachel@ourcompany.com", "role": "Customer Success Manager"},
          {"name": "Tom Wilson", "email": "tom@ourcompany.com", "role": "Product Manager"}
        ],
        raw_transcript: `Rachel Green: Hi Jennifer, David, great to see you both. Let us dive into your Q3 usage and talk about what is coming up.

Jennifer Liu: Thanks Rachel. Overall, we have been really happy with the platform. Our usage has grown significantly - we are now processing about 200 customer interactions per month.

David Park: The integration with our existing stack has been smooth. The HubSpot sync is working perfectly, and the insights are helping our product team prioritize features.

Tom Wilson: That is fantastic to hear. I want to share some exciting updates we have coming in Q4. We are launching advanced sentiment tracking and competitive intelligence features.

Jennifer Liu: Competitive intelligence sounds interesting. We have been manually tracking what customers say about our competitors, which is time-consuming.

Rachel Green: The new feature will automatically identify competitor mentions and categorize them by threat level and opportunity type. You will get alerts when customers mention switching or comparing alternatives.

David Park: That could be huge for our renewal strategy. We have had a few close calls with customers considering other platforms.

Jennifer Liu: How accurate is the sentiment analysis? We have tried other tools that were not very reliable.

Tom Wilson: Our accuracy is around 92% for sentiment classification. We trained the model specifically on B2B customer conversations, which makes a big difference.

Rachel Green: Beta access starts next month, with general availability in November. I can get you early access if you are interested in providing feedback.

Jennifer Liu: Absolutely, we would love to be part of the beta. This aligns perfectly with our focus on customer retention for next quarter.`
      },
      {
        id: '660e8400-e29b-41d4-a716-446655440003',
        grain_id: 'grain-support-003',
        customer_id: '550e8400-e29b-41d4-a716-446655440003',
        title: 'Technical Support Call - StartupX Integration Issues',
        date: '2025-08-01T16:00:00Z',
        duration_minutes: 35,
        participants: [
          {"name": "Carlos Martinez", "email": "carlos@startupx.co", "role": "CTO"},
          {"name": "Lisa Wong", "email": "lisa@startupx.co", "role": "Lead Developer"},
          {"name": "James Cooper", "email": "james@ourcompany.com", "role": "Technical Support Lead"},
          {"name": "Maria Garcia", "email": "maria@ourcompany.com", "role": "Solutions Engineer"}
        ],
        raw_transcript: `Carlos Martinez: Hi James, thanks for jumping on this call. We are having some issues with the API integration that started this morning.

James Cooper: Of course, Carlos. I see the ticket you submitted. Can you walk me through exactly what is happening?

Lisa Wong: Sure, so our data sync process runs every hour to pull customer interaction data. Since about 8 AM this morning, we are getting 429 rate limiting errors, but we have not changed anything on our end.

Maria Garcia: Let me check our rate limiting logs. I can see your requests... it looks like there might be an issue with how the retry logic is handling temporary failures.

Carlos Martinez: We implemented exponential backoff like the documentation suggests, but it seems like the retries are accumulating and hitting the rate limit.

James Cooper: That is a known issue we have been working on. The rate limiting logic was updated last week to be more strict, but we did not anticipate the retry behavior causing problems.

Lisa Wong: This is pretty urgent for us. Our customer dashboard is not updating, and we have a board meeting tomorrow where we need to show current metrics.

Maria Garcia: I completely understand. Let me apply a temporary rate limit exception for your account while we fix the underlying issue.

James Cooper: Our engineering team is targeting a fix by end of week. The temporary exception should cover you until then.

Lisa Wong: We appreciate the quick response. This kind of support is why we chose your platform.`
      },
      {
        id: '660e8400-e29b-41d4-a716-446655440004',
        grain_id: 'grain-discovery-004',
        customer_id: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Discovery Call - TechFlow Advanced Features',
        date: '2025-07-29T13:00:00Z',
        duration_minutes: 50,
        participants: [
          {"name": "Sarah Chen", "email": "sarah.chen@techflow.com", "role": "VP Engineering"},
          {"name": "Mike Johnson", "email": "mike.johnson@techflow.com", "role": "Data Team Lead"},
          {"name": "Robert Kim", "email": "robert.kim@techflow.com", "role": "Product Manager"},
          {"name": "Jessica Park", "email": "jessica@ourcompany.com", "role": "Account Executive"},
          {"name": "Dr. Amanda Foster", "email": "amanda@ourcompany.com", "role": "AI Research Lead"}
        ],
        raw_transcript: `Jessica Park: Thanks everyone for joining this follow-up session. After our initial demo, we wanted to dig deeper into your specific use cases and requirements.

Sarah Chen: Absolutely. We have been discussing internally and have some specific questions about the AI capabilities and customization options.

Dr. Amanda Foster: I am excited to dive into the technical details. What are the main use cases you are looking to solve?

Robert Kim: Our biggest challenge is understanding the "why" behind customer feedback. We get a lot of feature requests, but we struggle to understand the underlying business drivers.

Mike Johnson: Exactly. For example, when customers ask for better reporting, we need to know if it is because they are missing specific metrics, or if the current reports are too slow, or if they need different visualizations.

Dr. Amanda Foster: That is a perfect use case for our contextual analysis engine. We can configure it to identify not just what customers are asking for, but the business context and pain points driving those requests.

Sarah Chen: How customizable is the analysis? We have very specific terminology and business concepts in our industry.

Dr. Amanda Foster: Very customizable. We can train domain-specific models using your historical data and terminology. We have done this successfully with several enterprise customers.

Robert Kim: What about integration with our product roadmap? We use Jira for feature planning and would love to automatically link customer insights to specific epics and stories.

Jessica Park: The JIRA integration can create tickets automatically based on insight triggers. For example, if multiple customers mention the same pain point, it can create a feature request with all the relevant customer context.

Sarah Chen: We are also interested in competitive intelligence. Our sales team spends a lot of time trying to understand how we compare to alternatives.

Jessica Park: The competitive analysis feature tracks competitor mentions, identifies win/loss patterns, and highlights differentiation opportunities. It has been a game-changer for our other customers.

Robert Kim: This all sounds exactly like what we need. What would a pilot implementation look like?`
      }
    ];

    // Insert meetings
    const { data: insertedMeetings, error: meetingsError } = await supabase
      .from('meetings')
      .upsert(meetings, { onConflict: 'id' })
      .select('*');

    if (meetingsError) {
      console.error('Error inserting meetings:', meetingsError);
      return NextResponse.json(
        { error: 'Failed to insert meetings', details: meetingsError },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Sample meetings data inserted successfully',
      inserted_customers: customers.length,
      inserted_meetings: insertedMeetings?.length || 0,
      meetings: insertedMeetings
    });

  } catch (error) {
    console.error('Seed meetings API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}