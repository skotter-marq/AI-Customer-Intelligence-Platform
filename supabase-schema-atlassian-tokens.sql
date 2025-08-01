-- Create table for storing Atlassian OAuth tokens
CREATE TABLE IF NOT EXISTS atlassian_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'system',
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  scope TEXT,
  resources JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_atlassian_tokens_user_id ON atlassian_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_atlassian_tokens_expires_at ON atlassian_tokens(expires_at);

-- Row Level Security (RLS)
ALTER TABLE atlassian_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access
CREATE POLICY "Service role can manage all tokens" ON atlassian_tokens
  FOR ALL USING (auth.role() = 'service_role');

-- Add helpful comments
COMMENT ON TABLE atlassian_tokens IS 'Stores OAuth tokens for Atlassian API access';
COMMENT ON COLUMN atlassian_tokens.user_id IS 'User identifier (system for shared tokens)';
COMMENT ON COLUMN atlassian_tokens.access_token IS 'OAuth access token for API calls';
COMMENT ON COLUMN atlassian_tokens.refresh_token IS 'OAuth refresh token for token renewal';
COMMENT ON COLUMN atlassian_tokens.expires_at IS 'When the access token expires';
COMMENT ON COLUMN atlassian_tokens.resources IS 'Available Atlassian resources/sites';