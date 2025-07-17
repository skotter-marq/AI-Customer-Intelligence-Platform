import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ 
      error: 'Missing Supabase credentials',
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { 
      meeting_title, 
      transcript, 
      date, 
      participants = [],
      duration_minutes,
      grain_id
    } = req.body;

    if (!meeting_title || !transcript) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const meetingData = {
      grain_id: grain_id || `zapier-${Date.now()}`,
      title: meeting_title,
      date: new Date(date).toISOString(),
      duration_minutes: duration_minutes || null,
      participants: participants,
      raw_transcript: transcript
    };

    const { data, error } = await supabase
      .from('meetings')
      .insert(meetingData)
      .select();

    if (error) {
      return res.status(500).json({ 
        error: 'Database error', 
        details: error.message
      });
    }

    return res.status(200).json({ 
      success: true, 
      meeting_id: data[0].id 
    });

  } catch (error) {
    return res.status(500).json({ 
      error: 'Processing failed', 
      details: error.message 
    });
  }
}
