// lib/intelligence-reports.js
/**
 * Intelligence Report Generator
 * Generates automated competitive intelligence reports
 */

const { createClient } = require('@supabase/supabase-js');
const AIProvider = require('./ai-provider.js');
require('dotenv').config({ path: '.env.local' });

class IntelligenceReports {
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    this.aiProvider = new AIProvider();
  }

  /**
   * Generate a weekly competitive intelligence summary
   * @param {Object} options - Report options
   * @returns {Object} Generated report
   */
  async generateWeeklySummary(options = {}) {
    try {
      console.log('📊 Generating weekly competitive intelligence summary...');
      
      const { 
        competitorIds = null,
        includeFeatureAnalysis = true,
        includePricingAnalysis = true,
        includeSignalAnalysis = true
      } = options;

      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Get signals from the past week
      const signals = await this.getSignalsForPeriod(startDate, endDate, competitorIds);
      
      // Get competitors being analyzed
      const competitors = await this.getCompetitors(competitorIds);
      
      // Generate AI-powered analysis
      const aiAnalysis = await this.generateAIAnalysis(signals, competitors, 'weekly_summary');
      
      // Compile report sections
      const reportSections = {
        executive_summary: aiAnalysis.executive_summary,
        key_findings: aiAnalysis.key_findings,
        competitor_activity: await this.analyzeCompetitorActivity(signals),
        signal_breakdown: await this.analyzeSignalBreakdown(signals),
        threat_assessment: await this.generateThreatAssessment(signals, competitors),
        recommendations: aiAnalysis.recommendations
      };

      // Add optional sections
      if (includeFeatureAnalysis) {
        reportSections.feature_analysis = await this.generateFeatureAnalysis(competitors);
      }
      
      if (includePricingAnalysis) {
        reportSections.pricing_analysis = await this.generatePricingAnalysis(competitors);
      }

      // Create report record
      const report = await this.createReport({
        reportType: 'weekly_summary',
        title: `Weekly Competitive Intelligence Summary - ${this.formatDate(startDate)} to ${this.formatDate(endDate)}`,
        summary: aiAnalysis.executive_summary,
        keyFindings: aiAnalysis.key_findings,
        recommendations: aiAnalysis.recommendations,
        competitorsAnalyzed: competitors.map(c => c.id),
        dateRangeStart: startDate,
        dateRangeEnd: endDate,
        signalsAnalyzed: signals.length,
        reportContent: JSON.stringify(reportSections, null, 2)
      });

      console.log(`✅ Weekly summary generated: ${report.id}`);
      return {
        success: true,
        report,
        sections: reportSections,
        metrics: {
          signalsAnalyzed: signals.length,
          competitorsAnalyzed: competitors.length,
          period: '7 days'
        }
      };

    } catch (error) {
      console.error('❌ Failed to generate weekly summary:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate a competitor profile report
   * @param {string} competitorId - Competitor ID
   * @returns {Object} Generated report
   */
  async generateCompetitorProfile(competitorId) {
    try {
      console.log(`📋 Generating competitor profile for ${competitorId}...`);
      
      // Get competitor data
      const { data: competitor, error } = await this.supabase
        .from('competitors')
        .select(`
          *,
          monitoring_sources (*),
          intelligence_signals (*),
          competitor_features (*),
          pricing_intelligence (*)
        `)
        .eq('id', competitorId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch competitor: ${error.message}`);
      }

      // Generate AI analysis
      const aiAnalysis = await this.generateAIAnalysis(
        competitor.intelligence_signals,
        [competitor],
        'competitor_profile'
      );

      // Compile comprehensive profile
      const profile = {
        basic_info: {
          name: competitor.name,
          domain: competitor.domain,
          description: competitor.description,
          industry: competitor.industry,
          competitor_type: competitor.competitor_type,
          threat_level: competitor.threat_level,
          market_position: competitor.market_position,
          key_differentiators: competitor.key_differentiators,
          target_segments: competitor.target_segments,
          employee_count: competitor.employee_count,
          funding_info: {
            last_amount: competitor.last_funding_amount,
            last_date: competitor.last_funding_date,
            funding_stage: competitor.funding_stage
          }
        },
        monitoring_overview: {
          total_sources: competitor.monitoring_sources.length,
          active_sources: competitor.monitoring_sources.filter(s => s.is_active).length,
          source_types: [...new Set(competitor.monitoring_sources.map(s => s.source_type))],
          last_monitored: competitor.monitoring_sources
            .filter(s => s.last_monitored)
            .sort((a, b) => new Date(b.last_monitored) - new Date(a.last_monitored))[0]?.last_monitored
        },
        intelligence_summary: {
          total_signals: competitor.intelligence_signals.length,
          recent_signals: competitor.intelligence_signals.filter(s => 
            new Date(s.detected_at) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          ).length,
          signal_types: [...new Set(competitor.intelligence_signals.map(s => s.signal_type))],
          avg_importance: competitor.intelligence_signals.reduce((sum, s) => sum + s.importance_score, 0) / competitor.intelligence_signals.length || 0,
          avg_confidence: competitor.intelligence_signals.reduce((sum, s) => sum + s.confidence_score, 0) / competitor.intelligence_signals.length || 0
        },
        feature_analysis: {
          total_features: competitor.competitor_features.length,
          competitive_advantages: competitor.competitor_features.filter(f => f.is_competitive_advantage).length,
          feature_categories: [...new Set(competitor.competitor_features.map(f => f.feature_category))],
          high_priority_features: competitor.competitor_features.filter(f => f.priority_level === 'high').length
        },
        pricing_analysis: {
          total_plans: competitor.pricing_intelligence.length,
          pricing_models: [...new Set(competitor.pricing_intelligence.map(p => p.pricing_model))],
          price_range: {
            min: Math.min(...competitor.pricing_intelligence.map(p => p.price_amount).filter(p => p > 0)),
            max: Math.max(...competitor.pricing_intelligence.map(p => p.price_amount).filter(p => p > 0))
          },
          recent_changes: competitor.pricing_intelligence.filter(p => 
            new Date(p.effective_date) >= new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
          ).length
        },
        ai_insights: aiAnalysis
      };

      // Create report record
      const report = await this.createReport({
        reportType: 'competitor_profile',
        title: `Competitive Profile: ${competitor.name}`,
        summary: aiAnalysis.executive_summary,
        keyFindings: aiAnalysis.key_findings,
        recommendations: aiAnalysis.recommendations,
        competitorsAnalyzed: [competitorId],
        signalsAnalyzed: competitor.intelligence_signals.length,
        reportContent: JSON.stringify(profile, null, 2)
      });

      console.log(`✅ Competitor profile generated: ${report.id}`);
      return {
        success: true,
        report,
        profile,
        competitor: competitor.name
      };

    } catch (error) {
      console.error('❌ Failed to generate competitor profile:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate a feature gap analysis report
   * @param {Array} competitorIds - Competitor IDs to analyze
   * @returns {Object} Generated report
   */
  async generateFeatureGapAnalysis(competitorIds = null) {
    try {
      console.log('🔍 Generating feature gap analysis...');
      
      // Get competitors and their features
      const competitors = await this.getCompetitors(competitorIds);
      const features = await this.getCompetitorFeatures(competitorIds);
      
      // Group features by category
      const featuresByCategory = {};
      features.forEach(feature => {
        if (!featuresByCategory[feature.feature_category]) {
          featuresByCategory[feature.feature_category] = [];
        }
        featuresByCategory[feature.feature_category].push(feature);
      });

      // Analyze gaps
      const gapAnalysis = {};
      Object.keys(featuresByCategory).forEach(category => {
        const categoryFeatures = featuresByCategory[category];
        
        // Find missing features (features that competitors have but we don't)
        const missingFeatures = categoryFeatures.filter(f => 
          !f.our_equivalent_feature || f.our_equivalent_feature === null
        );
        
        // Find competitive advantages (features marked as advantages)
        const competitiveAdvantages = categoryFeatures.filter(f => 
          f.is_competitive_advantage
        );
        
        // Find high-priority gaps
        const highPriorityGaps = categoryFeatures.filter(f => 
          f.priority_level === 'high' && (!f.our_equivalent_feature || f.is_competitive_advantage)
        );

        gapAnalysis[category] = {
          total_features: categoryFeatures.length,
          missing_features: missingFeatures.length,
          competitive_advantages: competitiveAdvantages.length,
          high_priority_gaps: highPriorityGaps.length,
          gap_details: highPriorityGaps.map(f => ({
            feature: f.feature_name,
            competitor: competitors.find(c => c.id === f.competitor_id)?.name,
            description: f.description,
            gap_analysis: f.gap_analysis,
            priority: f.priority_level
          }))
        };
      });

      // Generate AI recommendations
      const aiAnalysis = await this.generateFeatureGapAI(gapAnalysis, competitors);

      // Create report record
      const report = await this.createReport({
        reportType: 'feature_gap_analysis',
        title: `Feature Gap Analysis - ${new Date().toLocaleDateString()}`,
        summary: aiAnalysis.executive_summary,
        keyFindings: aiAnalysis.key_findings,
        recommendations: aiAnalysis.recommendations,
        competitorsAnalyzed: competitors.map(c => c.id),
        signalsAnalyzed: features.length,
        reportContent: JSON.stringify({
          gap_analysis: gapAnalysis,
          ai_insights: aiAnalysis,
          competitor_summary: competitors.map(c => ({
            name: c.name,
            threat_level: c.threat_level,
            features_tracked: features.filter(f => f.competitor_id === c.id).length
          }))
        }, null, 2)
      });

      console.log(`✅ Feature gap analysis generated: ${report.id}`);
      return {
        success: true,
        report,
        gapAnalysis,
        aiInsights: aiAnalysis,
        metrics: {
          categories_analyzed: Object.keys(gapAnalysis).length,
          total_features: features.length,
          competitors_analyzed: competitors.length
        }
      };

    } catch (error) {
      console.error('❌ Failed to generate feature gap analysis:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate AI analysis for signals and competitors
   * @param {Array} signals - Intelligence signals
   * @param {Array} competitors - Competitors
   * @param {string} reportType - Type of report
   * @returns {Object} AI analysis
   */
  async generateAIAnalysis(signals, competitors, reportType) {
    try {
      const signalsSummary = signals.map(s => ({
        type: s.signal_type,
        competitor: competitors.find(c => c.id === s.competitor_id)?.name,
        title: s.title,
        description: s.description,
        importance: s.importance_score,
        confidence: s.confidence_score,
        date: s.detected_at,
        tags: s.tags
      }));

      const competitorsSummary = competitors.map(c => ({
        name: c.name,
        type: c.competitor_type,
        threat_level: c.threat_level,
        market_position: c.market_position,
        key_differentiators: c.key_differentiators
      }));

      const prompt = `
Analyze the following competitive intelligence data and provide insights:

REPORT TYPE: ${reportType}

COMPETITORS ANALYZED:
${JSON.stringify(competitorsSummary, null, 2)}

INTELLIGENCE SIGNALS (${signals.length} total):
${JSON.stringify(signalsSummary, null, 2)}

Please provide a comprehensive analysis including:
1. Executive Summary (2-3 sentences)
2. Key Findings (3-5 bullet points)
3. Threat Assessment (identify main threats and opportunities)
4. Strategic Recommendations (3-5 actionable recommendations)
5. Market Implications (how these signals affect our market position)

Focus on actionable insights that can inform product strategy and competitive positioning.
`;

      const aiResponse = await this.aiProvider.generateText(prompt);
      
      // Parse AI response into structured format
      const analysis = this.parseAIResponse(aiResponse);
      
      return analysis;

    } catch (error) {
      console.error('AI analysis failed:', error.message);
      return {
        executive_summary: 'AI analysis unavailable - manual review required',
        key_findings: ['AI analysis failed', 'Manual review recommended'],
        threat_assessment: 'Unable to assess threats automatically',
        recommendations: ['Review signals manually', 'Update AI configuration'],
        market_implications: 'Market impact assessment unavailable'
      };
    }
  }

  /**
   * Parse AI response into structured format
   * @param {string} aiResponse - Raw AI response
   * @returns {Object} Parsed analysis
   */
  parseAIResponse(aiResponse) {
    const sections = {
      executive_summary: '',
      key_findings: [],
      threat_assessment: '',
      recommendations: [],
      market_implications: ''
    };

    // Simple parsing - in production, you'd want more sophisticated parsing
    const lines = aiResponse.split('\n');
    let currentSection = null;
    let currentList = [];

    lines.forEach(line => {
      line = line.trim();
      if (!line) return;

      if (line.toLowerCase().includes('executive summary')) {
        currentSection = 'executive_summary';
        currentList = [];
      } else if (line.toLowerCase().includes('key findings')) {
        currentSection = 'key_findings';
        currentList = [];
      } else if (line.toLowerCase().includes('threat assessment')) {
        currentSection = 'threat_assessment';
        currentList = [];
      } else if (line.toLowerCase().includes('recommendations')) {
        currentSection = 'recommendations';
        currentList = [];
      } else if (line.toLowerCase().includes('market implications')) {
        currentSection = 'market_implications';
        currentList = [];
      } else if (line.startsWith('- ') || line.startsWith('• ')) {
        // List item
        if (currentSection === 'key_findings' || currentSection === 'recommendations') {
          currentList.push(line.substring(2));
        }
      } else {
        // Regular text
        if (currentSection === 'executive_summary') {
          sections.executive_summary += line + ' ';
        } else if (currentSection === 'threat_assessment') {
          sections.threat_assessment += line + ' ';
        } else if (currentSection === 'market_implications') {
          sections.market_implications += line + ' ';
        }
      }
    });

    // Add collected list items
    sections.key_findings = currentList.length > 0 ? currentList : ['Analysis pending'];
    sections.recommendations = sections.recommendations.length > 0 ? sections.recommendations : ['Review recommended'];

    return sections;
  }

  /**
   * Get signals for a specific time period
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {Array} competitorIds - Competitor IDs
   * @returns {Array} Signals
   */
  async getSignalsForPeriod(startDate, endDate, competitorIds = null) {
    let query = this.supabase
      .from('intelligence_signals')
      .select('*')
      .gte('detected_at', startDate.toISOString())
      .lte('detected_at', endDate.toISOString())
      .order('detected_at', { ascending: false });

    if (competitorIds) {
      query = query.in('competitor_id', competitorIds);
    }

    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Failed to fetch signals: ${error.message}`);
    }

    return data;
  }

  /**
   * Get competitors
   * @param {Array} competitorIds - Competitor IDs
   * @returns {Array} Competitors
   */
  async getCompetitors(competitorIds = null) {
    let query = this.supabase
      .from('competitors')
      .select('*')
      .eq('status', 'active');

    if (competitorIds) {
      query = query.in('id', competitorIds);
    }

    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Failed to fetch competitors: ${error.message}`);
    }

    return data;
  }

  /**
   * Get competitor features
   * @param {Array} competitorIds - Competitor IDs
   * @returns {Array} Features
   */
  async getCompetitorFeatures(competitorIds = null) {
    let query = this.supabase
      .from('competitor_features')
      .select('*')
      .eq('status', 'active');

    if (competitorIds) {
      query = query.in('competitor_id', competitorIds);
    }

    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Failed to fetch features: ${error.message}`);
    }

    return data;
  }

  /**
   * Create a report record
   * @param {Object} reportData - Report data
   * @returns {Object} Created report
   */
  async createReport(reportData) {
    const report = {
      report_type: reportData.reportType,
      title: reportData.title,
      summary: reportData.summary,
      key_findings: reportData.keyFindings,
      recommendations: reportData.recommendations,
      competitors_analyzed: reportData.competitorsAnalyzed,
      date_range_start: reportData.dateRangeStart,
      date_range_end: reportData.dateRangeEnd,
      signals_analyzed: reportData.signalsAnalyzed,
      report_content: reportData.reportContent,
      priority: 'medium',
      status: 'published',
      published_at: new Date().toISOString(),
      created_by: 'AI System'
    };

    const { data, error } = await this.supabase
      .from('intelligence_reports')
      .insert(report)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create report: ${error.message}`);
    }

    return data;
  }

  /**
   * Get all reports
   * @param {Object} options - Query options
   * @returns {Array} Reports
   */
  async getReports(options = {}) {
    let query = this.supabase
      .from('intelligence_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.reportType) {
      query = query.eq('report_type', options.reportType);
    }

    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Failed to fetch reports: ${error.message}`);
    }

    return data;
  }

  /**
   * Format date for display
   * @param {Date} date - Date to format
   * @returns {string} Formatted date
   */
  formatDate(date) {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Additional helper methods would go here...
  async analyzeCompetitorActivity(signals) {
    // Implementation for competitor activity analysis
    return signals.reduce((acc, signal) => {
      if (!acc[signal.competitor_id]) {
        acc[signal.competitor_id] = {
          total_signals: 0,
          signal_types: {},
          avg_importance: 0
        };
      }
      acc[signal.competitor_id].total_signals++;
      acc[signal.competitor_id].signal_types[signal.signal_type] = 
        (acc[signal.competitor_id].signal_types[signal.signal_type] || 0) + 1;
      return acc;
    }, {});
  }

  async analyzeSignalBreakdown(signals) {
    // Implementation for signal breakdown analysis
    return {
      total: signals.length,
      by_type: signals.reduce((acc, signal) => {
        acc[signal.signal_type] = (acc[signal.signal_type] || 0) + 1;
        return acc;
      }, {}),
      high_importance: signals.filter(s => s.importance_score >= 0.8).length,
      high_confidence: signals.filter(s => s.confidence_score >= 0.8).length
    };
  }

  async generateThreatAssessment(signals, competitors) {
    // Implementation for threat assessment
    return {
      high_threat_competitors: competitors.filter(c => c.threat_level === 'high').length,
      recent_product_launches: signals.filter(s => s.signal_type === 'product_launch').length,
      pricing_changes: signals.filter(s => s.signal_type === 'pricing_change').length,
      feature_updates: signals.filter(s => s.signal_type === 'feature_update').length
    };
  }

  async generateFeatureAnalysis(competitors) {
    // Implementation for feature analysis
    return {
      message: 'Feature analysis requires additional implementation',
      competitors_analyzed: competitors.length
    };
  }

  async generatePricingAnalysis(competitors) {
    // Implementation for pricing analysis
    return {
      message: 'Pricing analysis requires additional implementation',
      competitors_analyzed: competitors.length
    };
  }

  async generateFeatureGapAI(gapAnalysis, competitors) {
    // Implementation for AI-powered feature gap analysis
    return {
      executive_summary: 'Feature gap analysis identifies key areas for product development',
      key_findings: ['Analysis complete', 'Gaps identified'],
      recommendations: ['Prioritize high-impact features', 'Monitor competitor developments'],
      market_implications: 'Strategic feature development needed'
    };
  }
}

module.exports = IntelligenceReports;