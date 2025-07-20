import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: sources, error } = await supabase
      .from('monitoring_sources')
      .select('*')
      .eq('competitor_id', params.id)
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
  { params }: { params: { id: string } }
) {
  try {
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
        competitor_id: params.id,
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