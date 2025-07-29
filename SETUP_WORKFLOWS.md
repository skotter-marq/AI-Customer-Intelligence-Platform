# Workflows Database Setup

Run this SQL in your Supabase SQL Editor to create the workflows tables:

```sql
-- Main workflows table
CREATE TABLE IF NOT EXISTS workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  
  -- n8n Integration
  n8n_instance_url VARCHAR(500),
  n8n_workflow_id VARCHAR(100),
  webhook_url VARCHAR(500),
  
  -- Authentication
  auth_method VARCHAR(20) CHECK (auth_method IN ('none', 'api_key', 'basic_auth')) DEFAULT 'none',
  api_key TEXT,
  username VARCHAR(100),
  password TEXT,
  
  -- Configuration
  trigger_type VARCHAR(20) CHECK (trigger_type IN ('webhook', 'schedule', 'manual')) DEFAULT 'webhook',
  status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'error', 'disconnected')) DEFAULT 'inactive',
  timeout INTEGER DEFAULT 120,
  retry_on_failure BOOLEAN DEFAULT true,
  max_retries INTEGER DEFAULT 3,
  
  -- Response handling
  response_mode VARCHAR(30) CHECK (response_mode IN ('last_node', 'respond_to_webhook', 'no_response')) DEFAULT 'last_node',
  response_format VARCHAR(20) CHECK (response_format IN ('json', 'binary', 'first_entry_json', 'all_entries')) DEFAULT 'json',
  
  -- Environment and metadata
  environment VARCHAR(20) CHECK (environment IN ('development', 'staging', 'production')) DEFAULT 'development',
  tags TEXT[],
  created_by VARCHAR(100),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_executed_at TIMESTAMP WITH TIME ZONE
);

-- Workflow executions tracking
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  n8n_execution_id VARCHAR(100),
  
  -- Execution details
  status VARCHAR(20) CHECK (status IN ('running', 'success', 'error', 'waiting', 'canceled')) DEFAULT 'running',
  trigger_data JSONB,
  result_data JSONB,
  error_message TEXT,
  
  -- Performance metrics
  duration_ms INTEGER,
  nodes_executed INTEGER,
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  finished_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_workflows_category ON workflows(category);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);
CREATE INDEX IF NOT EXISTS idx_workflows_n8n_id ON workflows(n8n_workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);

-- Insert sample workflows data
INSERT INTO workflows (name, description, category, trigger_type, status, environment, created_by) VALUES
('Customer Health Analysis Pipeline', 'Comprehensive customer health scoring workflow that analyzes multiple data points including usage patterns, support interactions, and engagement metrics', 'customer-health', 'webhook', 'active', 'production', 'setup'),
('Competitive Intelligence Monitor', 'Automated competitor tracking workflow that monitors pricing changes, product updates, and market movements across multiple sources', 'competitive-intel', 'schedule', 'active', 'production', 'setup'),
('Content Generation Engine', 'AI-powered content creation workflow that generates personalized marketing materials, email campaigns, and customer communications', 'content-generation', 'webhook', 'active', 'staging', 'setup'),
('Advanced Lead Scoring Engine', 'Multi-factor lead scoring workflow with behavioral analysis and predictive modeling to identify high-value prospects', 'automation', 'webhook', 'inactive', 'development', 'setup'),
('Meeting Intelligence Processor', 'Processes meeting transcripts to extract insights, action items, and customer sentiment analysis', 'automation', 'webhook', 'active', 'production', 'setup'),
('Slack Notification Handler', 'Handles various notification types and routes them to appropriate Slack channels with proper formatting', 'automation', 'webhook', 'active', 'production', 'setup');

-- Create update trigger
CREATE TRIGGER update_workflows_updated_at 
  BEFORE UPDATE ON workflows 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```