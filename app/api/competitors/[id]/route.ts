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
    const { data: competitor, error } = await supabase
      .from('competitors')
      .select(`
        *,
        monitoring_sources (*),
        intelligence_signals (
          id,
          signal_type,
          title,
          description,
          detected_at,
          importance_score,
          confidence_score,
          tags
        ),
        competitor_features (*),
        pricing_intelligence (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Competitor not found' },
          { status: 404 }
        );
      }
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ competitor });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Update competitor
    const { data: competitor, error } = await supabase
      .from('competitors')
      .update({
        name: body.name,
        domain: body.domain,
        description: body.description,
        industry: body.industry,
        company_size: body.company_size,
        location: body.location,
        funding_stage: body.funding_stage,
        competitor_type: body.competitor_type,
        threat_level: body.threat_level,
        market_position: body.market_position,
        key_differentiators: body.key_differentiators,
        target_segments: body.target_segments,
        pricing_model: body.pricing_model,
        last_funding_amount: body.last_funding_amount,
        last_funding_date: body.last_funding_date,
        employee_count: body.employee_count,
        annual_revenue: body.annual_revenue,
        status: body.status,
        notes: body.notes
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Competitor not found' },
          { status: 404 }
        );
      }
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ competitor });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = await supabase
      .from('competitors')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Competitor deleted successfully' });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}