# Agents Database Setup

Run this SQL in your Supabase SQL Editor to create the agents tables:

```sql
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
  auth_method VARCHAR(20) CHECK (auth_method IN ('none', 'api_key', 'bearer', 'basic')) DEFAULT 'none',
  auth_token TEXT,
  
  -- Performance metrics
  total_conversations INTEGER DEFAULT 0,
  successful_completions INTEGER DEFAULT 0,
  average_response_time DECIMAL(8,2),
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
  conversation_id VARCHAR(255),
  user_id VARCHAR(100),
  channel VARCHAR(50),
  
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
  user_feedback INTEGER CHECK (user_feedback IN (1, 2, 3, 4, 5)),
  feedback_comment TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Agent deployments
CREATE TABLE IF NOT EXISTS agent_deployments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  
  -- Deployment details
  environment VARCHAR(20) CHECK (environment IN ('development', 'staging', 'production')) DEFAULT 'development',
  deployment_url VARCHAR(500),
  health_check_url VARCHAR(500),
  
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_agents_type ON agents(agent_type);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_agent_id ON agent_conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_deployments_agent_id ON agent_deployments(agent_id);

-- Insert sample agents data
INSERT INTO agents (name, description, agent_type, capabilities, tools, use_cases, target_audience, status, created_by) VALUES
('Customer Success Assistant', 'AI-powered assistant that helps customer success teams identify at-risk accounts, suggest engagement strategies, and automate follow-up communications', 'customer-support', 
 ARRAY['customer_health_analysis', 'churn_prediction', 'engagement_recommendations', 'automated_outreach'], 
 ARRAY['hubspot_integration', 'email_automation', 'slack_notifications', 'data_analysis'],
 ARRAY['churn_prevention', 'account_health_monitoring', 'proactive_customer_engagement', 'success_metric_tracking'],
 'Customer Success Managers, Account Managers', 'active', 'setup'),

('Competitive Intelligence Analyst', 'Specialized agent for monitoring competitor activities, analyzing market trends, and generating competitive insights for strategic decision making', 'research-analysis',
 ARRAY['web_scraping', 'sentiment_analysis', 'trend_identification', 'report_generation'],
 ARRAY['web_crawler', 'news_aggregator', 'social_media_monitor', 'pricing_tracker'],
 ARRAY['competitor_monitoring', 'market_research', 'pricing_analysis', 'threat_assessment'],
 'Product Managers, Marketing Teams, Executive Leadership', 'active', 'setup'),

('Content Generation Engine', 'Advanced AI agent that creates personalized marketing content, blog posts, email campaigns, and social media content based on customer data and brand guidelines', 'content-creation',
 ARRAY['natural_language_generation', 'brand_voice_matching', 'content_personalization', 'multi_format_output'],
 ARRAY['gpt4_integration', 'template_engine', 'brand_guidelines_db', 'content_scheduler'],
 ARRAY['marketing_automation', 'personalized_campaigns', 'content_scaling', 'brand_consistency'],
 'Marketing Teams, Content Creators, Growth Teams', 'active', 'setup'),

('Sales Qualification Bot', 'Intelligent lead qualification agent that scores prospects, schedules meetings, and provides sales teams with detailed lead intelligence and conversation starters', 'lead-qualification',
 ARRAY['lead_scoring', 'calendar_integration', 'conversation_intelligence', 'crm_synchronization'],
 ARRAY['calendly_integration', 'hubspot_crm', 'lead_enrichment_apis', 'email_automation'],
 ARRAY['lead_qualification', 'meeting_scheduling', 'sales_intelligence', 'pipeline_optimization'],
 'Sales Development Representatives, Sales Managers', 'inactive', 'setup'),

('Meeting Intelligence Processor', 'AI agent that processes meeting recordings, extracts action items, identifies key insights, and generates follow-up communications automatically', 'meeting-analysis',
 ARRAY['transcript_analysis', 'action_item_extraction', 'sentiment_analysis', 'automated_follow_up'],
 ARRAY['grain_integration', 'natural_language_processing', 'task_management', 'email_templates'],
 ARRAY['meeting_productivity', 'action_tracking', 'relationship_intelligence', 'communication_automation'],
 'Sales Teams, Customer Success, Product Teams', 'active', 'setup'),

('Product Feedback Aggregator', 'Specialized agent that collects, categorizes, and analyzes customer feedback from multiple channels to inform product development priorities', 'feedback-analysis',
 ARRAY['feedback_categorization', 'sentiment_analysis', 'priority_scoring', 'trend_identification'],
 ARRAY['multi_channel_integration', 'nlp_processor', 'jira_integration', 'reporting_dashboard'],
 ARRAY['product_development', 'customer_voice_analysis', 'feature_prioritization', 'roadmap_planning'],
 'Product Managers, Engineering Teams, UX Researchers', 'training', 'setup');

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
  'setup'
FROM agents;

-- Create update triggers
CREATE TRIGGER update_agents_updated_at 
  BEFORE UPDATE ON agents 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_agent_deployments_updated_at 
  BEFORE UPDATE ON agent_deployments 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```