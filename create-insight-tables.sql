-- Create tables for meeting insights and analysis
-- Run this in your Supabase SQL Editor

-- Meeting Insights Table
CREATE TABLE IF NOT EXISTS meeting_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    insight_type VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    quote TEXT,
    importance_score DECIMAL(3,2) DEFAULT 0.5,
    confidence_score DECIMAL(3,2) DEFAULT 0.5,
    priority VARCHAR(20) DEFAULT 'medium',
    tags TEXT[] DEFAULT '{}',
    affected_feature TEXT,
    competitor_mentioned TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meeting Action Items Table
CREATE TABLE IF NOT EXISTS meeting_action_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    assigned_to TEXT,
    priority VARCHAR(20) DEFAULT 'medium',
    category VARCHAR(50),
    due_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meeting Feature Requests Table
CREATE TABLE IF NOT EXISTS meeting_feature_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    feature_title TEXT NOT NULL,
    feature_description TEXT,
    business_value TEXT,
    urgency VARCHAR(20) DEFAULT 'medium',
    customer_pain_point TEXT,
    estimated_impact TEXT,
    status VARCHAR(20) DEFAULT 'under_review',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meeting Topics Table
CREATE TABLE IF NOT EXISTS meeting_topics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    topic_category VARCHAR(50),
    relevance_score DECIMAL(3,2) DEFAULT 0.5,
    sentiment_score DECIMAL(3,2) DEFAULT 0.0,
    keywords TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meeting Competitive Intelligence Table
CREATE TABLE IF NOT EXISTS meeting_competitive_intel (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    competitor_name TEXT NOT NULL,
    mention_type VARCHAR(50),
    context TEXT,
    sentiment VARCHAR(20) DEFAULT 'neutral',
    threat_level VARCHAR(20) DEFAULT 'low',
    quote TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meeting_insights_meeting_id ON meeting_insights(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_insights_priority ON meeting_insights(priority);
CREATE INDEX IF NOT EXISTS idx_action_items_meeting_id ON meeting_action_items(meeting_id);
CREATE INDEX IF NOT EXISTS idx_action_items_status ON meeting_action_items(status);
CREATE INDEX IF NOT EXISTS idx_feature_requests_meeting_id ON meeting_feature_requests(meeting_id);
CREATE INDEX IF NOT EXISTS idx_topics_meeting_id ON meeting_topics(meeting_id);
CREATE INDEX IF NOT EXISTS idx_competitive_intel_meeting_id ON meeting_competitive_intel(meeting_id);