-- Workflows Database Schema
-- This creates the core tables for n8n workflow management

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
  auth_method VARCHAR(20) CHECK (auth_method IN ('none', 'api_key', 'basic_auth')),
  api_key TEXT,
  username VARCHAR(100),
  password TEXT,
  
  -- Configuration
  trigger_type VARCHAR(20) CHECK (trigger_type IN ('webhook', 'schedule', 'manual')),
  status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'error', 'disconnected')),
  timeout INTEGER DEFAULT 120,
  retry_on_failure BOOLEAN DEFAULT true,
  max_retries INTEGER DEFAULT 3,
  
  -- Response handling
  response_mode VARCHAR(30) CHECK (response_mode IN ('last_node', 'respond_to_webhook', 'no_response')),
  response_format VARCHAR(20) CHECK (response_format IN ('json', 'binary', 'first_entry_json', 'all_entries')),
  
  -- Environment and metadata
  environment VARCHAR(20) CHECK (environment IN ('development', 'staging', 'production')),
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
  status VARCHAR(20) CHECK (status IN ('running', 'success', 'error', 'waiting', 'canceled')),
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

-- Workflow parameters/variables
CREATE TABLE IF NOT EXISTS workflow_parameters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  parameter_name VARCHAR(100) NOT NULL,
  parameter_type VARCHAR(20) CHECK (parameter_type IN ('text', 'number', 'select', 'boolean', 'date')),
  required BOOLEAN DEFAULT false,
  default_value TEXT,
  options TEXT[], -- For select type parameters
  description TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(workflow_id, parameter_name)
);

-- Workflow monitoring and alerts
CREATE TABLE IF NOT EXISTS workflow_monitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  
  -- Monitoring configuration
  monitor_type VARCHAR(30) CHECK (monitor_type IN ('execution_failure', 'execution_timeout', 'execution_success', 'no_executions')),
  threshold_value INTEGER, -- e.g., number of failures, timeout duration
  threshold_period INTEGER, -- in minutes
  is_active BOOLEAN DEFAULT true,
  
  -- Alert configuration
  alert_email VARCHAR(255),
  alert_slack_channel VARCHAR(100),
  alert_webhook_url VARCHAR(500),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_triggered_at TIMESTAMP WITH TIME ZONE
);

-- Connected agents (for workflows that power AI agents)
CREATE TABLE IF NOT EXISTS workflow_agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  agent_name VARCHAR(255) NOT NULL,
  agent_description TEXT,
  agent_capabilities TEXT[],
  
  -- Integration settings
  input_schema JSONB,
  output_schema JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workflows_category ON workflows(category);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);
CREATE INDEX IF NOT EXISTS idx_workflows_n8n_id ON workflows(n8n_workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_started_at ON workflow_executions(started_at);
CREATE INDEX IF NOT EXISTS idx_workflow_parameters_workflow_id ON workflow_parameters(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_monitors_workflow_id ON workflow_monitors(workflow_id);

-- Insert sample workflows data
INSERT INTO workflows (name, description, category, trigger_type, status, environment) VALUES
('Customer Health Analysis Pipeline', 'Comprehensive customer health scoring workflow that analyzes multiple data points including usage patterns, support interactions, and engagement metrics', 'customer-health', 'webhook', 'active', 'production'),
('Competitive Intelligence Monitor', 'Automated competitor tracking workflow that monitors pricing changes, product updates, and market movements across multiple sources', 'competitive-intel', 'schedule', 'active', 'production'),
('Content Generation Engine', 'AI-powered content creation workflow that generates personalized marketing materials, email campaigns, and customer communications', 'content-generation', 'webhook', 'active', 'staging'),
('Advanced Lead Scoring Engine', 'Multi-factor lead scoring workflow with behavioral analysis and predictive modeling to identify high-value prospects', 'lead-management', 'webhook', 'inactive', 'development'),
('Meeting Intelligence Processor', 'Processes meeting transcripts to extract insights, action items, and customer sentiment analysis', 'data-processing', 'webhook', 'active', 'production'),
('Slack Notification Handler', 'Handles various notification types and routes them to appropriate Slack channels with proper formatting', 'notifications', 'webhook', 'active', 'production');

-- Insert sample workflow parameters
INSERT INTO workflow_parameters (workflow_id, parameter_name, parameter_type, required, description) 
SELECT 
  w.id,
  'customer_id',
  'text',
  true,
  'Unique identifier for the customer being analyzed'
FROM workflows w WHERE w.name = 'Customer Health Analysis Pipeline';

INSERT INTO workflow_parameters (workflow_id, parameter_name, parameter_type, required, default_value, description) 
SELECT 
  w.id,
  'analysis_depth',
  'select',
  false,
  'standard',
  'Level of analysis detail'
FROM workflows w WHERE w.name = 'Customer Health Analysis Pipeline';

-- Insert sample workflow monitors
INSERT INTO workflow_monitors (workflow_id, monitor_type, threshold_value, threshold_period, alert_email) 
SELECT 
  w.id,
  'execution_failure',
  3,
  60,
  'alerts@company.com'
FROM workflows w WHERE w.status = 'active';

-- Add update trigger
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflow_parameters_updated_at BEFORE UPDATE ON workflow_parameters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflow_monitors_updated_at BEFORE UPDATE ON workflow_monitors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();