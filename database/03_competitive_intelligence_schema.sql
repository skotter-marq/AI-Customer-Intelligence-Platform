-- ===========================================
-- Competitive Intelligence Schema
-- For monitoring competitors and market signals
-- ===========================================

-- Competitors table - Core competitor information
CREATE TABLE competitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE,
    description TEXT,
    industry VARCHAR(100),
    company_size VARCHAR(50),
    location VARCHAR(255),
    funding_stage VARCHAR(100),
    competitor_type VARCHAR(100) CHECK (competitor_type IN ('direct', 'indirect', 'substitute', 'emerging')),
    threat_level VARCHAR(50) CHECK (threat_level IN ('low', 'medium', 'high', 'critical')),
    market_position VARCHAR(100),
    key_differentiators TEXT[],
    target_segments TEXT[],
    pricing_model VARCHAR(100),
    last_funding_amount DECIMAL(15,2),
    last_funding_date DATE,
    employee_count INTEGER,
    annual_revenue DECIMAL(15,2),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'acquired', 'defunct', 'pivoted')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Monitoring Sources table - Different channels to monitor
CREATE TABLE monitoring_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
    source_type VARCHAR(100) NOT NULL CHECK (source_type IN ('website', 'blog', 'social_media', 'product_updates', 'job_postings', 'press_releases', 'pricing_page', 'feature_page', 'documentation', 'api_docs', 'customer_reviews', 'linkedin', 'twitter', 'facebook', 'instagram', 'youtube', 'github', 'product_hunt', 'crunchbase', 'g2', 'capterra', 'trustpilot')),
    source_url VARCHAR(1000) NOT NULL,
    source_name VARCHAR(255),
    monitoring_frequency VARCHAR(50) DEFAULT 'daily' CHECK (monitoring_frequency IN ('hourly', 'daily', 'weekly', 'monthly')),
    last_monitored TIMESTAMP WITH TIME ZONE,
    last_change_detected TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    monitoring_config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(competitor_id, source_url)
);

-- Intelligence Signals table - Raw data collected from monitoring
CREATE TABLE intelligence_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
    source_id UUID NOT NULL REFERENCES monitoring_sources(id) ON DELETE CASCADE,
    signal_type VARCHAR(100) NOT NULL CHECK (signal_type IN ('product_launch', 'feature_update', 'pricing_change', 'partnership', 'acquisition', 'funding', 'leadership_change', 'job_posting', 'press_release', 'blog_post', 'social_mention', 'customer_review', 'patent_filing', 'regulatory_filing', 'conference_talk', 'webinar', 'whitepaper', 'case_study', 'integration_announcement', 'api_update', 'security_incident', 'outage', 'customer_win', 'customer_loss', 'market_expansion', 'office_opening', 'office_closing')),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    content TEXT,
    url VARCHAR(1000),
    detected_at TIMESTAMP WITH TIME ZONE NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE,
    confidence_score DECIMAL(3,2) DEFAULT 0.5 CHECK (confidence_score >= 0 AND confidence_score <= 1),
    importance_score DECIMAL(3,2) DEFAULT 0.5 CHECK (importance_score >= 0 AND importance_score <= 1),
    sentiment_score DECIMAL(3,2) CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    raw_data JSONB DEFAULT '{}',
    is_processed BOOLEAN DEFAULT false,
    is_alert_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Feature Tracking table - Track competitor features and capabilities
CREATE TABLE competitor_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
    feature_name VARCHAR(255) NOT NULL,
    feature_category VARCHAR(100),
    description TEXT,
    feature_type VARCHAR(100) CHECK (feature_type IN ('core', 'premium', 'enterprise', 'beta', 'deprecated')),
    launch_date DATE,
    discontinuation_date DATE,
    pricing_tier VARCHAR(100),
    is_competitive_advantage BOOLEAN DEFAULT false,
    feature_url VARCHAR(1000),
    screenshots TEXT[],
    our_equivalent_feature VARCHAR(255),
    gap_analysis TEXT,
    priority_level VARCHAR(50) CHECK (priority_level IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'beta', 'deprecated', 'rumored', 'discontinued')),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(competitor_id, feature_name)
);

-- Pricing Intelligence table - Track competitor pricing changes
CREATE TABLE pricing_intelligence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
    plan_name VARCHAR(255) NOT NULL,
    pricing_model VARCHAR(100) CHECK (pricing_model IN ('freemium', 'subscription', 'usage_based', 'per_seat', 'per_user', 'tiered', 'custom', 'one_time')),
    price_amount DECIMAL(10,2),
    price_currency VARCHAR(10) DEFAULT 'USD',
    billing_cycle VARCHAR(50) CHECK (billing_cycle IN ('monthly', 'quarterly', 'annual', 'one_time', 'usage')),
    features_included TEXT[],
    limitations TEXT[],
    target_segment VARCHAR(100),
    pricing_page_url VARCHAR(1000),
    effective_date DATE NOT NULL,
    end_date DATE,
    change_type VARCHAR(50) CHECK (change_type IN ('price_increase', 'price_decrease', 'new_plan', 'plan_discontinued', 'feature_added', 'feature_removed', 'tier_restructure')),
    change_percentage DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Intelligence Reports table - Processed intelligence summaries
CREATE TABLE intelligence_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type VARCHAR(100) NOT NULL CHECK (report_type IN ('weekly_summary', 'monthly_deep_dive', 'quarterly_review', 'competitor_profile', 'feature_gap_analysis', 'pricing_analysis', 'market_movement', 'threat_assessment', 'opportunity_analysis', 'ad_hoc')),
    title VARCHAR(500) NOT NULL,
    summary TEXT NOT NULL,
    key_findings TEXT[],
    recommendations TEXT[],
    competitors_analyzed UUID[],
    date_range_start DATE,
    date_range_end DATE,
    signals_analyzed INTEGER DEFAULT 0,
    report_content TEXT,
    attachments TEXT[],
    priority VARCHAR(50) CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
    published_at TIMESTAMP WITH TIME ZONE,
    recipients TEXT[],
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Alert Rules table - Configure automated alerts
CREATE TABLE alert_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name VARCHAR(255) NOT NULL,
    description TEXT,
    competitor_ids UUID[],
    signal_types TEXT[],
    keywords TEXT[],
    importance_threshold DECIMAL(3,2) DEFAULT 0.7,
    confidence_threshold DECIMAL(3,2) DEFAULT 0.6,
    frequency_limit INTEGER DEFAULT 1,
    frequency_period VARCHAR(50) DEFAULT 'daily' CHECK (frequency_period IN ('hourly', 'daily', 'weekly', 'monthly')),
    notification_channels TEXT[] DEFAULT '{}',
    recipients TEXT[],
    is_active BOOLEAN DEFAULT true,
    last_triggered TIMESTAMP WITH TIME ZONE,
    trigger_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Alert Instances table - Track fired alerts
CREATE TABLE alert_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_rule_id UUID NOT NULL REFERENCES alert_rules(id) ON DELETE CASCADE,
    signal_id UUID NOT NULL REFERENCES intelligence_signals(id) ON DELETE CASCADE,
    competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
    alert_message TEXT NOT NULL,
    alert_priority VARCHAR(50) CHECK (alert_priority IN ('low', 'medium', 'high', 'critical')),
    channels_sent TEXT[],
    recipients_notified TEXT[],
    is_acknowledged BOOLEAN DEFAULT false,
    acknowledged_by VARCHAR(255),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- Indexes for Performance
-- ===========================================

-- Competitor indexes
CREATE INDEX idx_competitors_domain ON competitors(domain);
CREATE INDEX idx_competitors_competitor_type ON competitors(competitor_type);
CREATE INDEX idx_competitors_threat_level ON competitors(threat_level);
CREATE INDEX idx_competitors_status ON competitors(status);

-- Monitoring source indexes
CREATE INDEX idx_monitoring_sources_competitor_id ON monitoring_sources(competitor_id);
CREATE INDEX idx_monitoring_sources_source_type ON monitoring_sources(source_type);
CREATE INDEX idx_monitoring_sources_is_active ON monitoring_sources(is_active);
CREATE INDEX idx_monitoring_sources_last_monitored ON monitoring_sources(last_monitored);

-- Intelligence signal indexes
CREATE INDEX idx_intelligence_signals_competitor_id ON intelligence_signals(competitor_id);
CREATE INDEX idx_intelligence_signals_source_id ON intelligence_signals(source_id);
CREATE INDEX idx_intelligence_signals_signal_type ON intelligence_signals(signal_type);
CREATE INDEX idx_intelligence_signals_detected_at ON intelligence_signals(detected_at);
CREATE INDEX idx_intelligence_signals_importance_score ON intelligence_signals(importance_score);
CREATE INDEX idx_intelligence_signals_is_processed ON intelligence_signals(is_processed);
CREATE INDEX idx_intelligence_signals_tags ON intelligence_signals USING GIN(tags);

-- Feature tracking indexes
CREATE INDEX idx_competitor_features_competitor_id ON competitor_features(competitor_id);
CREATE INDEX idx_competitor_features_feature_category ON competitor_features(feature_category);
CREATE INDEX idx_competitor_features_priority_level ON competitor_features(priority_level);
CREATE INDEX idx_competitor_features_status ON competitor_features(status);

-- Pricing intelligence indexes
CREATE INDEX idx_pricing_intelligence_competitor_id ON pricing_intelligence(competitor_id);
CREATE INDEX idx_pricing_intelligence_effective_date ON pricing_intelligence(effective_date);
CREATE INDEX idx_pricing_intelligence_change_type ON pricing_intelligence(change_type);

-- Intelligence report indexes
CREATE INDEX idx_intelligence_reports_report_type ON intelligence_reports(report_type);
CREATE INDEX idx_intelligence_reports_status ON intelligence_reports(status);
CREATE INDEX idx_intelligence_reports_published_at ON intelligence_reports(published_at);
CREATE INDEX idx_intelligence_reports_created_at ON intelligence_reports(created_at);

-- Alert rule indexes
CREATE INDEX idx_alert_rules_is_active ON alert_rules(is_active);
CREATE INDEX idx_alert_rules_last_triggered ON alert_rules(last_triggered);

-- Alert instance indexes
CREATE INDEX idx_alert_instances_alert_rule_id ON alert_instances(alert_rule_id);
CREATE INDEX idx_alert_instances_signal_id ON alert_instances(signal_id);
CREATE INDEX idx_alert_instances_competitor_id ON alert_instances(competitor_id);
CREATE INDEX idx_alert_instances_created_at ON alert_instances(created_at);
CREATE INDEX idx_alert_instances_is_acknowledged ON alert_instances(is_acknowledged);

-- ===========================================
-- Updated At Triggers
-- ===========================================

-- Create or replace the updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_competitors_updated_at 
    BEFORE UPDATE ON competitors 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monitoring_sources_updated_at 
    BEFORE UPDATE ON monitoring_sources 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_intelligence_signals_updated_at 
    BEFORE UPDATE ON intelligence_signals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competitor_features_updated_at 
    BEFORE UPDATE ON competitor_features 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_intelligence_updated_at 
    BEFORE UPDATE ON pricing_intelligence 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_intelligence_reports_updated_at 
    BEFORE UPDATE ON intelligence_reports 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alert_rules_updated_at 
    BEFORE UPDATE ON alert_rules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- Useful Views
-- ===========================================

-- Competitor Summary View
CREATE VIEW competitor_summary AS
SELECT 
    c.*,
    COUNT(DISTINCT ms.id) as monitoring_sources_count,
    COUNT(DISTINCT CASE WHEN ms.is_active THEN ms.id END) as active_sources_count,
    COUNT(DISTINCT is_sig.id) as total_signals,
    COUNT(DISTINCT CASE WHEN is_sig.detected_at >= CURRENT_DATE - INTERVAL '30 days' THEN is_sig.id END) as recent_signals,
    COUNT(DISTINCT cf.id) as features_tracked,
    COUNT(DISTINCT pi.id) as pricing_records,
    AVG(is_sig.importance_score) as avg_signal_importance,
    MAX(is_sig.detected_at) as last_signal_date
FROM competitors c
LEFT JOIN monitoring_sources ms ON c.id = ms.competitor_id
LEFT JOIN intelligence_signals is_sig ON c.id = is_sig.competitor_id
LEFT JOIN competitor_features cf ON c.id = cf.competitor_id
LEFT JOIN pricing_intelligence pi ON c.id = pi.competitor_id
GROUP BY c.id, c.name, c.domain, c.description, c.industry, c.company_size, c.location, c.funding_stage, c.competitor_type, c.threat_level, c.market_position, c.key_differentiators, c.target_segments, c.pricing_model, c.last_funding_amount, c.last_funding_date, c.employee_count, c.annual_revenue, c.status, c.notes, c.created_at, c.updated_at;

-- Recent High-Priority Signals View
CREATE VIEW recent_high_priority_signals AS
SELECT 
    is_sig.*,
    c.name as competitor_name,
    c.threat_level,
    ms.source_type,
    ms.source_name
FROM intelligence_signals is_sig
JOIN competitors c ON is_sig.competitor_id = c.id
JOIN monitoring_sources ms ON is_sig.source_id = ms.id
WHERE is_sig.detected_at >= CURRENT_DATE - INTERVAL '7 days'
  AND (is_sig.importance_score >= 0.7 OR is_sig.confidence_score >= 0.8)
ORDER BY is_sig.importance_score DESC, is_sig.detected_at DESC;

-- Feature Gap Analysis View
CREATE VIEW feature_gap_analysis AS
SELECT 
    c.name as competitor_name,
    c.competitor_type,
    c.threat_level,
    cf.feature_name,
    cf.feature_category,
    cf.description,
    cf.our_equivalent_feature,
    cf.gap_analysis,
    cf.priority_level,
    cf.is_competitive_advantage,
    cf.status
FROM competitor_features cf
JOIN competitors c ON cf.competitor_id = c.id
WHERE cf.status = 'active'
  AND (cf.our_equivalent_feature IS NULL OR cf.is_competitive_advantage = true)
ORDER BY cf.priority_level DESC, c.threat_level DESC;

-- Pricing Comparison View
CREATE VIEW pricing_comparison AS
SELECT 
    c.name as competitor_name,
    c.competitor_type,
    pi.plan_name,
    pi.pricing_model,
    pi.price_amount,
    pi.price_currency,
    pi.billing_cycle,
    pi.target_segment,
    pi.effective_date,
    pi.change_type,
    pi.change_percentage,
    ROW_NUMBER() OVER (PARTITION BY c.id, pi.plan_name ORDER BY pi.effective_date DESC) as version_rank
FROM pricing_intelligence pi
JOIN competitors c ON pi.competitor_id = c.id
WHERE pi.end_date IS NULL OR pi.end_date >= CURRENT_DATE
ORDER BY c.name, pi.plan_name, pi.effective_date DESC;

-- ===========================================
-- Row Level Security (RLS) Setup
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE intelligence_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE intelligence_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_instances ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (allow all operations for authenticated users)
CREATE POLICY "Allow authenticated users full access" ON competitors FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON monitoring_sources FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON intelligence_signals FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON competitor_features FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON pricing_intelligence FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON intelligence_reports FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON alert_rules FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated users full access" ON alert_instances FOR ALL TO authenticated USING (true);

-- ===========================================
-- Sample Data for Testing
-- ===========================================

-- Insert sample competitors
INSERT INTO competitors (name, domain, description, industry, competitor_type, threat_level, market_position, key_differentiators, target_segments, pricing_model, employee_count, status)
VALUES 
('CompetitorX', 'competitorx.com', 'AI-powered customer analytics platform', 'Technology', 'direct', 'high', 'market_leader', ARRAY['advanced_ai', 'real_time_processing', 'enterprise_security'], ARRAY['enterprise', 'mid_market'], 'subscription', 500, 'active'),
('MarketRival', 'marketrival.com', 'Customer intelligence and CRM integration', 'Technology', 'direct', 'medium', 'challenger', ARRAY['crm_integration', 'simple_ui', 'competitive_pricing'], ARRAY['smb', 'mid_market'], 'freemium', 150, 'active'),
('InnovateNow', 'innovatenow.com', 'Business intelligence and analytics', 'Technology', 'indirect', 'low', 'niche_player', ARRAY['business_intelligence', 'data_visualization', 'custom_dashboards'], ARRAY['enterprise'], 'usage_based', 250, 'active');

-- Insert sample monitoring sources
INSERT INTO monitoring_sources (competitor_id, source_type, source_url, source_name, monitoring_frequency, is_active)
VALUES 
((SELECT id FROM competitors WHERE name = 'CompetitorX'), 'website', 'https://competitorx.com', 'CompetitorX Homepage', 'daily', true),
((SELECT id FROM competitors WHERE name = 'CompetitorX'), 'blog', 'https://competitorx.com/blog', 'CompetitorX Blog', 'daily', true),
((SELECT id FROM competitors WHERE name = 'CompetitorX'), 'pricing_page', 'https://competitorx.com/pricing', 'CompetitorX Pricing', 'weekly', true),
((SELECT id FROM competitors WHERE name = 'MarketRival'), 'website', 'https://marketrival.com', 'MarketRival Homepage', 'daily', true),
((SELECT id FROM competitors WHERE name = 'MarketRival'), 'product_updates', 'https://marketrival.com/changelog', 'MarketRival Changelog', 'daily', true);

-- Insert sample intelligence signals
INSERT INTO intelligence_signals (competitor_id, source_id, signal_type, title, description, detected_at, importance_score, confidence_score, tags)
VALUES 
((SELECT id FROM competitors WHERE name = 'CompetitorX'), 
 (SELECT id FROM monitoring_sources WHERE source_url = 'https://competitorx.com/blog'), 
 'product_launch', 
 'CompetitorX Launches Advanced AI Analytics', 
 'New AI-powered analytics feature announced with real-time processing capabilities', 
 CURRENT_TIMESTAMP - INTERVAL '2 days', 
 0.9, 0.8, 
 ARRAY['ai', 'analytics', 'real_time']),
((SELECT id FROM competitors WHERE name = 'MarketRival'), 
 (SELECT id FROM monitoring_sources WHERE source_url = 'https://marketrival.com/changelog'), 
 'feature_update', 
 'MarketRival Adds CRM Integration', 
 'New integration with Salesforce and HubSpot announced', 
 CURRENT_TIMESTAMP - INTERVAL '1 day', 
 0.7, 0.9, 
 ARRAY['crm', 'integration', 'salesforce', 'hubspot']);

-- Insert sample competitor features
INSERT INTO competitor_features (competitor_id, feature_name, feature_category, description, feature_type, is_competitive_advantage, priority_level, status)
VALUES 
((SELECT id FROM competitors WHERE name = 'CompetitorX'), 'Real-time AI Analytics', 'Analytics', 'AI-powered real-time customer behavior analysis', 'core', true, 'high', 'active'),
((SELECT id FROM competitors WHERE name = 'CompetitorX'), 'Enterprise Security', 'Security', 'SOC2 compliant with advanced encryption', 'enterprise', true, 'high', 'active'),
((SELECT id FROM competitors WHERE name = 'MarketRival'), 'CRM Integration', 'Integration', 'Native integration with major CRM platforms', 'core', false, 'medium', 'active');

-- Insert sample pricing intelligence
INSERT INTO pricing_intelligence (competitor_id, plan_name, pricing_model, price_amount, price_currency, billing_cycle, target_segment, effective_date, change_type)
VALUES 
((SELECT id FROM competitors WHERE name = 'CompetitorX'), 'Pro Plan', 'subscription', 199.00, 'USD', 'monthly', 'mid_market', CURRENT_DATE - INTERVAL '30 days', 'new_plan'),
((SELECT id FROM competitors WHERE name = 'CompetitorX'), 'Enterprise Plan', 'subscription', 499.00, 'USD', 'monthly', 'enterprise', CURRENT_DATE - INTERVAL '30 days', 'new_plan'),
((SELECT id FROM competitors WHERE name = 'MarketRival'), 'Starter Plan', 'freemium', 0.00, 'USD', 'monthly', 'smb', CURRENT_DATE - INTERVAL '60 days', 'new_plan'),
((SELECT id FROM competitors WHERE name = 'MarketRival'), 'Growth Plan', 'subscription', 99.00, 'USD', 'monthly', 'mid_market', CURRENT_DATE - INTERVAL '60 days', 'new_plan');

COMMENT ON SCHEMA public IS 'Competitive Intelligence Schema - Supports Initiative 2: Competitive Intelligence Agent';