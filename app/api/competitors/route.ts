import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const threatLevel = searchParams.get('threat_level');
    const competitorType = searchParams.get('competitor_type');
    const search = searchParams.get('search');

    let query = supabase
      .from('competitors')
      .select(`
        *,
        monitoring_sources!inner(count),
        intelligence_signals(count)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    
    if (threatLevel) {
      query = query.eq('threat_level', threatLevel);
    }
    
    if (competitorType) {
      query = query.eq('competitor_type', competitorType);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%, domain.ilike.%${search}%, description.ilike.%${search}%`);
    }

    const { data: competitors, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      competitors: competitors || [],
      total: competitors?.length || 0 
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Insert competitor
    const { data: competitor, error } = await supabase
      .from('competitors')
      .insert({
        name: body.name,
        domain: body.domain,
        description: body.description,
        industry: body.industry,
        company_size: body.company_size,
        location: body.location,
        funding_stage: body.funding_stage,
        competitor_type: body.competitor_type || 'direct',
        threat_level: body.threat_level || 'medium',
        market_position: body.market_position,
        key_differentiators: body.key_differentiators || [],
        target_segments: body.target_segments || [],
        pricing_model: body.pricing_model,
        last_funding_amount: body.last_funding_amount,
        last_funding_date: body.last_funding_date,
        employee_count: body.employee_count,
        annual_revenue: body.annual_revenue,
        status: body.status || 'active',
        notes: body.notes
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create default monitoring sources if provided
    if (body.monitoring_sources && body.monitoring_sources.length > 0) {
      const sources = body.monitoring_sources.map((source: any) => ({
        ...source,
        competitor_id: competitor.id
      }));

      const { error: sourcesError } = await supabase
        .from('monitoring_sources')
        .insert(sources);

      if (sourcesError) {
        console.error('Sources creation error:', sourcesError);
      }
    }

    return NextResponse.json({ competitor }, { status: 201 });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}