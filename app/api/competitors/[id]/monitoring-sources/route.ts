import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../../lib/supabase-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Handle missing Supabase client during build
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      );
    }
    
    const { id } = await params;
    const { data: sources, error } = await supabase
      .from('monitoring_sources')
      .select('*')
      .eq('competitor_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ sources: sources || [] });

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
    // Handle missing Supabase client during build
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      );
    }
    
    const { id } = await params;
    const body = await request.json();
    
    // Validate required fields
    if (!body.source_type || !body.source_url) {
      return NextResponse.json(
        { error: 'source_type and source_url are required' },
        { status: 400 }
      );
    }

    // Insert monitoring source
    const { data: source, error } = await supabase
      .from('monitoring_sources')
      .insert({
        competitor_id: id,
        source_type: body.source_type,
        source_url: body.source_url,
        source_name: body.source_name,
        monitoring_frequency: body.monitoring_frequency || 'daily',
        is_active: body.is_active !== undefined ? body.is_active : true,
        monitoring_config: body.monitoring_config || {}
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ source }, { status: 201 });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}