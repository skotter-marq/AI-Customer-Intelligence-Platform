-- Sample meeting data with realistic content and backdated timestamps
-- This will help test the meetings page display functionality

-- First, let's create some sample customers
INSERT INTO customers (id, company_name, domain, industry, company_size, location, customer_segment, lifecycle_stage)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'TechFlow Solutions', 'techflow.com', 'Technology', '50-100', 'San Francisco, CA', 'Enterprise', 'customer'),
  ('550e8400-e29b-41d4-a716-446655440002', 'DataCorp Analytics', 'datacorp.io', 'Data & Analytics', '100-500', 'New York, NY', 'Enterprise', 'prospect'),
  ('550e8400-e29b-41d4-a716-446655440003', 'StartupX', 'startupx.co', 'Software', '10-50', 'Austin, TX', 'SMB', 'trial')
ON CONFLICT (id) DO NOTHING;

-- Now insert realistic meeting data with backdated timestamps
INSERT INTO meetings (
  id,
  grain_meeting_id,
  customer_id,
  title,
  description,
  meeting_date,
  duration_minutes,
  attendees,
  transcript,
  recording_url,
  meeting_type,
  meeting_status,
  metadata,
  created_at,
  updated_at
) VALUES 
(
  '660e8400-e29b-41d4-a716-446655440001',
  'grain-demo-001',
  '550e8400-e29b-41d4-a716-446655440001',
  'Product Demo - TechFlow Solutions',
  'Initial product demonstration showcasing core analytics features and integration capabilities.',
  '2025-08-05T14:00:00Z',
  45,
  '[
    {"name": "Sarah Chen", "email": "sarah.chen@techflow.com", "role": "VP Engineering", "company": "TechFlow Solutions"},
    {"name": "Mike Johnson", "email": "mike.johnson@techflow.com", "role": "Data Team Lead", "company": "TechFlow Solutions"},
    {"name": "Alex Rodriguez", "email": "alex@ourcompany.com", "role": "Solutions Engineer", "company": "Our Company"},
    {"name": "Jessica Park", "email": "jessica@ourcompany.com", "role": "Account Executive", "company": "Our Company"}
  ]',
  'Sarah Chen: Hi everyone, thanks for taking the time to show us your platform today. We are really excited to see how this could help streamline our customer research process.

Alex Rodriguez: Absolutely, Sarah. Let me start by showing you our dashboard. As you can see, we aggregate all customer touchpoints - meetings, support tickets, feature requests - into a single intelligence layer.

Mike Johnson: This looks really impressive. How does the sentiment analysis work? We have been struggling to get meaningful insights from our customer calls.

Alex Rodriguez: Great question, Mike. Our AI analyzes transcripts in real-time and identifies key themes, pain points, and opportunities. For example, if customers mention competitors or express frustration about specific features, we flag those automatically.

Sarah Chen: That would be incredibly valuable. We currently have someone manually reviewing all our customer calls, which takes forever.

Jessica Park: And the best part is it integrates directly with your existing tools - HubSpot, Jira, Slack. You would not need to change your workflow.

Mike Johnson: What about data privacy and security? We handle sensitive customer information.

Alex Rodriguez: Security is our top priority. All data is encrypted at rest and in transit. We are SOC 2 compliant and can provide detailed security documentation.

Sarah Chen: This looks like exactly what we need. What would be the next steps to move forward?

Jessica Park: I would love to set up a technical deep-dive session with your team next week. We can also start a pilot program to test it with some of your actual customer data.

Mike Johnson: That sounds perfect. We are particularly interested in the JIRA integration and how it handles feature request prioritization.',
  'https://grain.com/recordings/demo-techflow-001',
  'demo',
  'analyzed',
  '{"source": "grain", "recording_quality": "high", "participants_count": 4, "talk_time_distribution": {"Sarah Chen": 25, "Mike Johnson": 20, "Alex Rodriguez": 35, "Jessica Park": 20}}',
  '2025-08-05T14:45:00Z',
  '2025-08-05T15:00:00Z'
),
(
  '660e8400-e29b-41d4-a716-446655440002',
  'grain-qbr-002',
  '550e8400-e29b-41d4-a716-446655440002',
  'Quarterly Business Review - DataCorp Analytics',
  'Q3 business review discussing usage metrics, upcoming features, and renewal discussions.',
  '2025-08-03T10:30:00Z',
  60,
  '[
    {"name": "Jennifer Liu", "email": "jennifer.liu@datacorp.io", "role": "Head of Product", "company": "DataCorp Analytics"},
    {"name": "David Park", "email": "david.park@datacorp.io", "role": "Engineering Manager", "company": "DataCorp Analytics"},
    {"name": "Rachel Green", "email": "rachel@ourcompany.com", "role": "Customer Success Manager", "company": "Our Company"},
    {"name": "Tom Wilson", "email": "tom@ourcompany.com", "role": "Product Manager", "company": "Our Company"}
  ]',
  'Rachel Green: Hi Jennifer, David, great to see you both. Let us dive into your Q3 usage and talk about what is coming up.

Jennifer Liu: Thanks Rachel. Overall, we have been really happy with the platform. Our usage has grown significantly - we are now processing about 200 customer interactions per month.

David Park: The integration with our existing stack has been smooth. The HubSpot sync is working perfectly, and the insights are helping our product team prioritize features.

Tom Wilson: That is fantastic to hear. I want to share some exciting updates we have coming in Q4. We are launching advanced sentiment tracking and competitive intelligence features.

Jennifer Liu: Competitive intelligence sounds interesting. We have been manually tracking what customers say about our competitors, which is time-consuming.

Rachel Green: The new feature will automatically identify competitor mentions and categorize them by threat level and opportunity type. You will get alerts when customers mention switching or comparing alternatives.

David Park: That could be huge for our renewal strategy. We have had a few close calls with customers considering other platforms.

Tom Wilson: Exactly. And the sentiment tracking goes beyond just positive/negative. It identifies specific emotional indicators like frustration, excitement, or confusion around particular features.

Jennifer Liu: How accurate is the sentiment analysis? We have tried other tools that were not very reliable.

Tom Wilson: Our accuracy is around 92% for sentiment classification. We trained the model specifically on B2B customer conversations, which makes a big difference.

David Park: When will these features be available? We are planning our Q4 roadmap and this could influence our priorities.

Rachel Green: Beta access starts next month, with general availability in November. I can get you early access if you are interested in providing feedback.

Jennifer Liu: Absolutely, we would love to be part of the beta. This aligns perfectly with our focus on customer retention for next quarter.',
  'https://grain.com/recordings/qbr-datacorp-002',
  'qbr',
  'analyzed',
  '{"source": "grain", "recording_quality": "high", "participants_count": 4, "meeting_outcome": "renewal_discussion", "next_steps": ["beta_enrollment", "q4_planning"]}',
  '2025-08-03T11:30:00Z',
  '2025-08-03T11:45:00Z'
),
(
  '660e8400-e29b-41d4-a716-446655440003',
  'grain-support-003',
  '550e8400-e29b-41d4-a716-446655440003',
  'Technical Support Call - StartupX Integration Issues',
  'Support escalation to resolve API integration problems affecting data sync.',
  '2025-08-01T16:00:00Z',
  35,
  '[
    {"name": "Carlos Martinez", "email": "carlos@startupx.co", "role": "CTO", "company": "StartupX"},
    {"name": "Lisa Wong", "email": "lisa@startupx.co", "role": "Lead Developer", "company": "StartupX"},
    {"name": "James Cooper", "email": "james@ourcompany.com", "role": "Technical Support Lead", "company": "Our Company"},
    {"name": "Maria Garcia", "email": "maria@ourcompany.com", "role": "Solutions Engineer", "company": "Our Company"}
  ]',
  'Carlos Martinez: Hi James, thanks for jumping on this call. We are having some issues with the API integration that started this morning.

James Cooper: Of course, Carlos. I see the ticket you submitted. Can you walk me through exactly what is happening?

Lisa Wong: Sure, so our data sync process runs every hour to pull customer interaction data. Since about 8 AM this morning, we are getting 429 rate limiting errors, but we have not changed anything on our end.

Maria Garcia: Let me check our rate limiting logs. I can see your requests... it looks like there might be an issue with how the retry logic is handling temporary failures.

Carlos Martinez: We implemented exponential backoff like the documentation suggests, but it seems like the retries are accumulating and hitting the rate limit.

James Cooper: That is a known issue we have been working on. The rate limiting logic was updated last week to be more strict, but we did not anticipate the retry behavior causing problems.

Lisa Wong: This is pretty urgent for us. Our customer dashboard is not updating, and we have a board meeting tomorrow where we need to show current metrics.

Maria Garcia: I completely understand. Let me apply a temporary rate limit exception for your account while we fix the underlying issue.

Carlos Martinez: How long will the permanent fix take? We need to know if we should implement a workaround.

James Cooper: Our engineering team is targeting a fix by end of week. The temporary exception should cover you until then.

Lisa Wong: What about other customers? Are they experiencing the same issue?

Maria Garcia: You are not the only one affected. We have about 5 other customers with similar integration patterns experiencing this. We are treating it as a high-priority bug.

Carlos Martinez: Okay, that makes me feel a bit better. We thought we had messed up our implementation.

James Cooper: Not at all. This is on us. I will make sure to keep you updated on the fix progress and send you a post-mortem when it is resolved.

Lisa Wong: We appreciate the quick response. This kind of support is why we chose your platform.',
  'https://grain.com/recordings/support-startupx-003',
  'support',
  'analyzed',
  '{"source": "grain", "recording_quality": "medium", "issue_type": "api_integration", "severity": "high", "resolution_time_hours": 2, "customer_satisfaction": "high"}',
  '2025-08-01T16:35:00Z',
  '2025-08-01T16:40:00Z'
),
(
  '660e8400-e29b-41d4-a716-446655440004',
  'grain-discovery-004',
  '550e8400-e29b-41d4-a716-446655440001',
  'Discovery Call - TechFlow Advanced Features',
  'Follow-up discovery session to understand advanced automation and analytics requirements.',
  '2025-07-29T13:00:00Z',
  50,
  '[
    {"name": "Sarah Chen", "email": "sarah.chen@techflow.com", "role": "VP Engineering", "company": "TechFlow Solutions"},
    {"name": "Mike Johnson", "email": "mike.johnson@techflow.com", "role": "Data Team Lead", "company": "TechFlow Solutions"},
    {"name": "Robert Kim", "email": "robert.kim@techflow.com", "role": "Product Manager", "company": "TechFlow Solutions"},
    {"name": "Jessica Park", "email": "jessica@ourcompany.com", "role": "Account Executive", "company": "Our Company"},
    {"name": "Dr. Amanda Foster", "email": "amanda@ourcompany.com", "role": "AI Research Lead", "company": "Our Company"}
  ]',
  'Jessica Park: Thanks everyone for joining this follow-up session. After our initial demo, we wanted to dig deeper into your specific use cases and requirements.

Sarah Chen: Absolutely. We have been discussing internally and have some specific questions about the AI capabilities and customization options.

Dr. Amanda Foster: I am excited to dive into the technical details. What are the main use cases you are looking to solve?

Robert Kim: Our biggest challenge is understanding the "why" behind customer feedback. We get a lot of feature requests, but we struggle to understand the underlying business drivers.

Mike Johnson: Exactly. For example, when customers ask for better reporting, we need to know if it is because they are missing specific metrics, or if the current reports are too slow, or if they need different visualizations.

Dr. Amanda Foster: That is a perfect use case for our contextual analysis engine. We can configure it to identify not just what customers are asking for, but the business context and pain points driving those requests.

Sarah Chen: How customizable is the analysis? We have very specific terminology and business concepts in our industry.

Dr. Amanda Foster: Very customizable. We can train domain-specific models using your historical data and terminology. We have done this successfully with several enterprise customers.

Robert Kim: What about integration with our product roadmap? We use Jira for feature planning and would love to automatically link customer insights to specific epics and stories.

Jessica Park: The JIRA integration can create tickets automatically based on insight triggers. For example, if multiple customers mention the same pain point, it can create a feature request with all the relevant customer context.

Mike Johnson: That sounds incredible. How do you handle conflicting feedback? Sometimes customers want opposite things.

Dr. Amanda Foster: The system weights feedback based on various factors - customer tier, revenue impact, strategic importance. You can configure these weightings based on your business priorities.

Sarah Chen: We are also interested in competitive intelligence. Our sales team spends a lot of time trying to understand how we compare to alternatives.

Jessica Park: The competitive analysis feature tracks competitor mentions, identifies win/loss patterns, and highlights differentiation opportunities. It has been a game-changer for our other customers.

Robert Kim: This all sounds exactly like what we need. What would a pilot implementation look like?',
  'https://grain.com/recordings/discovery-techflow-004',
  'discovery',
  'analyzed',
  '{"source": "grain", "recording_quality": "high", "meeting_outcome": "strong_interest", "next_steps": ["pilot_proposal", "technical_deep_dive"], "pain_points": ["feature_prioritization", "competitive_intelligence", "context_understanding"]}',
  '2025-07-29T13:50:00Z',
  '2025-07-29T14:00:00Z'
)
ON CONFLICT (id) DO NOTHING;