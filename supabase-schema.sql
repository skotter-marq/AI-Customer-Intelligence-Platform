-- Generated Content Table for Changelog Management
-- This table stores AI-generated content from JIRA webhooks and other sources

CREATE TABLE IF NOT EXISTS generated_content (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Content Identification
  content_title text NOT NULL,
  generated_content text NOT NULL,
  content_type text NOT NULL DEFAULT 'changelog_entry',
  target_audience text NOT NULL DEFAULT 'customers',
  
  -- Content Status and Approval
  status text NOT NULL DEFAULT 'pending_approval',
  approval_status text NOT NULL DEFAULT 'pending',
  approved_by text,
  approved_at timestamp with time zone,
  
  -- Content Quality and Metrics
  quality_score decimal(3,2) DEFAULT 0.85,
  importance_score decimal(3,2) DEFAULT 0.70,
  
  -- Changelog Specific Fields
  tldr_summary text,
  tldr_bullet_points text[], -- Array of highlight strings
  update_category text, -- 'added', 'improved', 'fixed', 'security', 'deprecated'
  layout_template text DEFAULT 'standard', -- Template type for rendering
  
  -- Change Impact
  breaking_changes boolean DEFAULT false,
  migration_notes text,
  affected_users integer,
  
  -- Publication Settings
  is_public boolean DEFAULT false,
  public_changelog_visible boolean DEFAULT false,
  version text, -- Version number when published
  release_date timestamp with time zone,
  
  -- Tags and Categorization
  tags text[] DEFAULT '{}',
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- JIRA Integration
  metadata jsonb DEFAULT '{}' -- Store JIRA story key, issue id, assignee, etc.
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_generated_content_status ON generated_content(status);
CREATE INDEX IF NOT EXISTS idx_generated_content_approval_status ON generated_content(approval_status);
CREATE INDEX IF NOT EXISTS idx_generated_content_public ON generated_content(is_public, public_changelog_visible);
CREATE INDEX IF NOT EXISTS idx_generated_content_category ON generated_content(update_category);
CREATE INDEX IF NOT EXISTS idx_generated_content_created_at ON generated_content(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_content_jira ON generated_content USING gin(metadata) WHERE metadata ? 'jira_story_key';

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_generated_content_updated_at 
    BEFORE UPDATE ON generated_content 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all content
CREATE POLICY "Allow authenticated users to read content" ON generated_content
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert new content
CREATE POLICY "Allow authenticated users to insert content" ON generated_content
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update content
CREATE POLICY "Allow authenticated users to update content" ON generated_content
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow public access to published content
CREATE POLICY "Allow public access to published content" ON generated_content
  FOR SELECT USING (
    is_public = true AND 
    public_changelog_visible = true AND 
    approval_status = 'approved'
  );

-- Insert some sample data for testing
INSERT INTO generated_content (
  content_title,
  generated_content,
  content_type,
  target_audience,
  status,
  approval_status,
  quality_score,
  tldr_summary,
  tldr_bullet_points,
  update_category,
  importance_score,
  breaking_changes,
  tags,
  is_public,
  public_changelog_visible,
  version,
  release_date,
  affected_users,
  metadata
) VALUES 
(
  'Real-time Analytics Dashboard',
  'Introducing our new analytics dashboard with live data updates, customizable widgets, and advanced filtering capabilities.',
  'changelog_entry',
  'customers',
  'published',
  'approved',
  0.92,
  'Real-time Analytics Dashboard',
  ARRAY[
    'Live data streaming for real-time insights',
    'Drag-and-drop dashboard customization',
    'Advanced filtering and date range selection',
    'Export analytics to PDF and CSV formats'
  ],
  'added',
  0.85,
  false,
  ARRAY['analytics', 'dashboard', 'real-time', 'PLAT-245'],
  true,
  true,
  'v2.4.2',
  '2024-01-20T00:00:00Z',
  2500,
  jsonb_build_object(
    'jira_story_key', 'PLAT-245',
    'jira_issue_id', '12345',
    'assignee', 'John Smith',
    'components', ARRAY['Frontend', 'Analytics'],
    'labels', ARRAY['customer-facing', 'high-impact']
  )
),
(
  'Mobile App Offline Mode',
  'Users can now access critical features and view cached data when offline, syncing automatically when connection is restored.',
  'changelog_entry',
  'customers',
  'pending_approval',
  'pending',
  0.88,
  'Mobile App Offline Mode',
  ARRAY[
    'Access critical features offline',
    'Automatic sync when connection restored',
    'Cached data viewing capabilities',
    'Improved mobile experience'
  ],
  'added',
  0.80,
  false,
  ARRAY['mobile', 'offline', 'sync', 'PLAT-189'],
  false,
  false,
  'v2.5.0',
  '2024-01-25T00:00:00Z',
  1800,
  jsonb_build_object(
    'jira_story_key', 'PLAT-189',
    'jira_issue_id', '12346',
    'assignee', 'Jane Doe',
    'components', ARRAY['Mobile App'],
    'labels', ARRAY['customer-facing', 'mobile']
  )
),
(
  'API Performance Improvements',
  'Optimized API endpoints for 40% faster response times and improved rate limiting for enterprise customers.',
  'changelog_entry',
  'customers',
  'pending_approval',
  'pending',
  0.85,
  'API Performance Improvements',
  ARRAY[
    '40% faster API response times',
    'Improved rate limiting for enterprise',
    'Optimized endpoint performance',
    'Better error handling'
  ],
  'improved',
  0.75,
  false,
  ARRAY['api', 'performance', 'enterprise', 'PLAT-301'],
  false,
  false,
  'v2.4.3',
  '2024-01-22T00:00:00Z',
  3200,
  jsonb_build_object(
    'jira_story_key', 'PLAT-301',
    'jira_issue_id', '12347',
    'assignee', 'Mike Johnson',
    'components', ARRAY['API', 'Backend'],
    'labels', ARRAY['performance', 'enterprise']
  )
);