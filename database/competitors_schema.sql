-- Competitors Database Schema
-- This creates the core tables for competitive intelligence tracking

-- Main competitors table
CREATE TABLE IF NOT EXISTS competitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(100) NOT NULL,
  description TEXT,
  website_url VARCHAR(500),
  logo_url VARCHAR(500),
  
  -- Business metrics
  market_cap VARCHAR(50),
  employees VARCHAR(50),
  founded_year INTEGER,
  headquarters VARCHAR(200),
  
  -- Competitive analysis
  threat_level VARCHAR(20) CHECK (threat_level IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'monitoring', 'archived')),
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(100),
  last_analyzed_at TIMESTAMP WITH TIME ZONE
);

-- Competitor monitoring sources
CREATE TABLE IF NOT EXISTS competitor_monitoring_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  competitor_id UUID REFERENCES competitors(id) ON DELETE CASCADE,
  source_type VARCHAR(50) NOT NULL, -- 'website', 'social', 'news', 'pricing', 'jobs'
  source_url VARCHAR(500) NOT NULL,
  monitoring_frequency VARCHAR(20) DEFAULT 'daily', -- 'hourly', 'daily', 'weekly'
  is_active BOOLEAN DEFAULT true,
  last_checked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Competitive insights/analysis results
CREATE TABLE IF NOT EXISTS competitive_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  competitor_id UUID REFERENCES competitors(id) ON DELETE CASCADE,
  insight_type VARCHAR(50) NOT NULL, -- 'pricing', 'feature', 'market_move', 'hiring', 'partnership'
  title VARCHAR(255) NOT NULL,
  summary TEXT NOT NULL,
  impact_level VARCHAR(20) CHECK (impact_level IN ('low', 'medium', 'high', 'critical')),
  confidence_score DECIMAL(3,2),
  source_url VARCHAR(500),
  raw_data JSONB,
  
  -- Analysis metadata
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  analyzed_by VARCHAR(100), -- 'ai', 'manual', 'agent'
  tags TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Competitor pricing data
CREATE TABLE IF NOT EXISTS competitor_pricing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  competitor_id UUID REFERENCES competitors(id) ON DELETE CASCADE,
  plan_name VARCHAR(100) NOT NULL,
  price_amount DECIMAL(10,2),
  price_currency VARCHAR(3) DEFAULT 'USD',
  billing_period VARCHAR(20), -- 'monthly', 'yearly', 'one-time'
  features TEXT[],
  target_segment VARCHAR(50), -- 'startup', 'enterprise', 'individual'
  
  -- Data source
  source_url VARCHAR(500),
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market trends and analysis
CREATE TABLE IF NOT EXISTS market_trends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trend_type VARCHAR(50) NOT NULL, -- 'pricing', 'features', 'market_share', 'sentiment'
  title VARCHAR(255) NOT NULL,
  description TEXT,
  trend_direction VARCHAR(20) CHECK (trend_direction IN ('up', 'down', 'stable', 'mixed')),
  impact_score DECIMAL(3,2),
  
  -- Related competitors
  affected_competitors UUID[],
  
  -- Time period
  period_start DATE,
  period_end DATE,
  
  -- Metadata
  data_points JSONB,
  sources TEXT[],
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_competitors_threat_level ON competitors(threat_level);
CREATE INDEX IF NOT EXISTS idx_competitors_status ON competitors(status);
CREATE INDEX IF NOT EXISTS idx_competitors_industry ON competitors(industry);
CREATE INDEX IF NOT EXISTS idx_competitive_insights_competitor_id ON competitive_insights(competitor_id);
CREATE INDEX IF NOT EXISTS idx_competitive_insights_type ON competitive_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_competitive_insights_analyzed_at ON competitive_insights(analyzed_at);
CREATE INDEX IF NOT EXISTS idx_competitor_monitoring_sources_competitor_id ON competitor_monitoring_sources(competitor_id);
CREATE INDEX IF NOT EXISTS idx_competitor_pricing_competitor_id ON competitor_pricing(competitor_id);

-- Insert sample data
INSERT INTO competitors (name, industry, description, website_url, market_cap, employees, threat_level, status, confidence_score) VALUES
('Salesforce', 'CRM & Sales', 'Leading cloud-based CRM platform with comprehensive sales, marketing, and customer service solutions', 'https://salesforce.com', '$200B+', '70,000+', 'high', 'active', 0.95),
('HubSpot', 'Marketing & CRM', 'Inbound marketing and sales platform with free CRM and comprehensive marketing tools', 'https://hubspot.com', '$25B+', '5,000+', 'high', 'active', 0.92),
('Microsoft Dynamics', 'Business Applications', 'Enterprise-grade CRM and ERP solutions integrated with Microsoft Office ecosystem', 'https://dynamics.microsoft.com', '$3T+', '220,000+', 'medium', 'active', 0.88),
('Pipedrive', 'Sales CRM', 'Sales-focused CRM designed for small and medium businesses with visual pipeline management', 'https://pipedrive.com', '$1.5B+', '1,000+', 'medium', 'active', 0.85),
('Zendesk', 'Customer Service', 'Customer service and engagement platform with ticketing, knowledge base, and chat solutions', 'https://zendesk.com', '$13B+', '6,000+', 'medium', 'active', 0.82),
('Intercom', 'Customer Messaging', 'Conversational relationship platform with live chat, help desk, and marketing automation', 'https://intercom.com', '$1.3B+', '1,500+', 'low', 'monitoring', 0.78);

-- Insert sample monitoring sources
INSERT INTO competitor_monitoring_sources (competitor_id, source_type, source_url, monitoring_frequency) 
SELECT 
  c.id,
  'website',
  c.website_url,
  'daily'
FROM competitors c;

-- Insert sample competitive insights
INSERT INTO competitive_insights (competitor_id, insight_type, title, summary, impact_level, confidence_score)
SELECT 
  c.id,
  'pricing',
  c.name || ' Updates Pricing Strategy',
  'Recent analysis shows ' || c.name || ' has adjusted their pricing model to be more competitive in the ' || c.industry || ' space.',
  'medium',
  0.75
FROM competitors c
LIMIT 3;

-- Add update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_competitors_updated_at BEFORE UPDATE ON competitors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_competitive_insights_updated_at BEFORE UPDATE ON competitive_insights FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_competitor_monitoring_sources_updated_at BEFORE UPDATE ON competitor_monitoring_sources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();