-- ===========================================
-- Marketing Content Schema
-- For automated content generation from customer insights
-- ===========================================

-- Content Templates table - Reusable templates for different content types
CREATE TABLE content_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name VARCHAR(255) NOT NULL,
    template_type VARCHAR(100) NOT NULL CHECK (template_type IN ('case_study', 'blog_post', 'email_campaign', 'social_media', 'press_release', 'whitepaper', 'webinar', 'talk_track', 'battle_card', 'one_pager', 'product_update', 'changelog', 'feature_announcement', 'customer_story', 'testimonial', 'demo_script', 'sales_deck', 'proposal_template')),
    template_category VARCHAR(100) CHECK (template_category IN ('sales_enablement', 'marketing_campaign', 'customer_success', 'product_marketing', 'thought_leadership', 'competitive_intelligence', 'customer_advocacy', 'demand_generation')),
    template_description TEXT,
    template_content TEXT NOT NULL,
    template_variables JSONB DEFAULT '{}',
    required_data_sources TEXT[] DEFAULT '{}',
    target_audience VARCHAR(100) CHECK (target_audience IN ('prospects', 'customers', 'partners', 'internal_team', 'executives', 'developers', 'end_users', 'analysts', 'media', 'investors')),
    content_format VARCHAR(50) CHECK (content_format IN ('markdown', 'html', 'plain_text', 'json', 'xml', 'pdf_template', 'presentation')),
    approval_required BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    version_number INTEGER DEFAULT 1,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(template_name, version_number)
);

-- Generated Content table - Content generated from templates
CREATE TABLE generated_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES content_templates(id) ON DELETE CASCADE,
    content_title VARCHAR(500) NOT NULL,
    content_description TEXT,
    generated_content TEXT NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    content_format VARCHAR(50) NOT NULL,
    source_data JSONB DEFAULT '{}',
    generation_metadata JSONB DEFAULT '{}',
    target_audience VARCHAR(100),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'under_review', 'approved', 'published', 'archived', 'rejected')),
    quality_score DECIMAL(3,2) DEFAULT 0.0 CHECK (quality_score >= 0 AND quality_score <= 1),
    readability_score DECIMAL(3,2) DEFAULT 0.0 CHECK (readability_score >= 0 AND readability_score <= 1),
    seo_score DECIMAL(3,2) DEFAULT 0.0 CHECK (seo_score >= 0 AND seo_score <= 1),
    engagement_prediction DECIMAL(3,2) DEFAULT 0.0 CHECK (engagement_prediction >= 0 AND engagement_prediction <= 1),
    word_count INTEGER DEFAULT 0,
    character_count INTEGER DEFAULT 0,
    estimated_reading_time INTEGER DEFAULT 0,
    keywords TEXT[] DEFAULT '{}',
    hashtags TEXT[] DEFAULT '{}',
    call_to_action TEXT,
    publication_channels TEXT[] DEFAULT '{}',
    scheduled_publish_date TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    published_url VARCHAR(1000),
    created_by VARCHAR(255),
    reviewed_by VARCHAR(255),
    approved_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Content Data Sources table - Link content to source data
CREATE TABLE content_data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES generated_content(id) ON DELETE CASCADE,
    source_type VARCHAR(100) NOT NULL CHECK (source_type IN ('customer_meeting', 'customer_insight', 'competitive_signal', 'product_update', 'market_research', 'customer_feedback', 'support_ticket', 'survey_response', 'interview_transcript', 'user_behavior_data')),
    source_id UUID NOT NULL,
    source_table VARCHAR(100) NOT NULL,
    data_excerpt TEXT,
    relevance_score DECIMAL(3,2) DEFAULT 0.5 CHECK (relevance_score >= 0 AND relevance_score <= 1),
    usage_context TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Content Approval Workflow table - Track approval process
CREATE TABLE content_approval_workflow (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES generated_content(id) ON DELETE CASCADE,
    workflow_stage VARCHAR(100) NOT NULL CHECK (workflow_stage IN ('content_review', 'legal_review', 'brand_review', 'technical_review', 'executive_approval', 'final_approval')),
    reviewer_email VARCHAR(255),
    reviewer_name VARCHAR(255),
    review_status VARCHAR(50) DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected', 'needs_revision')),
    review_comments TEXT,
    review_date TIMESTAMP WITH TIME ZONE,
    requested_changes TEXT,
    priority_level VARCHAR(50) DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'urgent')),
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Content Performance Metrics table - Track content performance
CREATE TABLE content_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES generated_content(id) ON DELETE CASCADE,
    metric_type VARCHAR(100) NOT NULL CHECK (metric_type IN ('page_views', 'unique_visitors', 'time_on_page', 'bounce_rate', 'conversion_rate', 'download_count', 'share_count', 'like_count', 'comment_count', 'click_through_rate', 'open_rate', 'engagement_rate', 'lead_generation', 'pipeline_impact', 'revenue_attribution')),
    metric_value DECIMAL(15,4) NOT NULL,
    metric_unit VARCHAR(50) DEFAULT 'count',
    measurement_date DATE NOT NULL,
    data_source VARCHAR(100),
    additional_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(content_id, metric_type, measurement_date)
);

-- Content Campaigns table - Group content into campaigns
CREATE TABLE content_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_name VARCHAR(255) NOT NULL,
    campaign_description TEXT,
    campaign_type VARCHAR(100) CHECK (campaign_type IN ('product_launch', 'demand_generation', 'customer_advocacy', 'competitive_response', 'thought_leadership', 'customer_education', 'brand_awareness', 'lead_nurturing', 'retention_campaign')),
    campaign_objective TEXT,
    target_audience VARCHAR(100),
    campaign_budget DECIMAL(15,2),
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'paused', 'completed', 'cancelled')),
    success_metrics JSONB DEFAULT '{}',
    campaign_manager VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Content Campaign Assignments table - Link content to campaigns
CREATE TABLE content_campaign_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES content_campaigns(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES generated_content(id) ON DELETE CASCADE,
    assignment_role VARCHAR(100) CHECK (assignment_role IN ('primary_content', 'supporting_content', 'follow_up_content', 'social_amplification', 'email_sequence', 'landing_page_content')),
    sequence_order INTEGER DEFAULT 1,
    delivery_channel VARCHAR(100),
    scheduled_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(campaign_id, content_id)
);

-- Content Personalization table - Personalized content variations
CREATE TABLE content_personalization (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base_content_id UUID NOT NULL REFERENCES generated_content(id) ON DELETE CASCADE,
    personalization_type VARCHAR(100) NOT NULL CHECK (personalization_type IN ('industry_specific', 'company_size', 'role_based', 'product_interest', 'buyer_journey_stage', 'geographic', 'behavioral', 'demographic')),
    target_segment VARCHAR(255) NOT NULL,
    personalized_content TEXT NOT NULL,
    personalization_variables JSONB DEFAULT '{}',
    effectiveness_score DECIMAL(3,2) DEFAULT 0.0 CHECK (effectiveness_score >= 0 AND effectiveness_score <= 1),
    usage_count INTEGER DEFAULT 0,
    conversion_rate DECIMAL(3,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Content Distribution Channels table - Track where content is published
CREATE TABLE content_distribution_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_name VARCHAR(255) NOT NULL,
    channel_type VARCHAR(100) NOT NULL CHECK (channel_type IN ('website', 'blog', 'email', 'social_media', 'paid_ads', 'webinar', 'podcast', 'video_platform', 'sales_portal', 'customer_portal', 'partner_portal', 'press_release', 'analyst_report', 'event_presentation')),
    channel_url VARCHAR(1000),
    channel_description TEXT,
    target_audience VARCHAR(100),
    content_format_supported TEXT[] DEFAULT '{}',
    publishing_frequency VARCHAR(50),
    approval_required BOOLEAN DEFAULT true,
    automation_enabled BOOLEAN DEFAULT false,
    api_integration_available BOOLEAN DEFAULT false,
    channel_manager VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Content Distribution table - Track content distribution
CREATE TABLE content_distribution (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL REFERENCES generated_content(id) ON DELETE CASCADE,
    channel_id UUID NOT NULL REFERENCES content_distribution_channels(id) ON DELETE CASCADE,
    distribution_status VARCHAR(50) DEFAULT 'scheduled' CHECK (distribution_status IN ('scheduled', 'published', 'failed', 'cancelled')),
    scheduled_date TIMESTAMP WITH TIME ZONE,
    published_date TIMESTAMP WITH TIME ZONE,
    published_url VARCHAR(1000),
    distribution_metadata JSONB DEFAULT '{}',
    engagement_metrics JSONB DEFAULT '{}',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- Indexes for Performance
-- ===========================================

-- Content Templates indexes
CREATE INDEX idx_content_templates_type ON content_templates(template_type);
CREATE INDEX idx_content_templates_category ON content_templates(template_category);
CREATE INDEX idx_content_templates_active ON content_templates(is_active);
CREATE INDEX idx_content_templates_audience ON content_templates(target_audience);

-- Generated Content indexes
CREATE INDEX idx_generated_content_template_id ON generated_content(template_id);
CREATE INDEX idx_generated_content_status ON generated_content(status);
CREATE INDEX idx_generated_content_type ON generated_content(content_type);
CREATE INDEX idx_generated_content_created_at ON generated_content(created_at);
CREATE INDEX idx_generated_content_published_at ON generated_content(published_at);
CREATE INDEX idx_generated_content_quality_score ON generated_content(quality_score);
CREATE INDEX idx_generated_content_keywords ON generated_content USING GIN(keywords);

-- Content Data Sources indexes
CREATE INDEX idx_content_data_sources_content_id ON content_data_sources(content_id);
CREATE INDEX idx_content_data_sources_source_type ON content_data_sources(source_type);
CREATE INDEX idx_content_data_sources_source_id ON content_data_sources(source_id);
CREATE INDEX idx_content_data_sources_relevance_score ON content_data_sources(relevance_score);

-- Content Approval Workflow indexes
CREATE INDEX idx_content_approval_workflow_content_id ON content_approval_workflow(content_id);
CREATE INDEX idx_content_approval_workflow_stage ON content_approval_workflow(workflow_stage);
CREATE INDEX idx_content_approval_workflow_status ON content_approval_workflow(review_status);
CREATE INDEX idx_content_approval_workflow_reviewer ON content_approval_workflow(reviewer_email);
CREATE INDEX idx_content_approval_workflow_due_date ON content_approval_workflow(due_date);

-- Performance Metrics indexes
CREATE INDEX idx_content_performance_metrics_content_id ON content_performance_metrics(content_id);
CREATE INDEX idx_content_performance_metrics_type ON content_performance_metrics(metric_type);
CREATE INDEX idx_content_performance_metrics_date ON content_performance_metrics(measurement_date);

-- Campaign indexes
CREATE INDEX idx_content_campaigns_type ON content_campaigns(campaign_type);
CREATE INDEX idx_content_campaigns_status ON content_campaigns(status);
CREATE INDEX idx_content_campaigns_start_date ON content_campaigns(start_date);
CREATE INDEX idx_content_campaigns_manager ON content_campaigns(campaign_manager);

-- Distribution indexes
CREATE INDEX idx_content_distribution_content_id ON content_distribution(content_id);
CREATE INDEX idx_content_distribution_channel_id ON content_distribution(channel_id);
CREATE INDEX idx_content_distribution_status ON content_distribution(distribution_status);
CREATE INDEX idx_content_distribution_scheduled_date ON content_distribution(scheduled_date);

-- ===========================================
-- Updated At Triggers
-- ===========================================

-- Add updated_at triggers to all tables
CREATE TRIGGER update_content_templates_updated_at 
    BEFORE UPDATE ON content_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generated_content_updated_at 
    BEFORE UPDATE ON generated_content 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_approval_workflow_updated_at 
    BEFORE UPDATE ON content_approval_workflow 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_campaigns_updated_at 
    BEFORE UPDATE ON content_campaigns 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_personalization_updated_at 
    BEFORE UPDATE ON content_personalization 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_distribution_channels_updated_at 
    BEFORE UPDATE ON content_distribution_channels 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_distribution_updated_at 
    BEFORE UPDATE ON content_distribution 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- Useful Views
-- ===========================================

-- Content Pipeline Overview
CREATE VIEW content_pipeline_overview AS
SELECT 
    gc.id,
    gc.content_title,
    gc.content_type,
    gc.status,
    gc.quality_score,
    gc.word_count,
    gc.created_at,
    gc.published_at,
    ct.template_name,
    ct.template_category,
    COUNT(DISTINCT cds.id) as data_sources_count,
    COUNT(DISTINCT caw.id) as approval_steps_count,
    COUNT(DISTINCT cd.id) as distribution_channels_count,
    COALESCE(AVG(cpm.metric_value), 0) as avg_performance_score
FROM generated_content gc
LEFT JOIN content_templates ct ON gc.template_id = ct.id
LEFT JOIN content_data_sources cds ON gc.id = cds.content_id
LEFT JOIN content_approval_workflow caw ON gc.id = caw.content_id
LEFT JOIN content_distribution cd ON gc.id = cd.content_id
LEFT JOIN content_performance_metrics cpm ON gc.id = cpm.content_id
GROUP BY gc.id, gc.content_title, gc.content_type, gc.status, gc.quality_score, gc.word_count, gc.created_at, gc.published_at, ct.template_name, ct.template_category;

-- Content Performance Dashboard
CREATE VIEW content_performance_dashboard AS
SELECT 
    gc.id,
    gc.content_title,
    gc.content_type,
    gc.status,
    gc.published_at,
    cc.campaign_name,
    SUM(CASE WHEN cpm.metric_type = 'page_views' THEN cpm.metric_value ELSE 0 END) as total_page_views,
    SUM(CASE WHEN cpm.metric_type = 'unique_visitors' THEN cpm.metric_value ELSE 0 END) as total_unique_visitors,
    AVG(CASE WHEN cpm.metric_type = 'engagement_rate' THEN cpm.metric_value ELSE 0 END) as avg_engagement_rate,
    SUM(CASE WHEN cpm.metric_type = 'lead_generation' THEN cpm.metric_value ELSE 0 END) as total_leads_generated,
    COUNT(DISTINCT cdc.id) as distribution_channels_count
FROM generated_content gc
LEFT JOIN content_campaign_assignments cca ON gc.id = cca.content_id
LEFT JOIN content_campaigns cc ON cca.campaign_id = cc.id
LEFT JOIN content_performance_metrics cpm ON gc.id = cpm.content_id
LEFT JOIN content_distribution cd ON gc.id = cd.content_id
LEFT JOIN content_distribution_channels cdc ON cd.channel_id = cdc.id
WHERE gc.status = 'published'
GROUP BY gc.id, gc.content_title, gc.content_type, gc.status, gc.published_at, cc.campaign_name;

-- Approval Workflow Status
CREATE VIEW approval_workflow_status AS
SELECT 
    gc.id as content_id,
    gc.content_title,
    gc.status as content_status,
    COUNT(caw.id) as total_approval_steps,
    COUNT(CASE WHEN caw.review_status = 'approved' THEN 1 END) as approved_steps,
    COUNT(CASE WHEN caw.review_status = 'rejected' THEN 1 END) as rejected_steps,
    COUNT(CASE WHEN caw.review_status = 'pending' THEN 1 END) as pending_steps,
    MIN(caw.due_date) as next_due_date,
    MAX(caw.review_date) as last_review_date
FROM generated_content gc
LEFT JOIN content_approval_workflow caw ON gc.id = caw.content_id
WHERE gc.status IN ('under_review', 'approved', 'rejected')
GROUP BY gc.id, gc.content_title, gc.status;

-- ===========================================
-- Row Level Security (RLS) Setup
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE content_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_approval_workflow ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_campaign_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_personalization ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_distribution_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_distribution ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (allow all operations for authenticated users)
CREATE POLICY "Allow authenticated users full access" ON content_templates FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON generated_content FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON content_data_sources FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON content_approval_workflow FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON content_performance_metrics FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON content_campaigns FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON content_campaign_assignments FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON content_personalization FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON content_distribution_channels FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON content_distribution FOR ALL TO authenticated USING (true);

-- ===========================================
-- Sample Data for Testing
-- ===========================================

-- Insert sample content templates
INSERT INTO content_templates (template_name, template_type, template_category, template_description, template_content, template_variables, required_data_sources, target_audience, content_format, created_by)
VALUES 
('Customer Success Story Template', 'case_study', 'customer_advocacy', 'Template for creating customer success stories from meeting insights', 
'# Customer Success Story: {{customer_name}}

## Challenge
{{customer_name}} faced {{challenge_description}} which was impacting {{impact_area}}.

## Solution
Our team worked with {{customer_name}} to implement {{solution_description}}.

## Results
- {{result_1}}
- {{result_2}}
- {{result_3}}

## Quote
"{{customer_quote}}" - {{customer_contact_name}}, {{customer_contact_title}}

## About {{customer_name}}
{{customer_description}}',
'{"customer_name": "string", "challenge_description": "string", "impact_area": "string", "solution_description": "string", "result_1": "string", "result_2": "string", "result_3": "string", "customer_quote": "string", "customer_contact_name": "string", "customer_contact_title": "string", "customer_description": "string"}',
ARRAY['customer_meeting', 'customer_insight'],
'prospects', 'markdown', 'AI System'),

('Competitive Battle Card Template', 'battle_card', 'competitive_intelligence', 'Template for creating competitive battle cards from intelligence signals',
'# Battle Card: {{competitor_name}}

## Overview
{{competitor_description}}

## Key Differentiators
### Our Advantages
- {{our_advantage_1}}
- {{our_advantage_2}}
- {{our_advantage_3}}

### Their Advantages
- {{their_advantage_1}}
- {{their_advantage_2}}

## Pricing Comparison
- Our pricing: {{our_pricing}}
- Their pricing: {{their_pricing}}

## Talk Track
When competing against {{competitor_name}}, emphasize:
1. {{talk_track_point_1}}
2. {{talk_track_point_2}}
3. {{talk_track_point_3}}

## Recent Intelligence
{{recent_intelligence}}

Last Updated: {{last_updated}}',
'{"competitor_name": "string", "competitor_description": "string", "our_advantage_1": "string", "our_advantage_2": "string", "our_advantage_3": "string", "their_advantage_1": "string", "their_advantage_2": "string", "our_pricing": "string", "their_pricing": "string", "talk_track_point_1": "string", "talk_track_point_2": "string", "talk_track_point_3": "string", "recent_intelligence": "string", "last_updated": "string"}',
ARRAY['competitive_signal', 'competitor_features'],
'internal_team', 'markdown', 'AI System'),

('Product Update Email Template', 'email_campaign', 'product_marketing', 'Template for product update emails from JIRA completions',
'Subject: {{product_name}} Update: {{update_title}}

Hi {{customer_name}},

We''ve got some exciting news to share! Based on your feedback and requests, we''ve released {{update_title}}.

## What''s New
{{update_description}}

## How This Helps You
{{customer_benefit}}

## Get Started
{{getting_started_instructions}}

## Questions?
{{support_contact_info}}

Thanks for being a valued customer!

The {{company_name}} Team',
'{"product_name": "string", "update_title": "string", "customer_name": "string", "update_description": "string", "customer_benefit": "string", "getting_started_instructions": "string", "support_contact_info": "string", "company_name": "string"}',
ARRAY['product_update', 'customer_feedback'],
'customers', 'html', 'AI System');

-- Insert sample distribution channels
INSERT INTO content_distribution_channels (channel_name, channel_type, channel_description, target_audience, content_format_supported, publishing_frequency, is_active)
VALUES 
('Company Blog', 'blog', 'Main company blog for thought leadership and customer stories', 'prospects', ARRAY['markdown', 'html'], 'weekly', true),
('Customer Newsletter', 'email', 'Monthly newsletter to existing customers', 'customers', ARRAY['html', 'plain_text'], 'monthly', true),
('LinkedIn Company Page', 'social_media', 'LinkedIn page for professional content sharing', 'prospects', ARRAY['plain_text', 'html'], 'daily', true),
('Sales Portal', 'sales_portal', 'Internal portal for sales team resources', 'internal_team', ARRAY['markdown', 'html', 'pdf_template'], 'as_needed', true),
('Customer Portal', 'customer_portal', 'Customer-facing portal for product updates', 'customers', ARRAY['html', 'markdown'], 'as_needed', true);

-- Insert sample campaign
INSERT INTO content_campaigns (campaign_name, campaign_description, campaign_type, campaign_objective, target_audience, start_date, end_date, status, campaign_manager)
VALUES 
('Q4 Customer Success Campaign', 'Showcase customer success stories and drive demand generation', 'customer_advocacy', 'Generate 50 new leads from customer success content', 'prospects', '2024-10-01', '2024-12-31', 'planning', 'Marketing Team');

COMMENT ON SCHEMA public IS 'Marketing Content Schema - Supports Initiative 3: Marketing Content Pipeline';