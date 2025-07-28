import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase-client';

export async function GET(request: NextRequest) {
  try {
    // Handle missing Supabase client during build
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const signalType = searchParams.get('signal_type');
    const competitorId = searchParams.get('competitor_id');
    const days = parseInt(searchParams.get('days') || '7');
    const limit = parseInt(searchParams.get('limit') || '50');
    const priority = searchParams.get('priority'); // 'high' for high-priority signals
    const minImportance = parseFloat(searchParams.get('min_importance') || '0');
    const minConfidence = parseFloat(searchParams.get('min_confidence') || '0');

    let query = supabase
      .from('intelligence_signals')
      .select(`
        *,
        competitors (
          name,
          domain,
          threat_level,
          competitor_type
        ),
        monitoring_sources (
          source_type,
          source_name,
          source_url
        )
      `)
      .gte('detected_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('importance_score', { ascending: false })
      .order('detected_at', { ascending: false })
      .limit(limit);

    // Apply filters
    if (signalType) {
      query = query.eq('signal_type', signalType);
    }
    
    if (competitorId) {
      query = query.eq('competitor_id', competitorId);
    }

    if (priority === 'high') {
      // High priority: importance >= 0.7 OR confidence >= 0.8
      query = query.or('importance_score.gte.0.7,confidence_score.gte.0.8');
    }

    if (minImportance > 0) {
      query = query.gte('importance_score', minImportance);
    }

    if (minConfidence > 0) {
      query = query.gte('confidence_score', minConfidence);
    }

    const { data: signals, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get signal type counts for analytics
    const { data: signalCounts, error: countsError } = await supabase
      .from('intelligence_signals')
      .select('signal_type')
      .gte('detected_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

    let signalTypeCounts = {};
    if (!countsError && signalCounts) {
      signalTypeCounts = signalCounts.reduce((acc: any, signal: any) => {
        acc[signal.signal_type] = (acc[signal.signal_type] || 0) + 1;
        return acc;
      }, {});
    }

    return NextResponse.json({ 
      signals: signals || [],
      total: signals?.length || 0,
      signal_type_counts: signalTypeCounts,
      filters: {
        signal_type: signalType,
        competitor_id: competitorId,
        days,
        priority,
        min_importance: minImportance,
        min_confidence: minConfidence
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST endpoint for manually creating signals (for testing or manual input)
export async function POST(request: NextRequest) {
  try {
    // Handle missing Supabase client during build
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      );
    }
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.competitor_id || !body.signal_type || !body.title) {
      return NextResponse.json(
        { error: 'competitor_id, signal_type, and title are required' },
        { status: 400 }
      );
    }

    const { data: signal, error } = await supabase
      .from('intelligence_signals')
      .insert({
        competitor_id: body.competitor_id,
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
      .select(`
        *,
        competitors (name, domain),
        monitoring_sources (source_name, source_type)
      `)
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