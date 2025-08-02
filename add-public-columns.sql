-- Add missing public visibility columns to generated_content table
-- Run this in Supabase SQL Editor

-- Add is_public column
ALTER TABLE generated_content 
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;

-- Add public_changelog_visible column  
ALTER TABLE generated_content 
ADD COLUMN IF NOT EXISTS public_changelog_visible boolean DEFAULT false;

-- Add version column if it doesn't exist
ALTER TABLE generated_content 
ADD COLUMN IF NOT EXISTS version text;

-- Add release_date column if it doesn't exist
ALTER TABLE generated_content 
ADD COLUMN IF NOT EXISTS release_date timestamp with time zone;

-- Create index for public visibility queries
CREATE INDEX IF NOT EXISTS idx_generated_content_public_visibility 
ON generated_content(is_public, public_changelog_visible) 
WHERE is_public = true AND public_changelog_visible = true;

-- Update existing approved entries to be public (optional - uncomment if desired)
-- UPDATE generated_content 
-- SET is_public = true, public_changelog_visible = true, release_date = NOW()
-- WHERE approval_status = 'approved' AND is_public IS NULL;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'generated_content' 
AND column_name IN ('is_public', 'public_changelog_visible', 'version', 'release_date')
ORDER BY column_name;