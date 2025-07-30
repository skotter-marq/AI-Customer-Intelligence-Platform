-- Fix generated_content table to support JIRA webhook changelog entries
-- Add missing columns needed by the JIRA webhook

-- Add missing columns to generated_content table
ALTER TABLE generated_content 
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));

ALTER TABLE generated_content 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

ALTER TABLE generated_content 
ADD COLUMN IF NOT EXISTS public_changelog_visible BOOLEAN DEFAULT false;

ALTER TABLE generated_content 
ADD COLUMN IF NOT EXISTS version TEXT;

ALTER TABLE generated_content 
ADD COLUMN IF NOT EXISTS release_date TIMESTAMP WITH TIME ZONE;

ALTER TABLE generated_content 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE generated_content 
ADD COLUMN IF NOT EXISTS breaking_changes BOOLEAN DEFAULT false;

ALTER TABLE generated_content 
ADD COLUMN IF NOT EXISTS migration_notes TEXT;

ALTER TABLE generated_content 
ADD COLUMN IF NOT EXISTS update_category TEXT;

ALTER TABLE generated_content 
ADD COLUMN IF NOT EXISTS importance_score DECIMAL(3,2) DEFAULT 0.5;

ALTER TABLE generated_content 
ADD COLUMN IF NOT EXISTS affected_users INTEGER DEFAULT 0;

ALTER TABLE generated_content 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

ALTER TABLE generated_content 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_generated_content_approval_status ON generated_content(approval_status);
CREATE INDEX IF NOT EXISTS idx_generated_content_public ON generated_content(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_generated_content_update_category ON generated_content(update_category);
CREATE INDEX IF NOT EXISTS idx_generated_content_release_date ON generated_content(release_date) WHERE release_date IS NOT NULL;

-- Update RLS policy to allow service role full access
CREATE POLICY IF NOT EXISTS "Allow service role full access" ON generated_content FOR ALL TO service_role USING (true);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database schema updated successfully!';
    RAISE NOTICE 'Added columns: approval_status, is_public, public_changelog_visible, version, release_date, approved_at, breaking_changes, migration_notes, update_category, importance_score, affected_users, tags, metadata';
    RAISE NOTICE 'JIRA webhook should now work correctly with the generated_content table';
END $$;