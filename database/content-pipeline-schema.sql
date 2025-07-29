-- Content Pipeline Database Schema
-- This schema supports the complete content generation and management pipeline

-- Content Templates table
CREATE TABLE IF NOT EXISTS content_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_name TEXT NOT NULL,
    template_type TEXT NOT NULL,
    template_category TEXT NOT NULL,
    template_description TEXT,
    template_content TEXT NOT NULL,
    template_variables JSONB DEFAULT '{}',
    required_data_sources TEXT[] DEFAULT '{}',
    target_audience TEXT DEFAULT 'prospects',
    content_format TEXT DEFAULT 'markdown',
    approval_required BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    validation_score DECIMAL(3,2),
    validation_metadata JSONB DEFAULT '{}',
    created_by TEXT DEFAULT 'system',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Generated Content table
CREATE TABLE IF NOT EXISTS generated_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID REFERENCES content_templates(id),
    content_title TEXT NOT NULL,
    content_description TEXT,
    generated_content TEXT NOT NULL,
    content_type TEXT NOT NULL,
    content_format TEXT DEFAULT 'markdown',
    source_data JSONB DEFAULT '{}',
    generation_metadata JSONB DEFAULT '{}',
    target_audience TEXT DEFAULT 'prospects',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'under_review', 'approved', 'published', 'archived')),
    quality_score DECIMAL(3,2),
    readability_score DECIMAL(3,2),
    seo_score DECIMAL(3,2),
    engagement_prediction DECIMAL(3,2),
    word_count INTEGER DEFAULT 0,
    character_count INTEGER DEFAULT 0,
    estimated_reading_time INTEGER DEFAULT 0,
    keywords TEXT[] DEFAULT '{}',
    tldr_summary TEXT,
    tldr_bullet_points TEXT[] DEFAULT '{}',
    tldr_key_takeaways TEXT[] DEFAULT '{}',
    tldr_action_items TEXT[] DEFAULT '{}',
    tldr_compression_ratio DECIMAL(4,2),
    tldr_reading_time INTEGER,
    tldr_confidence_score DECIMAL(3,2),
    published_at TIMESTAMP WITH TIME ZONE,
    final_quality_score DECIMAL(3,2),
    workflow_id TEXT,
    created_by TEXT DEFAULT 'Content Generation Engine',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Content Data Sources linking table
CREATE TABLE IF NOT EXISTS content_data_sources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID REFERENCES generated_content(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL,
    source_id UUID NOT NULL,
    source_table TEXT NOT NULL,
    data_excerpt TEXT,
    relevance_score DECIMAL(3,2) DEFAULT 0.8,
    usage_context TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Content Campaign Assignments table
CREATE TABLE IF NOT EXISTS content_campaign_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID NOT NULL,
    content_id UUID REFERENCES generated_content(id) ON DELETE CASCADE,
    assignment_role TEXT DEFAULT 'primary_content',
    sequence_order INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Content Approval Workflow table
CREATE TABLE IF NOT EXISTS content_approval_workflow (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID REFERENCES generated_content(id) ON DELETE CASCADE,
    workflow_stage TEXT NOT NULL,
    reviewer_email TEXT NOT NULL,
    reviewer_name TEXT NOT NULL,
    review_status TEXT DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected', 'changes_requested')),
    priority_level TEXT DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'urgent')),
    due_date TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Pipeline Execution Logs table
CREATE TABLE IF NOT EXISTS pipeline_execution_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pipeline_id TEXT NOT NULL,
    execution_time INTEGER NOT NULL,
    content_id UUID REFERENCES generated_content(id),
    quality_score DECIMAL(3,2),
    ai_enhanced BOOLEAN DEFAULT false,
    data_sources_used TEXT[] DEFAULT '{}',
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Content Analytics table
CREATE TABLE IF NOT EXISTS content_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID REFERENCES generated_content(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(10,2),
    metric_data JSONB DEFAULT '{}',
    measurement_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Content Feedback table
CREATE TABLE IF NOT EXISTS content_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID REFERENCES generated_content(id) ON DELETE CASCADE,
    feedback_type TEXT NOT NULL CHECK (feedback_type IN ('rating', 'comment', 'suggestion', 'issue')),
    feedback_value TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback_source TEXT DEFAULT 'internal',
    submitted_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Content Versions table (for version control)
CREATE TABLE IF NOT EXISTS content_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID REFERENCES generated_content(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content_snapshot TEXT NOT NULL,
    changes_summary TEXT,
    change_type TEXT DEFAULT 'edit' CHECK (change_type IN ('create', 'edit', 'approve', 'publish', 'archive')),
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Content Performance Metrics table
CREATE TABLE IF NOT EXISTS content_performance_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_id UUID REFERENCES generated_content(id) ON DELETE CASCADE,
    views INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    time_on_page INTEGER DEFAULT 0,
    social_shares INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_content_templates_type ON content_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_content_templates_category ON content_templates(template_category);
CREATE INDEX IF NOT EXISTS idx_content_templates_active ON content_templates(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_generated_content_template ON generated_content(template_id);
CREATE INDEX IF NOT EXISTS idx_generated_content_status ON generated_content(status);
CREATE INDEX IF NOT EXISTS idx_generated_content_type ON generated_content(content_type);
CREATE INDEX IF NOT EXISTS idx_generated_content_created ON generated_content(created_at);
CREATE INDEX IF NOT EXISTS idx_generated_content_published ON generated_content(published_at) WHERE published_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_content_data_sources_content ON content_data_sources(content_id);
CREATE INDEX IF NOT EXISTS idx_content_data_sources_source ON content_data_sources(source_type, source_id);

CREATE INDEX IF NOT EXISTS idx_content_approval_workflow_content ON content_approval_workflow(content_id);
CREATE INDEX IF NOT EXISTS idx_content_approval_workflow_status ON content_approval_workflow(review_status);
CREATE INDEX IF NOT EXISTS idx_content_approval_workflow_reviewer ON content_approval_workflow(reviewer_email);

CREATE INDEX IF NOT EXISTS idx_pipeline_execution_logs_pipeline ON pipeline_execution_logs(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_execution_logs_created ON pipeline_execution_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_content_analytics_content ON content_analytics(content_id);
CREATE INDEX IF NOT EXISTS idx_content_analytics_metric ON content_analytics(metric_name);
CREATE INDEX IF NOT EXISTS idx_content_analytics_date ON content_analytics(measurement_date);

CREATE INDEX IF NOT EXISTS idx_content_feedback_content ON content_feedback(content_id);
CREATE INDEX IF NOT EXISTS idx_content_feedback_type ON content_feedback(feedback_type);

CREATE INDEX IF NOT EXISTS idx_content_versions_content ON content_versions(content_id);
CREATE INDEX IF NOT EXISTS idx_content_versions_number ON content_versions(content_id, version_number);

CREATE INDEX IF NOT EXISTS idx_content_performance_content ON content_performance_metrics(content_id);

-- Row Level Security (RLS) policies
ALTER TABLE content_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_campaign_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_approval_workflow ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_performance_metrics ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (modify as needed based on your authentication setup)
CREATE POLICY "Allow all operations for authenticated users" ON content_templates FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON generated_content FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON content_data_sources FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON content_campaign_assignments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON content_approval_workflow FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON pipeline_execution_logs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON content_analytics FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON content_feedback FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON content_versions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON content_performance_metrics FOR ALL USING (auth.role() = 'authenticated');

-- Functions and triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_content_templates_updated_at BEFORE UPDATE ON content_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_generated_content_updated_at BEFORE UPDATE ON generated_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_approval_workflow_updated_at BEFORE UPDATE ON content_approval_workflow FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create content version on update
CREATE OR REPLACE FUNCTION create_content_version()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create version if content actually changed
    IF OLD.generated_content IS DISTINCT FROM NEW.generated_content THEN
        INSERT INTO content_versions (
            content_id,
            version_number,
            content_snapshot,
            changes_summary,
            change_type,
            created_by
        ) VALUES (
            NEW.id,
            COALESCE((SELECT MAX(version_number) FROM content_versions WHERE content_id = NEW.id), 0) + 1,
            OLD.generated_content,
            'Content updated',
            'edit',
            NEW.created_by
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_content_version_trigger 
    AFTER UPDATE ON generated_content 
    FOR EACH ROW 
    EXECUTE FUNCTION create_content_version();

-- View for content pipeline analytics
CREATE OR REPLACE VIEW content_pipeline_analytics AS
SELECT 
    DATE_TRUNC('day', gc.created_at) as date,
    gc.template_id,
    ct.template_name,
    ct.template_type,
    COUNT(*) as content_generated,
    AVG(gc.quality_score) as avg_quality_score,
    AVG(gc.readability_score) as avg_readability_score,
    COUNT(CASE WHEN gc.status = 'published' THEN 1 END) as published_count,
    COUNT(CASE WHEN gc.status = 'approved' THEN 1 END) as approved_count,
    AVG(gc.word_count) as avg_word_count,
    AVG(gc.estimated_reading_time) as avg_reading_time
FROM generated_content gc
JOIN content_templates ct ON gc.template_id = ct.id
GROUP BY DATE_TRUNC('day', gc.created_at), gc.template_id, ct.template_name, ct.template_type
ORDER BY date DESC;

-- View for content approval status
CREATE OR REPLACE VIEW content_approval_status AS
SELECT 
    gc.id as content_id,
    gc.content_title,
    gc.status as content_status,
    STRING_AGG(caw.workflow_stage, ', ' ORDER BY caw.created_at) as workflow_stages,
    STRING_AGG(caw.review_status, ', ' ORDER BY caw.created_at) as review_statuses,
    COUNT(caw.id) as approval_steps,
    COUNT(CASE WHEN caw.review_status = 'approved' THEN 1 END) as approved_steps,
    COUNT(CASE WHEN caw.review_status = 'pending' THEN 1 END) as pending_steps,
    gc.created_at,
    MAX(caw.due_date) as latest_due_date
FROM generated_content gc
LEFT JOIN content_approval_workflow caw ON gc.id = caw.content_id
GROUP BY gc.id, gc.content_title, gc.status, gc.created_at;

-- Sample data insertion (optional)
-- Insert built-in templates
INSERT INTO content_templates (template_name, template_type, template_category, template_description, template_content, template_variables, target_audience) VALUES
('Customer Success Story', 'case_study', 'customer_advocacy', 'Template for creating customer success stories from meeting insights', '# Customer Success Story: {{customer_name}}

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
'prospects')
ON CONFLICT DO NOTHING;

INSERT INTO content_templates (template_name, template_type, template_category, template_description, template_content, template_variables, target_audience) VALUES
('Competitive Battle Card', 'battle_card', 'competitive_intelligence', 'Template for creating competitive battle cards from intelligence signals', '# Battle Card: {{competitor_name}}

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
'internal_team')
ON CONFLICT DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE content_templates IS 'Stores reusable content templates for automated generation';
COMMENT ON TABLE generated_content IS 'Stores all generated content with quality metrics and metadata';
COMMENT ON TABLE content_data_sources IS 'Links generated content to source data used in generation';
COMMENT ON TABLE content_approval_workflow IS 'Manages content approval processes and workflow stages';
COMMENT ON TABLE pipeline_execution_logs IS 'Logs all pipeline executions for monitoring and analytics';
COMMENT ON TABLE content_analytics IS 'Stores custom analytics metrics for content performance';
COMMENT ON TABLE content_feedback IS 'Collects feedback on generated content quality and effectiveness';
COMMENT ON TABLE content_versions IS 'Maintains version history of content changes';
COMMENT ON TABLE content_performance_metrics IS 'Tracks standard performance metrics for published content';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Content Pipeline Database Schema created successfully!';
    RAISE NOTICE 'Tables created: content_templates, generated_content, content_data_sources, content_campaign_assignments, content_approval_workflow, pipeline_execution_logs, content_analytics, content_feedback, content_versions, content_performance_metrics';
    RAISE NOTICE 'Views created: content_pipeline_analytics, content_approval_status';
    RAISE NOTICE 'Sample templates inserted for case_study and battle_card';
END $$;