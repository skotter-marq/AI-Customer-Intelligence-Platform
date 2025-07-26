import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const signalType = searchParams.get('signal_type');
    const days = parseInt(searchParams.get('days') || '30');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('intelligence_signals')
      .select(`
        *,
        monitoring_sources (
          source_type,
          source_name,
          source_url
        )
      `)
      .eq('competitor_id', id)
      .gte('detected_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('detected_at', { ascending: false })
      .limit(limit);

    if (signalType) {
      query = query.eq('signal_type', signalType);
    }

    const { data: signals, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ signals: signals || [] });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validate required fields
    if (!body.signal_type || !body.title) {
      return NextResponse.json(
        { error: 'signal_type and title are required' },
        { status: 400 }
      );
    }

    // Create intelligence signal
    const { data: signal, error } = await supabase
      .from('intelligence_signals')
      .insert({
        competitor_id: id,
        source_id: body.source_id,
        signal_type: body.signal_type,
        title: body.title,
        description: body.description,
        content: body.content,
        url: body.url,
        detected_at: body.detected_at || new Date().toISOString(),
        published_at: body.published_at,
        confidence_score: body.confidence_score || 0.5,
        importance_score: body.importance_score || 0.5,
        sentiment_score: body.sentiment_score,
        tags: body.tags || [],
        metadata: body.metadata || {},
        raw_data: body.raw_data || {}
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ signal }, { status: 201 });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}