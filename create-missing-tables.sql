-- Run this SQL in your Supabase Dashboard > SQL Editor to create missing tables
-- This will fix the "relation public.generated_content does not exist" error

-- Create the generated_content table
CREATE TABLE IF NOT EXISTS generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID,
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_generated_content_status ON generated_content(status);
CREATE INDEX IF NOT EXISTS idx_generated_content_type ON generated_content(content_type);
CREATE INDEX IF NOT EXISTS idx_generated_content_created_at ON generated_content(created_at);
CREATE INDEX IF NOT EXISTS idx_generated_content_published_at ON generated_content(published_at);

-- Enable Row Level Security
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow authenticated users full access
CREATE POLICY IF NOT EXISTS "Allow authenticated users full access" ON generated_content FOR ALL TO authenticated USING (true);

-- Insert some test data to verify the table works
INSERT INTO generated_content (content_title, generated_content, content_type, content_format, status) 
VALUES 
  ('Test Product Update', 'This is a test product update announcement.', 'product_update', 'markdown', 'draft'),
  ('Sample Customer Story', 'This is a sample customer success story.', 'customer_story', 'markdown', 'under_review'),
  ('API Feature Release', 'We are excited to announce our new API rate limiting feature.', 'feature_announcement', 'markdown', 'approved');