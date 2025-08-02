-- AI Prompts and Templates Database Schema
-- This schema stores all AI prompts, Slack templates, and other message templates used in the application

-- Table for AI prompts (Claude, GPT, etc.)
CREATE TABLE IF NOT EXISTS ai_prompts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- 'Meeting Analysis', 'Product Notifications', etc.
    type TEXT NOT NULL, -- 'ai_analysis', 'slack_template', 'email_template', etc.
    system_instructions TEXT,
    user_prompt_template TEXT NOT NULL,
    variables JSONB DEFAULT '[]'::jsonb, -- Array of variable names like ['company', 'meetingType']
    parameters JSONB DEFAULT '{}'::jsonb, -- AI parameters like temperature, maxTokens, model
    used_in JSONB DEFAULT '[]'::jsonb, -- Array of where it's used
    version TEXT DEFAULT '1.0',
    enabled BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT DEFAULT 'system'
);

-- Table for Slack message templates
CREATE TABLE IF NOT EXISTS slack_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- 'notification', 'approval', 'summary', etc.
    channel TEXT, -- Default channel like '#product-updates'
    message_template TEXT NOT NULL,
    variables JSONB DEFAULT '[]'::jsonb, -- Template variables
    trigger_event TEXT, -- What triggers this template
    webhook_type TEXT, -- 'approvals', 'updates', 'insights', 'content'
    enabled BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT DEFAULT 'system'
);

-- Table for email templates (for future use)
CREATE TABLE IF NOT EXISTS email_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    subject_template TEXT NOT NULL,
    body_template TEXT NOT NULL,
    variables JSONB DEFAULT '[]'::jsonb,
    enabled BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT DEFAULT 'system'
);

-- Table for system messages and notifications (hardcoded strings)
CREATE TABLE IF NOT EXISTS system_messages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- 'error', 'success', 'info', 'validation', etc.
    message_template TEXT NOT NULL,
    variables JSONB DEFAULT '[]'::jsonb,
    context TEXT, -- Where it's used: 'api_response', 'ui_alert', 'log_message', etc.
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT DEFAULT 'system'
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_prompts_category ON ai_prompts(category);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_type ON ai_prompts(type);
CREATE INDEX IF NOT EXISTS idx_ai_prompts_enabled ON ai_prompts(enabled);

CREATE INDEX IF NOT EXISTS idx_slack_templates_category ON slack_templates(category);
CREATE INDEX IF NOT EXISTS idx_slack_templates_channel ON slack_templates(channel);
CREATE INDEX IF NOT EXISTS idx_slack_templates_enabled ON slack_templates(enabled);

CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);
CREATE INDEX IF NOT EXISTS idx_email_templates_enabled ON email_templates(enabled);

CREATE INDEX IF NOT EXISTS idx_system_messages_category ON system_messages(category);
CREATE INDEX IF NOT EXISTS idx_system_messages_context ON system_messages(context);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_ai_prompts_updated_at BEFORE UPDATE ON ai_prompts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_slack_templates_updated_at BEFORE UPDATE ON slack_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_messages_updated_at BEFORE UPDATE ON system_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();