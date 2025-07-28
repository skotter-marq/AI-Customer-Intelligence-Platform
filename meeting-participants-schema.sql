-- Meeting Participants Table
-- Enhances the meeting intelligence system with detailed participant tracking

CREATE TABLE IF NOT EXISTS meeting_participants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id uuid NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  role text,
  company text,
  is_internal boolean DEFAULT false,
  participation_level text CHECK (participation_level IN ('active', 'moderate', 'passive')) DEFAULT 'moderate',
  speaking_time_minutes integer DEFAULT 0,
  questions_asked integer DEFAULT 0,
  engagement_score decimal(3,2) DEFAULT 0.50,
  contact_info jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_meeting_participants_meeting_id ON meeting_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_email ON meeting_participants(email);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_company ON meeting_participants(company);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_is_internal ON meeting_participants(is_internal);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_meeting_participants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_meeting_participants_updated_at ON meeting_participants;
CREATE TRIGGER update_meeting_participants_updated_at
  BEFORE UPDATE ON meeting_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_meeting_participants_updated_at();

-- Add RLS policies
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all meeting participants
CREATE POLICY "meeting_participants_select_policy" ON meeting_participants
  FOR SELECT USING (true);

-- Policy: Users can insert meeting participants
CREATE POLICY "meeting_participants_insert_policy" ON meeting_participants
  FOR INSERT WITH CHECK (true);

-- Policy: Users can update meeting participants
CREATE POLICY "meeting_participants_update_policy" ON meeting_participants
  FOR UPDATE USING (true);

-- Policy: Users can delete meeting participants
CREATE POLICY "meeting_participants_delete_policy" ON meeting_participants
  FOR DELETE USING (true);

-- Meeting Notes Table (for additional notes and follow-ups)
CREATE TABLE IF NOT EXISTS meeting_notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id uuid NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  note_type text CHECK (note_type IN ('general', 'follow_up', 'decision', 'concern', 'opportunity')) DEFAULT 'general',
  title text,
  content text NOT NULL,
  author text NOT NULL,
  priority text CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  is_internal boolean DEFAULT true,
  tags text[] DEFAULT '{}',
  mentioned_participants text[] DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add indexes for meeting notes
CREATE INDEX IF NOT EXISTS idx_meeting_notes_meeting_id ON meeting_notes(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_notes_author ON meeting_notes(author);
CREATE INDEX IF NOT EXISTS idx_meeting_notes_priority ON meeting_notes(priority);
CREATE INDEX IF NOT EXISTS idx_meeting_notes_note_type ON meeting_notes(note_type);

-- Add trigger for meeting notes updated_at
CREATE OR REPLACE FUNCTION update_meeting_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_meeting_notes_updated_at ON meeting_notes;
CREATE TRIGGER update_meeting_notes_updated_at
  BEFORE UPDATE ON meeting_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_meeting_notes_updated_at();

-- Add RLS policies for meeting notes
ALTER TABLE meeting_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "meeting_notes_select_policy" ON meeting_notes
  FOR SELECT USING (true);

CREATE POLICY "meeting_notes_insert_policy" ON meeting_notes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "meeting_notes_update_policy" ON meeting_notes
  FOR UPDATE USING (true);

CREATE POLICY "meeting_notes_delete_policy" ON meeting_notes
  FOR DELETE USING (true);

-- Insert sample data for testing
INSERT INTO meeting_participants (meeting_id, name, email, role, company, is_internal, participation_level, speaking_time_minutes, questions_asked, engagement_score)
SELECT 
  m.id,
  (attendee_data->>'name')::text,
  (attendee_data->>'email')::text,
  COALESCE((attendee_data->>'role')::text, 'Participant'),
  m.customer_name,
  CASE 
    WHEN (attendee_data->>'email')::text LIKE '%@company.com' THEN true  -- Replace with your domain
    WHEN (attendee_data->>'email')::text LIKE '%@yourdomain.com' THEN true  -- Replace with your domain
    ELSE false 
  END,
  CASE 
    WHEN random() > 0.7 THEN 'active'
    WHEN random() > 0.3 THEN 'moderate'
    ELSE 'passive'
  END,
  (random() * 30)::integer,
  (random() * 5)::integer,
  (random() * 0.5 + 0.25)::decimal(3,2)
FROM meetings m
CROSS JOIN jsonb_array_elements(
  CASE 
    WHEN jsonb_typeof(m.attendees) = 'array' THEN m.attendees
    ELSE '[]'::jsonb
  END
) AS attendee_data
WHERE m.attendees IS NOT NULL
ON CONFLICT DO NOTHING;

-- Sample meeting notes
INSERT INTO meeting_notes (meeting_id, note_type, title, content, author, priority, tags)
SELECT 
  id,
  'follow_up',
  'Post-meeting follow-up required',
  'Need to follow up on pricing discussion and technical requirements mentioned during the demo.',
  'System Generated',
  'medium',
  ARRAY['follow-up', 'pricing', 'technical']
FROM meetings
WHERE status = 'analyzed'
LIMIT 3
ON CONFLICT DO NOTHING;

-- Function to get meeting participant summary
CREATE OR REPLACE FUNCTION get_meeting_participant_summary(p_meeting_id uuid)
RETURNS TABLE (
  total_participants integer,
  internal_participants integer,
  external_participants integer,
  active_participants integer,
  avg_engagement_score decimal
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::integer as total_participants,
    COUNT(CASE WHEN is_internal THEN 1 END)::integer as internal_participants,
    COUNT(CASE WHEN NOT is_internal THEN 1 END)::integer as external_participants,
    COUNT(CASE WHEN participation_level = 'active' THEN 1 END)::integer as active_participants,
    AVG(engagement_score)::decimal as avg_engagement_score
  FROM meeting_participants
  WHERE meeting_id = p_meeting_id;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate meeting engagement metrics
CREATE OR REPLACE FUNCTION calculate_meeting_engagement(p_meeting_id uuid)
RETURNS TABLE (
  engagement_score decimal,
  participation_balance decimal,
  question_density decimal,
  speaking_distribution jsonb
) AS $$
DECLARE
  meeting_duration_minutes integer;
BEGIN
  -- Get meeting duration
  SELECT duration_minutes INTO meeting_duration_minutes
  FROM meetings
  WHERE id = p_meeting_id;
  
  IF meeting_duration_minutes IS NULL OR meeting_duration_minutes = 0 THEN
    meeting_duration_minutes := 60; -- Default fallback
  END IF;
  
  RETURN QUERY
  SELECT 
    AVG(mp.engagement_score)::decimal as engagement_score,
    CASE 
      WHEN COUNT(CASE WHEN mp.is_internal THEN 1 END) > 0 AND COUNT(CASE WHEN NOT mp.is_internal THEN 1 END) > 0
      THEN LEAST(
        COUNT(CASE WHEN mp.is_internal THEN 1 END)::decimal / COUNT(CASE WHEN NOT mp.is_internal THEN 1 END),
        COUNT(CASE WHEN NOT mp.is_internal THEN 1 END)::decimal / COUNT(CASE WHEN mp.is_internal THEN 1 END)
      )
      ELSE 0
    END as participation_balance,
    (SUM(mp.questions_asked)::decimal / meeting_duration_minutes * 60) as question_density,
    jsonb_object_agg(
      mp.name, 
      jsonb_build_object(
        'speaking_time', mp.speaking_time_minutes,
        'percentage', CASE 
          WHEN SUM(mp.speaking_time_minutes) OVER() > 0 
          THEN (mp.speaking_time_minutes::decimal / SUM(mp.speaking_time_minutes) OVER() * 100)
          ELSE 0 
        END
      )
    ) as speaking_distribution
  FROM meeting_participants mp
  WHERE mp.meeting_id = p_meeting_id;
END;
$$ LANGUAGE plpgsql;