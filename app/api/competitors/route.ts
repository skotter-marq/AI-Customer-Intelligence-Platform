import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase-client';

export async function GET(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const threatLevel = searchParams.get('threat_level');
    const competitorType = searchParams.get('competitor_type');
    const search = searchParams.get('search');

    let query = supabase
      .from('competitors')
      .select('*')
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
      query = query.or(`name.ilike.%${search}%, website_url.ilike.%${search}%, description.ilike.%${search}%`);
    }

    const { data: competitors, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Enhance competitors with related data counts
    const enhancedCompetitors = await Promise.all(
      (competitors || []).map(async (competitor) => {
        // Get monitoring sources count
        const { count: sourcesCount } = await supabase
          .from('competitor_monitoring_sources')
          .select('*', { count: 'exact', head: true })
          .eq('competitor_id', competitor.id);

        // Get insights count
        const { count: insightsCount } = await supabase
          .from('competitive_insights')
          .select('*', { count: 'exact', head: true })
          .eq('competitor_id', competitor.id);

        return {
          ...competitor,
          monitoring_sources_count: sourcesCount || 0,
          insights_count: insightsCount || 0,
          recent_insights: [] // Will be populated by separate query if needed
        };
      })
    );

    return NextResponse.json({ 
      competitors: enhancedCompetitors,
      total: enhancedCompetitors.length 
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
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
  }
  
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
        industry: body.industry || 'Technology',
        description: body.description,
        website_url: body.website_url || body.domain,
        logo_url: body.logo_url,
        market_cap: body.market_cap,
        employees: body.employees || body.employee_count,
        founded_year: body.founded_year,
        headquarters: body.headquarters || body.location,
        threat_level: body.threat_level || 'medium',
        status: body.status || 'active',
        confidence_score: body.confidence_score || 0.5,
        created_by: 'api'
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
        competitor_id: competitor.id,
        source_type: source.source_type || 'website',
        source_url: source.source_url || competitor.website_url,
        monitoring_frequency: source.monitoring_frequency || 'daily',
        is_active: source.is_active !== false
      }));

      const { error: sourcesError } = await supabase
        .from('competitor_monitoring_sources')
        .insert(sources);

      if (sourcesError) {
        console.error('Sources creation error:', sourcesError);
      }
    } else if (competitor.website_url) {
      // Create default website monitoring source
      await supabase
        .from('competitor_monitoring_sources')
        .insert({
          competitor_id: competitor.id,
          source_type: 'website',
          source_url: competitor.website_url,
          monitoring_frequency: 'daily',
          is_active: true
        });
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

export async function PUT(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Competitor ID is required' },
        { status: 400 }
      );
    }

    // Update competitor
    const { data: competitor, error } = await supabase
      .from('competitors')
      .update({
        name: body.name,
        industry: body.industry,
        description: body.description,
        website_url: body.website_url,
        logo_url: body.logo_url,
        market_cap: body.market_cap,
        employees: body.employees,
        founded_year: body.founded_year,
        headquarters: body.headquarters,
        threat_level: body.threat_level,
        status: body.status,
        confidence_score: body.confidence_score,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
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

export async function DELETE(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Competitor ID is required' },
        { status: 400 }
      );
    }

    // Get competitor details before deletion
    const { data: competitor } = await supabase
      .from('competitors')
      .select('name')
      .eq('id', id)
      .single();

    // Delete competitor (cascades to related tables)
    const { error } = await supabase
      .from('competitors')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Competitor deleted successfully',
      deleted_competitor: competitor?.name || 'Unknown'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}