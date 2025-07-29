-- Agents Database Schema
-- This creates the core tables for AI agent management

-- Main agents table
CREATE TABLE IF NOT EXISTS agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  agent_type VARCHAR(100) NOT NULL,
  
  -- Agent Configuration
  model VARCHAR(100) DEFAULT 'gpt-4',
  temperature DECIMAL(3,2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 2000,
  system_prompt TEXT,
  
  -- Capabilities and tools
  capabilities TEXT[],
  tools TEXT[],
  available_functions TEXT[],
  
  -- Integration settings
  webhook_url VARCHAR(500),
  api_endpoint VARCHAR(500),
  auth_method VARCHAR(20) CHECK (auth_method IN ('none', 'api_key', 'bearer', 'basic')),
  auth_token TEXT,
  
  -- Performance metrics
  total_conversations INTEGER DEFAULT 0,
  successful_completions INTEGER DEFAULT 0,
  average_response_time DECIMAL(8,2), -- in milliseconds
  success_rate DECIMAL(5,2) DEFAULT 0.0,
  
  -- Status and metadata
  status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'training', 'error', 'maintenance')) DEFAULT 'inactive',
  version VARCHAR(20) DEFAULT '1.0.0',
  created_by VARCHAR(100),
  tags TEXT[],
  
  -- Business context
  use_cases TEXT[],
  target_audience VARCHAR(500),
  business_value TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE
);

-- Agent conversations and interactions
CREATE TABLE IF NOT EXISTS agent_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  
  -- Conversation details
  conversation_id VARCHAR(255), -- External system ID
  user_id VARCHAR(100),
  channel VARCHAR(50), -- 'web', 'slack', 'api', 'webhook'
  
  -- Message content
  user_message TEXT NOT NULL,
  agent_response TEXT,
  
  -- Metadata
  status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed', 'timeout')) DEFAULT 'pending',
  response_time_ms INTEGER,
  tokens_used INTEGER,
  
  -- Context and variables
  context_data JSONB,
  session_variables JSONB,
  
  -- Quality metrics
  user_feedback INTEGER CHECK (user_feedback IN (1, 2, 3, 4, 5)), -- 1-5 rating
  feedback_comment TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Agent training data and knowledge base
CREATE TABLE IF NOT EXISTS agent_knowledge (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  
  -- Knowledge entry
  title VARCHAR(500),
  content TEXT NOT NULL,
  content_type VARCHAR(50) CHECK (content_type IN ('faq', 'procedure', 'example', 'context', 'policy')) DEFAULT 'context',
  
  -- Organization
  category VARCHAR(100),
  keywords TEXT[],
  priority INTEGER DEFAULT 1, -- 1-10 priority for retrieval
  
  -- Metadata
  source VARCHAR(255), -- Where this knowledge came from
  confidence_score DECIMAL(3,2) DEFAULT 1.0,
  usage_count INTEGER DEFAULT 0,
  
  -- Status and validation
  is_active BOOLEAN DEFAULT true,
  last_verified TIMESTAMP WITH TIME ZONE,
  verified_by VARCHAR(100),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent performance analytics
CREATE TABLE IF NOT EXISTS agent_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  
  -- Time period
  date DATE NOT NULL,
  hour INTEGER CHECK (hour >= 0 AND hour <= 23),
  
  -- Metrics
  conversation_count INTEGER DEFAULT 0,
  successful_responses INTEGER DEFAULT 0,
  failed_responses INTEGER DEFAULT 0,
  average_response_time DECIMAL(8,2),
  total_tokens_used INTEGER DEFAULT 0,
  
  -- Quality metrics
  average_user_rating DECIMAL(3,2),
  positive_feedback_count INTEGER DEFAULT 0,
  negative_feedback_count INTEGER DEFAULT 0,
  
  -- Cost tracking
  estimated_cost DECIMAL(10,4) DEFAULT 0.0000,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(agent_id, date, hour)
);

-- Agent deployment and environment info
CREATE TABLE IF NOT EXISTS agent_deployments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  
  -- Deployment details
  environment VARCHAR(20) CHECK (environment IN ('development', 'staging', 'production')) DEFAULT 'development',
  deployment_url VARCHAR(500),
  health_check_url VARCHAR(500),
  
  -- Configuration
  scaling_config JSONB, -- Auto-scaling settings
  resource_limits JSONB, -- Memory, CPU limits
  
  -- Status
  deployment_status VARCHAR(20) CHECK (deployment_status IN ('deploying', 'active', 'inactive', 'failed', 'maintenance')) DEFAULT 'inactive',
  health_status VARCHAR(20) CHECK (health_status IN ('healthy', 'unhealthy', 'unknown')) DEFAULT 'unknown',
  
  -- Deployment metadata
  deployed_by VARCHAR(100),
  deployment_notes TEXT,
  
  -- Timestamps
  deployed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_health_check TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agents_type ON agents(agent_type);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_created_at ON agents(created_at);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_agent_id ON agent_conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_created_at ON agent_conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_status ON agent_conversations(status);
CREATE INDEX IF NOT EXISTS idx_agent_knowledge_agent_id ON agent_knowledge(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_knowledge_category ON agent_knowledge(category);
CREATE INDEX IF NOT EXISTS idx_agent_analytics_agent_id ON agent_analytics(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_analytics_date ON agent_analytics(date);
CREATE INDEX IF NOT EXISTS idx_agent_deployments_agent_id ON agent_deployments(agent_id);

-- Insert sample agents data
INSERT INTO agents (name, description, agent_type, capabilities, tools, use_cases, target_audience, status) VALUES
('Customer Success Assistant', 'AI-powered assistant that helps customer success teams identify at-risk accounts, suggest engagement strategies, and automate follow-up communications', 'customer-support', 
 ARRAY['customer_health_analysis', 'churn_prediction', 'engagement_recommendations', 'automated_outreach'], 
 ARRAY['hubspot_integration', 'email_automation', 'slack_notifications', 'data_analysis'],
 ARRAY['churn_prevention', 'account_health_monitoring', 'proactive_customer_engagement', 'success_metric_tracking'],
 'Customer Success Managers, Account Managers', 'active'),

('Competitive Intelligence Analyst', 'Specialized agent for monitoring competitor activities, analyzing market trends, and generating competitive insights for strategic decision making', 'research-analysis',
 ARRAY['web_scraping', 'sentiment_analysis', 'trend_identification', 'report_generation'],
 ARRAY['web_crawler', 'news_aggregator', 'social_media_monitor', 'pricing_tracker'],
 ARRAY['competitor_monitoring', 'market_research', 'pricing_analysis', 'threat_assessment'],
 'Product Managers, Marketing Teams, Executive Leadership', 'active'),

('Content Generation Engine', 'Advanced AI agent that creates personalized marketing content, blog posts, email campaigns, and social media content based on customer data and brand guidelines', 'content-creation',
 ARRAY['natural_language_generation', 'brand_voice_matching', 'content_personalization', 'multi_format_output'],
 ARRAY['gpt4_integration', 'template_engine', 'brand_guidelines_db', 'content_scheduler'],
 ARRAY['marketing_automation', 'personalized_campaigns', 'content_scaling', 'brand_consistency'],
 'Marketing Teams, Content Creators, Growth Teams', 'active'),

('Sales Qualification Bot', 'Intelligent lead qualification agent that scores prospects, schedules meetings, and provides sales teams with detailed lead intelligence and conversation starters', 'lead-qualification',
 ARRAY['lead_scoring', 'calendar_integration', 'conversation_intelligence', 'crm_synchronization'],
 ARRAY['calendly_integration', 'hubspot_crm', 'lead_enrichment_apis', 'email_automation'],
 ARRAY['lead_qualification', 'meeting_scheduling', 'sales_intelligence', 'pipeline_optimization'],
 'Sales Development Representatives, Sales Managers', 'inactive'),

('Meeting Intelligence Processor', 'AI agent that processes meeting recordings, extracts action items, identifies key insights, and generates follow-up communications automatically', 'meeting-analysis',
 ARRAY['transcript_analysis', 'action_item_extraction', 'sentiment_analysis', 'automated_follow_up'],
 ARRAY['grain_integration', 'natural_language_processing', 'task_management', 'email_templates'],
 ARRAY['meeting_productivity', 'action_tracking', 'relationship_intelligence', 'communication_automation'],
 'Sales Teams, Customer Success, Product Teams', 'active'),

('Product Feedback Aggregator', 'Specialized agent that collects, categorizes, and analyzes customer feedback from multiple channels to inform product development priorities', 'feedback-analysis',
 ARRAY['feedback_categorization', 'sentiment_analysis', 'priority_scoring', 'trend_identification'],
 ARRAY['multi_channel_integration', 'nlp_processor', 'jira_integration', 'reporting_dashboard'],
 ARRAY['product_development', 'customer_voice_analysis', 'feature_prioritization', 'roadmap_planning'],
 'Product Managers, Engineering Teams, UX Researchers', 'training');

-- Insert sample agent knowledge
INSERT INTO agent_knowledge (agent_id, title, content, content_type, category, keywords, priority) 
SELECT 
  a.id,
  'Customer Health Scoring Guidelines',
  'Customer health should be evaluated based on: 1) Product usage frequency and depth, 2) Support ticket volume and severity, 3) Payment history and billing status, 4) Engagement with customer success communications, 5) Feature adoption rates and time-to-value metrics. A healthy customer typically shows consistent usage, minimal support issues, timely payments, and progressive feature adoption.',
  'procedure',
  'customer_analysis',
  ARRAY['health_scoring', 'churn_prevention', 'customer_success'],
  10
FROM agents a WHERE a.name = 'Customer Success Assistant';

INSERT INTO agent_knowledge (agent_id, title, content, content_type, category, keywords, priority) 
SELECT 
  a.id,
  'Competitive Analysis Framework',
  'When analyzing competitors, focus on: 1) Product features and positioning, 2) Pricing strategies and market positioning, 3) Marketing messages and customer targeting, 4) Recent product launches and announcements, 5) Customer feedback and market reception, 6) Financial performance and funding status. Always verify information from multiple sources and note confidence levels.',
  'procedure',
  'competitive_intelligence',
  ARRAY['competitor_analysis', 'market_research', 'intelligence_gathering'],
  10
FROM agents a WHERE a.name = 'Competitive Intelligence Analyst';

-- Insert sample conversations
INSERT INTO agent_conversations (agent_id, user_message, agent_response, status, response_time_ms, tokens_used, user_feedback) 
SELECT 
  a.id,
  'Can you analyze the health score for Acme Corp and suggest next steps?',
  'Based on the latest data, Acme Corp shows concerning trends: Usage has declined 40% over the past 30 days, they have 3 open high-priority support tickets, and their last payment was 15 days late. I recommend immediate intervention: 1) Schedule executive check-in call within 48 hours, 2) Assign dedicated CSM for next 90 days, 3) Provide additional training resources for their team, 4) Consider temporary discount to address payment concerns. Risk level: HIGH - immediate action required.',
  'completed',
  1850,
  342,
  5
FROM agents a WHERE a.name = 'Customer Success Assistant'
LIMIT 1;

INSERT INTO agent_conversations (agent_id, user_message, agent_response, status, response_time_ms, tokens_used, user_feedback) 
SELECT 
  a.id,
  'What are the latest developments from our main competitor TechFlow?',
  'TechFlow Recent Intelligence Summary (Last 7 days): 1) Announced $50M Series C funding round led by Sequoia Capital, 2) Launched new AI-powered analytics feature directly competing with our Pro tier, 3) Hired former Salesforce VP of Product as Chief Product Officer, 4) Reduced pricing on enterprise plans by 20% (confirmed via 3 sources), 5) Social sentiment trending positive (+15% increase). Threat Level: MEDIUM-HIGH. Recommend monitoring their customer acquisition metrics and preparing competitive response strategy.',
  'completed',
  2200,
  456,
  4
FROM agents a WHERE a.name = 'Competitive Intelligence Analyst'
LIMIT 1;

-- Insert sample analytics data
INSERT INTO agent_analytics (agent_id, date, hour, conversation_count, successful_responses, failed_responses, average_response_time, total_tokens_used, average_user_rating)
SELECT 
  a.id,
  CURRENT_DATE - INTERVAL '1 day',
  generate_series(9, 17), -- Business hours
  floor(random() * 20 + 5)::integer,
  floor(random() * 18 + 4)::integer,
  floor(random() * 2)::integer,
  (random() * 1000 + 800)::decimal(8,2),
  floor(random() * 500 + 200)::integer,
  (random() * 1.5 + 3.5)::decimal(3,2)
FROM agents a, generate_series(9, 17) hour
WHERE a.status = 'active';

-- Insert sample deployments
INSERT INTO agent_deployments (agent_id, environment, deployment_status, health_status, deployed_by)
SELECT 
  id,
  CASE 
    WHEN status = 'active' THEN 'production'
    WHEN status = 'training' THEN 'development'
    ELSE 'staging'
  END,
  CASE 
    WHEN status = 'active' THEN 'active'
    ELSE 'inactive'
  END,
  CASE 
    WHEN status = 'active' THEN 'healthy'
    ELSE 'unknown'
  END,
  'system'
FROM agents;

-- Add update triggers
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agent_knowledge_updated_at BEFORE UPDATE ON agent_knowledge FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agent_deployments_updated_at BEFORE UPDATE ON agent_deployments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();