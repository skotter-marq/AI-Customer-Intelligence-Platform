-- ===========================================
-- Product Updates Schema
-- For tracking JIRA story completions and product communications
-- ===========================================

-- Product Updates table
CREATE TABLE product_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jira_story_key TEXT UNIQUE NOT NULL,
    jira_story_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'published', 'archived')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    assignee TEXT,
    completion_date TIMESTAMP WITH TIME ZONE,
    labels TEXT[] DEFAULT '{}',
    story_points INTEGER,
    jira_metadata JSONB DEFAULT '{}',
    customer_impact_score FLOAT DEFAULT 0,
    communication_channels TEXT[] DEFAULT '{}',
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_product_updates_jira_story_key ON product_updates(jira_story_key);
CREATE INDEX idx_product_updates_status ON product_updates(status);
CREATE INDEX idx_product_updates_priority ON product_updates(priority);
CREATE INDEX idx_product_updates_completion_date ON product_updates(completion_date);
CREATE INDEX idx_product_updates_created_at ON product_updates(created_at);

-- Product Update Communications table
CREATE TABLE product_update_communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_update_id UUID NOT NULL REFERENCES product_updates(id) ON DELETE CASCADE,
    channel TEXT NOT NULL CHECK (channel IN ('email', 'slack', 'in_app', 'changelog', 'blog')),
    recipient_type TEXT NOT NULL CHECK (recipient_type IN ('all_customers', 'affected_customers', 'specific_customers', 'internal_team')),
    recipients JSONB DEFAULT '{}',
    subject TEXT,
    content TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent', 'failed')),
    metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for communications
CREATE INDEX idx_product_update_communications_product_update_id ON product_update_communications(product_update_id);
CREATE INDEX idx_product_update_communications_channel ON product_update_communications(channel);
CREATE INDEX idx_product_update_communications_status ON product_update_communications(status);
CREATE INDEX idx_product_update_communications_sent_at ON product_update_communications(sent_at);

-- Customer Impact Tracking table
CREATE TABLE customer_impact_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_update_id UUID NOT NULL REFERENCES product_updates(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    impact_level TEXT NOT NULL CHECK (impact_level IN ('low', 'medium', 'high')),
    impact_type TEXT NOT NULL CHECK (impact_type IN ('bug_fix', 'feature_enhancement', 'new_feature', 'performance_improvement')),
    notes TEXT,
    notification_sent BOOLEAN DEFAULT false,
    notification_channels TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(product_update_id, customer_id)
);

-- Create indexes for impact tracking
CREATE INDEX idx_customer_impact_tracking_product_update_id ON customer_impact_tracking(product_update_id);
CREATE INDEX idx_customer_impact_tracking_customer_id ON customer_impact_tracking(customer_id);
CREATE INDEX idx_customer_impact_tracking_impact_level ON customer_impact_tracking(impact_level);
CREATE INDEX idx_customer_impact_tracking_impact_type ON customer_impact_tracking(impact_type);

-- ===========================================
-- Updated At Triggers
-- ===========================================

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_product_updates_updated_at 
    BEFORE UPDATE ON product_updates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_update_communications_updated_at 
    BEFORE UPDATE ON product_update_communications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_impact_tracking_updated_at 
    BEFORE UPDATE ON customer_impact_tracking 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- Views for Common Queries
-- ===========================================

-- Product Updates with Customer Impact
CREATE VIEW product_updates_with_impact AS
SELECT 
    pu.*,
    COUNT(cit.id) as affected_customers,
    AVG(CASE cit.impact_level 
        WHEN 'low' THEN 1 
        WHEN 'medium' THEN 2 
        WHEN 'high' THEN 3 
        ELSE 0 
    END) as avg_impact_score
FROM product_updates pu
LEFT JOIN customer_impact_tracking cit ON pu.id = cit.product_update_id
GROUP BY pu.id, pu.jira_story_key, pu.jira_story_id, pu.title, pu.description, pu.status, pu.priority, pu.assignee, pu.completion_date, pu.labels, pu.story_points, pu.jira_metadata, pu.customer_impact_score, pu.communication_channels, pu.published_at, pu.created_at, pu.updated_at;

-- Recent Product Updates
CREATE VIEW recent_product_updates AS
SELECT 
    pu.*,
    COUNT(puc.id) as communications_count,
    COUNT(cit.id) as affected_customers
FROM product_updates pu
LEFT JOIN product_update_communications puc ON pu.id = puc.product_update_id
LEFT JOIN customer_impact_tracking cit ON pu.id = cit.product_update_id
WHERE pu.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY pu.id, pu.jira_story_key, pu.jira_story_id, pu.title, pu.description, pu.status, pu.priority, pu.assignee, pu.completion_date, pu.labels, pu.story_points, pu.jira_metadata, pu.customer_impact_score, pu.communication_channels, pu.published_at, pu.created_at, pu.updated_at
ORDER BY pu.created_at DESC;

-- ===========================================
-- Row Level Security (RLS) Setup
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE product_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_update_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_impact_tracking ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (allow all operations for authenticated users)
CREATE POLICY "Allow authenticated users full access" ON product_updates FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON product_update_communications FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON customer_impact_tracking FOR ALL TO authenticated USING (true);

-- ===========================================
-- Sample Data for Testing
-- ===========================================

-- Insert sample product updates
INSERT INTO product_updates (jira_story_key, jira_story_id, title, description, status, priority, assignee, completion_date, labels, story_points)
VALUES 
('PROJ-123', 'story-123', 'Fix dashboard loading performance', 'Resolved slow loading times in customer dashboard', 'published', 'high', 'John Smith', CURRENT_TIMESTAMP - INTERVAL '2 days', ARRAY['performance', 'dashboard', 'customer-impact'], 5),
('PROJ-124', 'story-124', 'Add export functionality to reports', 'Customers can now export reports to Excel and CSV', 'approved', 'medium', 'Jane Doe', CURRENT_TIMESTAMP - INTERVAL '1 day', ARRAY['export', 'reports', 'customer-request'], 3),
('PROJ-125', 'story-125', 'Implement real-time notifications', 'Added email and Slack notifications for threshold alerts', 'pending_review', 'medium', 'Mike Johnson', CURRENT_TIMESTAMP, ARRAY['notifications', 'alerts', 'integrations'], 8);

-- Note: Sample customer impact tracking and communications would be inserted
-- after the customers table is populated with actual data