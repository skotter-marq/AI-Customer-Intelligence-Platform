-- ===========================================
-- AI Customer Intelligence Platform
-- Customer Research Schema (T003)
-- ===========================================
-- This schema supports Initiative 1: Customer Research System
-- Handles Grain meeting data, HubSpot integration, and AI insights

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- Core Customer Tables
-- ===========================================

-- Customers table - Central customer information
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    domain VARCHAR(255),
    industry VARCHAR(100),
    company_size VARCHAR(50),
    location VARCHAR(255),
    customer_segment VARCHAR(100),
    lifecycle_stage VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meetings table - Grain meeting recordings and metadata
CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grain_meeting_id VARCHAR(255) UNIQUE,
    customer_id UUID REFERENCES customers(id),
    title VARCHAR(500),
    description TEXT,
    meeting_date TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    attendees JSONB, -- Store attendee information as JSON
    transcript TEXT,
    recording_url VARCHAR(1000),
    meeting_type VARCHAR(100), -- 'sales', 'support', 'onboarding', etc.
    meeting_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processed', 'analyzed'
    metadata JSONB, -- Additional Grain metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- HubSpot Integration Tables
-- ===========================================

-- HubSpot Contacts - Synchronized contact data
CREATE TABLE hubspot_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hubspot_contact_id VARCHAR(255) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    email VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company VARCHAR(255),
    job_title VARCHAR(255),
    phone VARCHAR(50),
    lifecycle_stage VARCHAR(100),
    lead_status VARCHAR(100),
    properties JSONB, -- All HubSpot contact properties
    last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HubSpot Deals - Deal information and pipeline data
CREATE TABLE hubspot_deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hubspot_deal_id VARCHAR(255) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    deal_name VARCHAR(255),
    deal_stage VARCHAR(100),
    deal_amount DECIMAL(15,2),
    close_date DATE,
    pipeline VARCHAR(100),
    deal_type VARCHAR(100),
    associated_contacts JSONB, -- Array of contact IDs
    properties JSONB, -- All HubSpot deal properties
    last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HubSpot Tickets - Support ticket data
CREATE TABLE hubspot_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hubspot_ticket_id VARCHAR(255) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    ticket_name VARCHAR(255),
    ticket_status VARCHAR(100),
    priority VARCHAR(50),
    category VARCHAR(100),
    source VARCHAR(100),
    created_date TIMESTAMP WITH TIME ZONE,
    closed_date TIMESTAMP WITH TIME ZONE,
    associated_contacts JSONB, -- Array of contact IDs
    properties JSONB, -- All HubSpot ticket properties
    last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- AI Analysis Tables
-- ===========================================

-- Insights - AI-extracted insights from all sources
CREATE TABLE insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id),
    source_type VARCHAR(50) NOT NULL, -- 'meeting', 'hubspot_contact', 'hubspot_deal', 'hubspot_ticket'
    source_id UUID NOT NULL, -- ID of the source record
    insight_type VARCHAR(100) NOT NULL, -- 'pain_point', 'feature_request', 'sentiment', 'opportunity'
    title VARCHAR(500),
    description TEXT,
    sentiment_score DECIMAL(3,2), -- -1.0 to 1.0
    confidence_score DECIMAL(3,2), -- 0.0 to 1.0
    priority VARCHAR(50), -- 'high', 'medium', 'low'
    status VARCHAR(50) DEFAULT 'new', -- 'new', 'reviewed', 'actioned', 'dismissed'
    tags JSONB, -- Array of relevant tags
    ai_metadata JSONB, -- AI processing metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Follow-ups - Recommended follow-up actions
CREATE TABLE follow_ups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id),
    insight_id UUID REFERENCES insights(id),
    action_type VARCHAR(100) NOT NULL, -- 'email', 'call', 'meeting', 'task'
    title VARCHAR(500),
    description TEXT,
    priority VARCHAR(50), -- 'high', 'medium', 'low'
    due_date DATE,
    assigned_to VARCHAR(255), -- Email or user ID
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
    metadata JSONB, -- Additional action metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature Requests - Tracked feature requests with customer mapping
CREATE TABLE feature_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- 'integration', 'ui', 'reporting', etc.
    priority VARCHAR(50), -- 'high', 'medium', 'low'
    effort_estimate VARCHAR(50), -- 'small', 'medium', 'large'
    business_value VARCHAR(50), -- 'high', 'medium', 'low'
    status VARCHAR(50) DEFAULT 'submitted', -- 'submitted', 'reviewing', 'planned', 'in_progress', 'completed', 'rejected'
    source_insights JSONB, -- Array of insight IDs that contributed to this request
    votes INTEGER DEFAULT 1, -- Number of customers requesting this
    jira_issue_key VARCHAR(100), -- Link to JIRA if created
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer Correlations - Similar customer patterns and pain points
CREATE TABLE customer_correlations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    primary_customer_id UUID REFERENCES customers(id),
    related_customer_id UUID REFERENCES customers(id),
    correlation_type VARCHAR(100) NOT NULL, -- 'similar_pain_point', 'similar_request', 'similar_profile'
    correlation_score DECIMAL(3,2), -- 0.0 to 1.0
    shared_insights JSONB, -- Array of insight IDs that are similar
    analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- Indexes for Performance
-- ===========================================

-- Customer indexes
CREATE INDEX idx_customers_company_name ON customers(company_name);
CREATE INDEX idx_customers_domain ON customers(domain);
CREATE INDEX idx_customers_segment ON customers(customer_segment);

-- Meeting indexes
CREATE INDEX idx_meetings_customer_id ON meetings(customer_id);
CREATE INDEX idx_meetings_grain_id ON meetings(grain_meeting_id);
CREATE INDEX idx_meetings_date ON meetings(meeting_date);
CREATE INDEX idx_meetings_status ON meetings(meeting_status);

-- HubSpot indexes
CREATE INDEX idx_hubspot_contacts_customer_id ON hubspot_contacts(customer_id);
CREATE INDEX idx_hubspot_contacts_email ON hubspot_contacts(email);
CREATE INDEX idx_hubspot_deals_customer_id ON hubspot_deals(customer_id);
CREATE INDEX idx_hubspot_deals_stage ON hubspot_deals(deal_stage);
CREATE INDEX idx_hubspot_tickets_customer_id ON hubspot_tickets(customer_id);

-- Insight indexes
CREATE INDEX idx_insights_customer_id ON insights(customer_id);
CREATE INDEX idx_insights_type ON insights(insight_type);
CREATE INDEX idx_insights_source ON insights(source_type, source_id);
CREATE INDEX idx_insights_status ON insights(status);
CREATE INDEX idx_insights_priority ON insights(priority);

-- Follow-up indexes
CREATE INDEX idx_follow_ups_customer_id ON follow_ups(customer_id);
CREATE INDEX idx_follow_ups_status ON follow_ups(status);
CREATE INDEX idx_follow_ups_due_date ON follow_ups(due_date);

-- Feature request indexes
CREATE INDEX idx_feature_requests_customer_id ON feature_requests(customer_id);
CREATE INDEX idx_feature_requests_status ON feature_requests(status);
CREATE INDEX idx_feature_requests_priority ON feature_requests(priority);

-- Correlation indexes
CREATE INDEX idx_correlations_primary_customer ON customer_correlations(primary_customer_id);
CREATE INDEX idx_correlations_related_customer ON customer_correlations(related_customer_id);
CREATE INDEX idx_correlations_type ON customer_correlations(correlation_type);

-- ===========================================
-- Useful Views
-- ===========================================

-- Customer insights summary view
CREATE VIEW customer_insights_summary AS
SELECT 
    c.id,
    c.company_name,
    c.customer_segment,
    COUNT(DISTINCT m.id) as total_meetings,
    COUNT(DISTINCT i.id) as total_insights,
    COUNT(DISTINCT CASE WHEN i.insight_type = 'pain_point' THEN i.id END) as pain_points,
    COUNT(DISTINCT CASE WHEN i.insight_type = 'feature_request' THEN i.id END) as feature_requests,
    COUNT(DISTINCT fr.id) as formal_feature_requests,
    COUNT(DISTINCT fu.id) as pending_followups,
    AVG(i.sentiment_score) as avg_sentiment,
    MAX(m.meeting_date) as last_meeting_date,
    MAX(i.created_at) as last_insight_date
FROM customers c
LEFT JOIN meetings m ON c.id = m.customer_id
LEFT JOIN insights i ON c.id = i.customer_id
LEFT JOIN feature_requests fr ON c.id = fr.customer_id
LEFT JOIN follow_ups fu ON c.id = fu.customer_id AND fu.status = 'pending'
GROUP BY c.id, c.company_name, c.customer_segment;

-- Recent insights view
CREATE VIEW recent_insights AS
SELECT 
    i.*,
    c.company_name,
    c.customer_segment,
    CASE 
        WHEN i.source_type = 'meeting' THEN m.title
        WHEN i.source_type = 'hubspot_contact' THEN hc.first_name || ' ' || hc.last_name
        WHEN i.source_type = 'hubspot_deal' THEN hd.deal_name
        WHEN i.source_type = 'hubspot_ticket' THEN ht.ticket_name
        ELSE 'Unknown Source'
    END as source_name
FROM insights i
JOIN customers c ON i.customer_id = c.id
LEFT JOIN meetings m ON i.source_type = 'meeting' AND i.source_id = m.id
LEFT JOIN hubspot_contacts hc ON i.source_type = 'hubspot_contact' AND i.source_id = hc.id
LEFT JOIN hubspot_deals hd ON i.source_type = 'hubspot_deal' AND i.source_id = hd.id
LEFT JOIN hubspot_tickets ht ON i.source_type = 'hubspot_ticket' AND i.source_id = ht.id
ORDER BY i.created_at DESC;

-- ===========================================
-- Row Level Security (RLS) Setup
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hubspot_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hubspot_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE hubspot_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_correlations ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be customized based on your auth requirements)
-- Allow all operations for authenticated users for now
CREATE POLICY "Allow authenticated users full access" ON customers FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON meetings FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON hubspot_contacts FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON hubspot_deals FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON hubspot_tickets FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON insights FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON follow_ups FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON feature_requests FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON customer_correlations FOR ALL TO authenticated USING (true);

-- ===========================================
-- Sample Data for Testing
-- ===========================================

-- Insert sample customer
INSERT INTO customers (company_name, domain, industry, company_size, location, customer_segment, lifecycle_stage)
VALUES 
('Acme Corp', 'acme.com', 'Technology', 'Mid-market', 'San Francisco, CA', 'Enterprise', 'Customer'),
('Beta Industries', 'beta.com', 'Manufacturing', 'Enterprise', 'Chicago, IL', 'Enterprise', 'Opportunity'),
('Gamma Solutions', 'gamma.com', 'Consulting', 'Small Business', 'Austin, TX', 'SMB', 'Lead');

-- Insert sample meeting
INSERT INTO meetings (grain_meeting_id, customer_id, title, description, meeting_date, duration_minutes, attendees, transcript, meeting_type)
VALUES 
('grain_123', (SELECT id FROM customers WHERE company_name = 'Acme Corp'), 
 'Q3 Business Review', 'Quarterly review of platform usage and roadmap discussion', 
 '2024-07-15 14:00:00+00', 60, 
 '[{"name": "John Smith", "email": "john@acme.com", "role": "CTO"}, {"name": "Sarah Johnson", "email": "sarah@ourcompany.com", "role": "Customer Success"}]',
 'Sample transcript would go here...', 'review');

-- Insert sample insight
INSERT INTO insights (customer_id, source_type, source_id, insight_type, title, description, sentiment_score, confidence_score, priority, tags)
VALUES 
((SELECT id FROM customers WHERE company_name = 'Acme Corp'), 
 'meeting', 
 (SELECT id FROM meetings WHERE grain_meeting_id = 'grain_123'),
 'pain_point',
 'Reporting dashboard too slow',
 'Customer mentioned that the reporting dashboard takes 10-15 seconds to load, impacting their daily workflow',
 -0.6, 0.85, 'high', 
 '["performance", "dashboard", "reporting"]');

COMMENT ON SCHEMA public IS 'Customer Research Schema - Supports Initiative 1: Customer Research System';