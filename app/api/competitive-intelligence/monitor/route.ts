import { NextRequest, NextResponse } from 'next/server';
const CompetitiveIntelligence = require('../../../../lib/competitive-intelligence.js');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { competitor_ids, monitor_all } = body;

    const competitiveIntel = new CompetitiveIntelligence();

    let results;
    if (monitor_all) {
      // Monitor all active competitors
      results = await competitiveIntel.monitorAllCompetitors();
    } else if (competitor_ids && competitor_ids.length > 0) {
      // Monitor specific competitors
      results = {
        competitors_monitored: 0,
        sources_checked: 0,
        signals_detected: 0,
        errors: []
      };

      for (const competitorId of competitor_ids) {
        try {
          // Get competitor data
          const { createClient } = require('@supabase/supabase-js');
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          );

          const { data: competitor, error } = await supabase
            .from('competitors')
            .select(`
              *,
              monitoring_sources (*)
            `)
            .eq('id', competitorId)
            .single();

          if (error || !competitor) {
            throw new Error(`Competitor not found: ${competitorId}`);
          }

          const competitorResult = await competitiveIntel.monitorCompetitor(competitor);
          results.competitors_monitored++;
          results.sources_checked += competitorResult.sources_checked;
          results.signals_detected += competitorResult.signals_detected;
          results.errors.push(...competitorResult.errors);

        } catch (error) {
          console.error(`Error monitoring competitor ${competitorId}:`, error);
          results.errors.push({
            competitor_id: competitorId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    } else {
      return NextResponse.json(
        { error: 'Either monitor_all or competitor_ids must be provided' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      results,
      message: `Monitored ${results.competitors_monitored} competitors, detected ${results.signals_detected} signals`
    });

  } catch (error) {
    console.error('Monitoring API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check monitoring status
export async function GET(request: NextRequest) {
  try {
    const competitiveIntel = new CompetitiveIntelligence();
    const analytics = await competitiveIntel.getMonitoringAnalytics();
    
    return NextResponse.json({
      analytics,
      message: 'Monitoring system status retrieved successfully'
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}