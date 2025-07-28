-- Meeting Intelligence Database Schema
-- Comprehensive schema for storing Grain meeting data and AI-generated insights

-- Core meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Basic Meeting Info
  grain_meeting_id text UNIQUE NOT NULL,
  title text NOT NULL,
  customer_name text NOT NULL,
  meeting_date timestamp with time zone NOT NULL,
  duration_minutes integer,
  
  -- Meeting Status & Processing
  status text NOT NULL DEFAULT 'recorded', -- recorded, processing, transcribed, analyzed
  processing_stage text DEFAULT 'initial', -- initial, transcribing, analyzing, complete
  
  -- Attendees & Context
  attendees jsonb DEFAULT '[]', -- Array of attendee objects with name, email, role
  organizer_email text,
  meeting_type text, -- demo, qbr, support, discovery, etc.
  
  -- Content & Links
  recording_url text,
  transcript_url text,
  grain_share_url text,
  full_transcript text,
  meeting_summary text,
  
  -- AI Analysis Results
  sentiment_score decimal(3,2), -- -1.0 to 1.0
  sentiment_label text, -- positive, neutral, negative
  confidence_score decimal(3,2), -- 0.0 to 1.0
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  analyzed_at timestamp with time zone,
  
  -- Metadata
  metadata jsonb DEFAULT '{}' -- Store additional Grain metadata
);

-- Meeting insights extracted by AI
CREATE TABLE IF NOT EXISTS meeting_insights (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id uuid REFERENCES meetings(id) ON DELETE CASCADE,
  
  -- Insight Classification
  insight_type text NOT NULL, -- pain_point, feature_request, competitive_mention, positive_feedback, risk_indicator, opportunity
  category text, -- product, support, sales, technical, business
  
  -- Insight Content
  title text NOT NULL,
  description text NOT NULL,
  quote text, -- Exact quote from transcript
  context text, -- Additional context around the quote
  
  -- Scoring & Priority
  importance_score decimal(3,2) DEFAULT 0.5, -- 0.0 to 1.0
  confidence_score decimal(3,2) DEFAULT 0.5, -- 0.0 to 1.0
  priority text DEFAULT 'medium', -- low, medium, high, critical
  
  -- Classification & Tagging
  tags text[] DEFAULT '{}',
  affected_feature text,
  competitor_mentioned text,
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  
  -- AI Metadata
  ai_model_used text,
  processing_version text DEFAULT '1.0'
);

-- Action items extracted from meetings
CREATE TABLE IF NOT EXISTS meeting_action_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id uuid REFERENCES meetings(id) ON DELETE CASCADE,
  
  -- Action Item Details
  description text NOT NULL,
  assigned_to text,
  due_date date,
  status text DEFAULT 'open', -- open, in_progress, completed, cancelled
  
  -- Priority & Classification
  priority text DEFAULT 'medium', -- low, medium, high, critical
  category text, -- follow_up, technical, sales, support
  
  -- Tracking
  created_from_ai boolean DEFAULT true,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Key topics discussed in meetings
CREATE TABLE IF NOT EXISTS meeting_topics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id uuid REFERENCES meetings(id) ON DELETE CASCADE,
  
  -- Topic Information
  topic text NOT NULL,
  topic_category text, -- product, pricing, competition, support, integration
  mentions_count integer DEFAULT 1,
  
  -- Relevance & Context
  relevance_score decimal(3,2) DEFAULT 0.5, -- How relevant/important this topic was
  sentiment_score decimal(3,2), -- Sentiment specifically about this topic
  first_mentioned_at text, -- Timestamp in transcript when first mentioned
  
  -- Keywords & Context
  keywords text[] DEFAULT '{}',
  context_snippets text[] DEFAULT '{}', -- Relevant quotes about this topic
  
  created_at timestamp with time zone DEFAULT now()
);

-- Meeting participants with roles and engagement
CREATE TABLE IF NOT EXISTS meeting_participants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id uuid REFERENCES meetings(id) ON DELETE CASCADE,
  
  -- Participant Info
  name text NOT NULL,
  email text,
  company text,
  role text, -- customer, sales, support, product, technical
  is_internal boolean DEFAULT false,
  
  -- Engagement Metrics
  talk_time_percentage decimal(5,2),
  questions_asked integer DEFAULT 0,
  sentiment_score decimal(3,2),
  engagement_level text, -- high, medium, low
  
  created_at timestamp with time zone DEFAULT now()
);

-- Feature requests detected in meetings
CREATE TABLE IF NOT EXISTS meeting_feature_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id uuid REFERENCES meetings(id) ON DELETE CASCADE,
  insight_id uuid REFERENCES meeting_insights(id) ON DELETE CASCADE,
  
  -- Feature Request Details
  feature_title text NOT NULL,
  feature_description text NOT NULL,
  business_value text,
  urgency text DEFAULT 'medium', -- low, medium, high, critical
  
  -- Customer Context
  customer_pain_point text,
  current_workaround text,
  estimated_impact text, -- How many users would benefit
  
  -- Status & Tracking
  status text DEFAULT 'identified', -- identified, evaluating, planned, in_development, released
  jira_ticket_key text, -- Link to created JIRA ticket
  created_jira_ticket boolean DEFAULT false,
  
  -- Priority & Scoring
  customer_priority text DEFAULT 'medium',
  internal_priority text,
  feasibility_score decimal(3,2),
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Competitive mentions and intelligence
CREATE TABLE IF NOT EXISTS meeting_competitive_intel (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id uuid REFERENCES meetings(id) ON DELETE CASCADE,
  
  -- Competitor Information
  competitor_name text NOT NULL,
  mention_type text NOT NULL, -- comparison, consideration, switching, lost_to, won_against
  context text NOT NULL, -- What was said about the competitor
  
  -- Analysis
  sentiment text, -- positive, negative, neutral
  threat_level text DEFAULT 'medium', -- low, medium, high, critical
  opportunity_type text, -- win_back, differentiate, feature_gap, pricing
  
  -- Customer Intent
  customer_intent text, -- considering, evaluating, switching, comparing
  decision_timeline text, -- immediate, 30_days, 90_days, future
  
  -- Metadata
  quote text, -- Exact quote mentioning competitor
  created_at timestamp with time zone DEFAULT now()
);

-- Meeting outcomes and follow-ups
CREATE TABLE IF NOT EXISTS meeting_outcomes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id uuid REFERENCES meetings(id) ON DELETE CASCADE,
  
  -- Outcome Classification
  outcome_type text NOT NULL, -- deal_progression, support_resolution, feature_demo, discovery
  outcome_result text, -- positive, negative, neutral, needs_follow_up
  
  -- Business Impact
  deal_stage_change text, -- moved to next stage, stalled, closed_won, closed_lost
  next_steps text[] DEFAULT '{}',
  follow_up_required boolean DEFAULT false,
  follow_up_date date,
  
  -- Customer Health Indicators
  customer_satisfaction text, -- very_satisfied, satisfied, neutral, dissatisfied, very_dissatisfied
  churn_risk_indicator text, -- low, medium, high
  expansion_opportunity boolean DEFAULT false,
  
  created_at timestamp with time zone DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meetings_customer_name ON meetings(customer_name);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(meeting_date DESC);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);
CREATE INDEX IF NOT EXISTS idx_meetings_grain_id ON meetings(grain_meeting_id);

CREATE INDEX IF NOT EXISTS idx_insights_meeting_id ON meeting_insights(meeting_id);
CREATE INDEX IF NOT EXISTS idx_insights_type ON meeting_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_insights_priority ON meeting_insights(priority);
CREATE INDEX IF NOT EXISTS idx_insights_importance ON meeting_insights(importance_score DESC);

CREATE INDEX IF NOT EXISTS idx_action_items_meeting_id ON meeting_action_items(meeting_id);
CREATE INDEX IF NOT EXISTS idx_action_items_status ON meeting_action_items(status);
CREATE INDEX IF NOT EXISTS idx_action_items_due_date ON meeting_action_items(due_date);

CREATE INDEX IF NOT EXISTS idx_topics_meeting_id ON meeting_topics(meeting_id);
CREATE INDEX IF NOT EXISTS idx_topics_category ON meeting_topics(topic_category);

CREATE INDEX IF NOT EXISTS idx_feature_requests_meeting_id ON meeting_feature_requests(meeting_id);
CREATE INDEX IF NOT EXISTS idx_feature_requests_status ON meeting_feature_requests(status);
CREATE INDEX IF NOT EXISTS idx_feature_requests_urgency ON meeting_feature_requests(urgency);

CREATE INDEX IF NOT EXISTS idx_competitive_meeting_id ON meeting_competitive_intel(meeting_id);
CREATE INDEX IF NOT EXISTS idx_competitive_competitor ON meeting_competitive_intel(competitor_name);
CREATE INDEX IF NOT EXISTS idx_competitive_threat ON meeting_competitive_intel(threat_level);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_meetings_updated_at 
    BEFORE UPDATE ON meetings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_action_items_updated_at 
    BEFORE UPDATE ON meeting_action_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_requests_updated_at 
    BEFORE UPDATE ON meeting_feature_requests 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_feature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_competitive_intel ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_outcomes ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all meeting data
CREATE POLICY "Allow authenticated users to read meetings" ON meetings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read insights" ON meeting_insights
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read action items" ON meeting_action_items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read topics" ON meeting_topics
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read participants" ON meeting_participants
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read feature requests" ON meeting_feature_requests
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read competitive intel" ON meeting_competitive_intel
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read outcomes" ON meeting_outcomes
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert/update meeting data (for webhooks and internal processing)
CREATE POLICY "Allow authenticated users to insert meetings" ON meetings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update meetings" ON meetings
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Similar policies for other tables
CREATE POLICY "Allow authenticated users to insert insights" ON meeting_insights
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert action items" ON meeting_action_items
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert topics" ON meeting_topics
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert participants" ON meeting_participants
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert feature requests" ON meeting_feature_requests
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert competitive intel" ON meeting_competitive_intel
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert outcomes" ON meeting_outcomes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Insert sample data for testing
INSERT INTO meetings (
  grain_meeting_id,
  title,
  customer_name,
  meeting_date,
  duration_minutes,
  status,
  attendees,
  meeting_type,
  recording_url,
  transcript_url,
  grain_share_url,
  meeting_summary,
  sentiment_score,
  sentiment_label,
  confidence_score,
  metadata
) VALUES 
(
  'grain-meeting-001',
  'Product Demo - MarketingCorp',
  'MarketingCorp',
  '2024-01-15T14:00:00Z',
  45,
  'analyzed',
  '[
    {"name": "John Smith", "email": "john@marketingcorp.com", "role": "customer", "company": "MarketingCorp"},
    {"name": "Sarah Johnson", "email": "sarah@company.com", "role": "sales", "company": "Internal"},
    {"name": "Mike Chen", "email": "mike@company.com", "role": "product", "company": "Internal"}
  ]',
  'demo',
  'https://grain.com/recordings/meeting-001',
  'https://grain.com/transcripts/meeting-001',
  'https://grain.com/share/meeting-001',
  'Successful product demonstration with strong interest in enterprise features. Customer showed particular interest in automation capabilities and integration options.',
  0.75,
  'positive',
  0.92,
  '{
    "grain_meeting_type": "scheduled",
    "grain_workspace": "sales-team",
    "recording_duration": 2700
  }'
),
(
  'grain-meeting-002',
  'Quarterly Business Review - TechStart Inc',
  'TechStart Inc',
  '2024-01-14T10:30:00Z',
  60,
  'analyzed',
  '[
    {"name": "Lisa Wong", "email": "lisa@techstart.com", "role": "customer", "company": "TechStart Inc"},
    {"name": "David Miller", "email": "david@company.com", "role": "customer_success", "company": "Internal"},
    {"name": "Jennifer Park", "email": "jennifer@company.com", "role": "support", "company": "Internal"}
  ]',
  'qbr',
  'https://grain.com/recordings/meeting-002',
  'https://grain.com/transcripts/meeting-002',
  'https://grain.com/share/meeting-002',
  'Regular quarterly review discussing usage metrics and upcoming needs. Customer expressed some concerns about recent feature changes but overall satisfied.',
  0.25,
  'neutral',
  0.88,
  '{
    "grain_meeting_type": "scheduled",
    "grain_workspace": "customer-success",
    "recording_duration": 3600
  }'
),
(
  'grain-meeting-003',
  'Support Escalation - DataFlow Systems',
  'DataFlow Systems',
  '2024-01-16T16:00:00Z',
  30,
  'analyzed',
  '[
    {"name": "Robert Chen", "email": "robert@dataflow.com", "role": "customer", "company": "DataFlow Systems"},
    {"name": "Alice Cooper", "email": "alice@company.com", "role": "support", "company": "Internal"},
    {"name": "Tom Rodriguez", "email": "tom@company.com", "role": "technical", "company": "Internal"}
  ]',
  'support',
  'https://grain.com/recordings/meeting-003',
  'https://grain.com/transcripts/meeting-003',
  'https://grain.com/share/meeting-003',
  'Technical support call to resolve integration issues. Customer frustrated with recent API changes affecting their production system.',
  -0.45,
  'negative',
  0.91,
  '{
    "grain_meeting_type": "scheduled",
    "grain_workspace": "support-team",
    "recording_duration": 1800
  }'
);

-- Insert sample insights
INSERT INTO meeting_insights (
  meeting_id,
  insight_type,
  category,
  title,
  description,
  quote,
  importance_score,
  confidence_score,
  priority,
  tags,
  affected_feature
) VALUES 
(
  (SELECT id FROM meetings WHERE grain_meeting_id = 'grain-meeting-001'),
  'feature_request',
  'product',
  'Advanced Automation Workflows',
  'Customer specifically requested more sophisticated automation capabilities with conditional logic and multi-step workflows.',
  'We really need something more advanced than basic automation. Our team needs conditional workflows that can handle complex scenarios.',
  0.85,
  0.92,
  'high',
  ARRAY['automation', 'workflows', 'enterprise'],
  'workflow_automation'
),
(
  (SELECT id FROM meetings WHERE grain_meeting_id = 'grain-meeting-002'),
  'risk_indicator',
  'business',
  'Feature Rollback Concerns',
  'Customer expressed concerns about recent feature changes and mentioned considering alternatives if issues persist.',
  'The recent changes have really disrupted our workflow. If this continues, we might need to look at other options.',
  0.78,
  0.87,
  'high',
  ARRAY['churn_risk', 'feature_feedback', 'renewal'],
  'dashboard_redesign'
),
(
  (SELECT id FROM meetings WHERE grain_meeting_id = 'grain-meeting-003'),
  'pain_point',
  'technical',
  'API Breaking Changes Impact',
  'Customer production system was broken by recent API changes without sufficient notice or migration path.',
  'Your API changes broke our production system overnight. We had no warning and no migration guide.',
  0.92,
  0.95,
  'critical',
  ARRAY['api', 'breaking_changes', 'production'],
  'api_v2'
);

-- Insert sample action items
INSERT INTO meeting_action_items (
  meeting_id,
  description,
  assigned_to,
  due_date,
  priority,
  category
) VALUES 
(
  (SELECT id FROM meetings WHERE grain_meeting_id = 'grain-meeting-001'),
  'Send enterprise pricing proposal for advanced automation features',
  'sarah@company.com',
  CURRENT_DATE + INTERVAL '3 days',
  'high',
  'sales'
),
(
  (SELECT id FROM meetings WHERE grain_meeting_id = 'grain-meeting-001'),
  'Schedule technical integration call with customer engineering team',
  'mike@company.com',
  CURRENT_DATE + INTERVAL '5 days',
  'medium',
  'technical'
),
(
  (SELECT id FROM meetings WHERE grain_meeting_id = 'grain-meeting-002'),
  'Address feature rollback concerns and provide timeline for fixes',
  'david@company.com',
  CURRENT_DATE + INTERVAL '2 days',
  'high',
  'customer_success'
),
(
  (SELECT id FROM meetings WHERE grain_meeting_id = 'grain-meeting-003'),
  'Create API migration guide and communication plan',
  'tom@company.com',
  CURRENT_DATE + INTERVAL '1 day',
  'critical',
  'technical'
);

-- Insert sample feature requests
INSERT INTO meeting_feature_requests (
  meeting_id,
  insight_id,
  feature_title,
  feature_description,
  business_value,
  urgency,
  customer_pain_point,
  estimated_impact
) VALUES 
(
  (SELECT id FROM meetings WHERE grain_meeting_id = 'grain-meeting-001'),
  (SELECT id FROM meeting_insights WHERE title = 'Advanced Automation Workflows'),
  'Conditional Workflow Logic',
  'Add support for conditional logic in automation workflows with if/then/else statements and multi-branch execution paths.',
  'Enable enterprise customers to automate complex business processes that require decision-making logic.',
  'high',
  'Current automation is too basic for complex enterprise workflows',
  'All enterprise customers (500+ users) would benefit from advanced automation'
);

-- Insert sample competitive intelligence
INSERT INTO meeting_competitive_intel (
  meeting_id,
  competitor_name,
  mention_type,
  context,
  sentiment,
  threat_level,
  customer_intent,
  quote
) VALUES 
(
  (SELECT id FROM meetings WHERE grain_meeting_id = 'grain-meeting-002'),
  'Salesforce',
  'consideration',
  'Customer mentioned evaluating Salesforce as alternative due to recent feature issues',
  'negative',
  'high',
  'evaluating',
  'We are actually looking at Salesforce again because of these recent issues with the dashboard changes.'
);