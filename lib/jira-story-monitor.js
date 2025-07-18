// lib/jira-story-monitor.js
/**
 * JIRA Story Monitoring System for Competitive Intelligence
 * Monitors JIRA stories for competitive insights and customer-impacting changes
 */

const JiraIntegration = require('./jira-integration.js');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

class JiraStoryMonitor extends JiraIntegration {
  constructor() {
    super();
    this.competitiveIntelTags = [
      'competitive-feature',
      'customer-requested',
      'market-driven',
      'competitor-response',
      'strategic-initiative',
      'customer-impact'
    ];
    
    this.storyTypes = [
      'Story',
      'Epic',
      'Feature',
      'Initiative',
      'Task',
      'Bug'
    ];
  }

  /**
   * Monitor JIRA stories for competitive intelligence signals
   * @param {Object} options - Monitoring options
   * @returns {Object} Monitoring results
   */
  async monitorForCompetitiveIntelligence(options = {}) {
    try {
      console.log('🔍 Monitoring JIRA stories for competitive intelligence...');
      
      const {
        lookbackDays = 30,
        includeCompleted = true,
        includeInProgress = true,
        includeBacklog = false
      } = options;

      const results = {
        stories_analyzed: 0,
        competitive_signals: 0,
        customer_impact_stories: 0,
        strategic_initiatives: 0,
        signals: []
      };

      // Get stories with competitive intelligence potential
      const competitiveStories = await this.getCompetitiveStories({
        lookbackDays,
        includeCompleted,
        includeInProgress,
        includeBacklog
      });

      results.stories_analyzed = competitiveStories.length;

      // Analyze each story for competitive intelligence
      for (const story of competitiveStories) {
        const analysis = await this.analyzeStoryForIntelligence(story);
        
        if (analysis.isCompetitive) {
          results.competitive_signals++;
          results.signals.push(analysis);
          
          // Create competitive intelligence signal
          await this.createCompetitiveSignal(story, analysis);
        }
        
        if (analysis.hasCustomerImpact) {
          results.customer_impact_stories++;
        }
        
        if (analysis.isStrategicInitiative) {
          results.strategic_initiatives++;
        }
      }

      console.log(`✅ Competitive intelligence monitoring complete: ${results.competitive_signals} signals detected`);
      return results;

    } catch (error) {
      console.error('❌ JIRA competitive intelligence monitoring failed:', error.message);
      throw error;
    }
  }

  /**
   * Get stories with competitive intelligence potential
   * @param {Object} options - Query options
   * @returns {Array} Stories
   */
  async getCompetitiveStories(options = {}) {
    try {
      const {
        lookbackDays = 30,
        includeCompleted = true,
        includeInProgress = true,
        includeBacklog = false
      } = options;

      const statusFilters = [];
      if (includeCompleted) statusFilters.push('"Done"', '"Closed"', '"Resolved"');
      if (includeInProgress) statusFilters.push('"In Progress"', '"In Review"', '"Testing"');
      if (includeBacklog) statusFilters.push('"To Do"', '"Backlog"', '"Selected for Development"');

      const statusClause = statusFilters.length > 0 ? `AND status IN (${statusFilters.join(', ')})` : '';
      const dateClause = lookbackDays > 0 ? `AND updated >= -${lookbackDays}d` : '';

      // Build JQL query for competitive intelligence
      const jql = `
        project = "${this.projectKey}" 
        ${statusClause}
        ${dateClause}
        AND (
          labels IN (${this.competitiveIntelTags.map(tag => `"${tag}"`).join(', ')})
          OR summary ~ "competitor*"
          OR summary ~ "market*"
          OR summary ~ "customer*"
          OR description ~ "competitive*"
          OR description ~ "market*"
          OR description ~ "customer*"
        )
        ORDER BY updated DESC
      `.trim();

      const response = await this.jiraApi.get('/search', {
        params: {
          jql,
          maxResults: 100,
          fields: 'summary,description,status,labels,updated,created,assignee,priority,issuetype,components,fixVersions,customfield_10016,customfield_10020,customfield_10021', // Common custom fields
          expand: 'changelog'
        }
      });

      const stories = response.data.issues.map(issue => ({
        key: issue.key,
        id: issue.id,
        type: issue.fields.issuetype.name,
        summary: issue.fields.summary,
        description: issue.fields.description || '',
        status: issue.fields.status.name,
        labels: issue.fields.labels || [],
        components: issue.fields.components?.map(c => c.name) || [],
        fixVersions: issue.fields.fixVersions?.map(v => v.name) || [],
        priority: issue.fields.priority?.name || 'Medium',
        assignee: issue.fields.assignee ? {
          displayName: issue.fields.assignee.displayName,
          emailAddress: issue.fields.assignee.emailAddress
        } : null,
        storyPoints: issue.fields.customfield_10016,
        sprint: issue.fields.customfield_10020,
        epic: issue.fields.customfield_10021,
        created: issue.fields.created,
        updated: issue.fields.updated,
        changelog: issue.changelog,
        url: `${this.baseUrl}/browse/${issue.key}`
      }));

      return stories;

    } catch (error) {
      console.error('Failed to get competitive stories:', error.message);
      return [];
    }
  }

  /**
   * Analyze a story for competitive intelligence value
   * @param {Object} story - JIRA story
   * @returns {Object} Analysis results
   */
  async analyzeStoryForIntelligence(story) {
    const analysis = {
      isCompetitive: false,
      hasCustomerImpact: false,
      isStrategicInitiative: false,
      competitiveScore: 0,
      customerImpactScore: 0,
      strategicScore: 0,
      signals: [],
      categories: []
    };

    const text = `${story.summary} ${story.description}`.toLowerCase();
    const labels = story.labels.map(l => l.toLowerCase());
    const components = story.components.map(c => c.toLowerCase());

    // Check for competitive intelligence indicators
    const competitiveKeywords = [
      'competitor', 'competitive', 'market', 'rival', 'competing',
      'benchmark', 'parity', 'differentiation', 'advantage',
      'feature gap', 'market share', 'positioning'
    ];

    const customerImpactKeywords = [
      'customer', 'client', 'user', 'feedback', 'request',
      'pain point', 'satisfaction', 'retention', 'churn',
      'experience', 'journey', 'needs', 'requirements'
    ];

    const strategicKeywords = [
      'strategic', 'initiative', 'roadmap', 'vision',
      'goal', 'objective', 'milestone', 'priority',
      'investment', 'growth', 'expansion', 'transformation'
    ];

    // Analyze competitive signals
    competitiveKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        analysis.competitiveScore += 1;
        analysis.signals.push(`Competitive keyword: ${keyword}`);
      }
    });

    // Analyze customer impact signals
    customerImpactKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        analysis.customerImpactScore += 1;
        analysis.signals.push(`Customer impact keyword: ${keyword}`);
      }
    });

    // Analyze strategic signals
    strategicKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        analysis.strategicScore += 1;
        analysis.signals.push(`Strategic keyword: ${keyword}`);
      }
    });

    // Check labels for competitive intelligence tags
    this.competitiveIntelTags.forEach(tag => {
      if (labels.includes(tag.toLowerCase())) {
        analysis.competitiveScore += 3;
        analysis.signals.push(`Competitive label: ${tag}`);
      }
    });

    // Analyze story type impact
    if (['Epic', 'Initiative', 'Feature'].includes(story.type)) {
      analysis.strategicScore += 2;
      analysis.signals.push(`Strategic story type: ${story.type}`);
    }

    // Analyze priority impact
    if (['Highest', 'High'].includes(story.priority)) {
      analysis.strategicScore += 1;
      analysis.signals.push(`High priority: ${story.priority}`);
    }

    // Determine categories
    if (analysis.competitiveScore >= 2) {
      analysis.isCompetitive = true;
      analysis.categories.push('competitive_intelligence');
    }

    if (analysis.customerImpactScore >= 2) {
      analysis.hasCustomerImpact = true;
      analysis.categories.push('customer_impact');
    }

    if (analysis.strategicScore >= 3) {
      analysis.isStrategicInitiative = true;
      analysis.categories.push('strategic_initiative');
    }

    // Calculate overall competitive intelligence value
    const overallScore = analysis.competitiveScore + analysis.customerImpactScore + analysis.strategicScore;
    analysis.overallScore = overallScore;
    analysis.isCompetitive = overallScore >= 3;

    return analysis;
  }

  /**
   * Create competitive intelligence signal from JIRA story
   * @param {Object} story - JIRA story
   * @param {Object} analysis - Story analysis
   * @returns {Object} Created signal
   */
  async createCompetitiveSignal(story, analysis) {
    try {
      // First, check if we have a competitive intelligence system
      const { data: existingSignal } = await this.supabase
        .from('intelligence_signals')
        .select('*')
        .eq('url', story.url)
        .single();

      if (existingSignal) {
        console.log(`Signal already exists for ${story.key}`);
        return existingSignal;
      }

      // Create a "competitor" entry for internal/own company
      let { data: internalCompetitor } = await this.supabase
        .from('competitors')
        .select('*')
        .eq('name', 'Internal Development')
        .single();

      if (!internalCompetitor) {
        const { data: newCompetitor, error: competitorError } = await this.supabase
          .from('competitors')
          .insert({
            name: 'Internal Development',
            domain: 'internal.company',
            description: 'Internal development tracking for competitive intelligence',
            industry: 'Technology',
            competitor_type: 'internal',
            threat_level: 'low',
            status: 'active'
          })
          .select()
          .single();

        if (competitorError) {
          console.warn('Could not create internal competitor:', competitorError.message);
          return null;
        }

        internalCompetitor = newCompetitor;
      }

      // Create monitoring source for JIRA
      let { data: jiraSource } = await this.supabase
        .from('monitoring_sources')
        .select('*')
        .eq('competitor_id', internalCompetitor.id)
        .eq('source_type', 'jira')
        .single();

      if (!jiraSource) {
        const { data: newSource, error: sourceError } = await this.supabase
          .from('monitoring_sources')
          .insert({
            competitor_id: internalCompetitor.id,
            source_type: 'jira',
            source_url: this.baseUrl,
            source_name: 'JIRA Project Monitoring',
            monitoring_frequency: 'daily',
            is_active: true
          })
          .select()
          .single();

        if (sourceError) {
          console.warn('Could not create JIRA source:', sourceError.message);
          return null;
        }

        jiraSource = newSource;
      }

      // Determine signal type based on analysis
      let signalType = 'feature_update';
      if (analysis.categories.includes('competitive_intelligence')) {
        signalType = 'competitive_feature';
      } else if (analysis.categories.includes('strategic_initiative')) {
        signalType = 'strategic_initiative';
      } else if (analysis.categories.includes('customer_impact')) {
        signalType = 'customer_feedback';
      }

      // Create intelligence signal
      const signalData = {
        competitor_id: internalCompetitor.id,
        source_id: jiraSource.id,
        signal_type: signalType,
        title: `${story.key}: ${story.summary}`,
        description: story.description || 'No description provided',
        content: JSON.stringify({
          story_type: story.type,
          status: story.status,
          priority: story.priority,
          components: story.components,
          fix_versions: story.fixVersions,
          story_points: story.storyPoints,
          assignee: story.assignee,
          analysis: analysis
        }),
        url: story.url,
        detected_at: new Date().toISOString(),
        published_at: story.created,
        confidence_score: Math.min(analysis.overallScore / 10, 1.0),
        importance_score: Math.min(analysis.overallScore / 8, 1.0),
        tags: [
          ...story.labels,
          ...analysis.categories,
          story.type.toLowerCase(),
          story.priority.toLowerCase()
        ],
        metadata: {
          jira_key: story.key,
          jira_id: story.id,
          project_key: this.projectKey,
          analysis_score: analysis.overallScore,
          competitive_score: analysis.competitiveScore,
          customer_impact_score: analysis.customerImpactScore,
          strategic_score: analysis.strategicScore,
          signals: analysis.signals
        },
        is_processed: true,
        is_alert_sent: false
      };

      const { data: signal, error } = await this.supabase
        .from('intelligence_signals')
        .insert(signalData)
        .select()
        .single();

      if (error) {
        console.warn('Could not create intelligence signal:', error.message);
        return null;
      }

      console.log(`📊 Created competitive intelligence signal for ${story.key}`);
      return signal;

    } catch (error) {
      console.error('Failed to create competitive signal:', error.message);
      return null;
    }
  }

  /**
   * Get competitive intelligence analytics from JIRA monitoring
   * @param {number} days - Number of days to analyze
   * @returns {Object} Analytics data
   */
  async getCompetitiveAnalytics(days = 30) {
    try {
      const { data: signals, error } = await this.supabase
        .from('intelligence_signals')
        .select('*')
        .gte('detected_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .like('metadata->jira_key', '%')
        .order('detected_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to get competitive analytics: ${error.message}`);
      }

      const analytics = {
        total_signals: signals.length,
        by_type: {},
        by_priority: {},
        by_category: {},
        avg_competitive_score: 0,
        avg_customer_impact_score: 0,
        avg_strategic_score: 0,
        top_signals: signals.slice(0, 10),
        period_days: days
      };

      signals.forEach(signal => {
        // Count by signal type
        analytics.by_type[signal.signal_type] = (analytics.by_type[signal.signal_type] || 0) + 1;

        // Count by categories
        if (signal.tags) {
          signal.tags.forEach(tag => {
            if (['competitive_intelligence', 'customer_impact', 'strategic_initiative'].includes(tag)) {
              analytics.by_category[tag] = (analytics.by_category[tag] || 0) + 1;
            }
          });
        }

        // Calculate average scores
        if (signal.metadata) {
          analytics.avg_competitive_score += signal.metadata.competitive_score || 0;
          analytics.avg_customer_impact_score += signal.metadata.customer_impact_score || 0;
          analytics.avg_strategic_score += signal.metadata.strategic_score || 0;
        }
      });

      // Calculate averages
      if (signals.length > 0) {
        analytics.avg_competitive_score /= signals.length;
        analytics.avg_customer_impact_score /= signals.length;
        analytics.avg_strategic_score /= signals.length;
      }

      return analytics;

    } catch (error) {
      console.error('Failed to get competitive analytics:', error.message);
      throw error;
    }
  }

  /**
   * Generate competitive intelligence report from JIRA stories
   * @param {number} days - Number of days to analyze
   * @returns {Object} Report data
   */
  async generateCompetitiveReport(days = 30) {
    try {
      console.log(`📋 Generating competitive intelligence report for last ${days} days...`);

      const analytics = await this.getCompetitiveAnalytics(days);
      
      const report = {
        title: `JIRA Competitive Intelligence Report - Last ${days} Days`,
        generated_at: new Date().toISOString(),
        period: {
          days: days,
          start_date: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date().toISOString()
        },
        summary: {
          total_signals: analytics.total_signals,
          competitive_signals: analytics.by_category.competitive_intelligence || 0,
          customer_impact_signals: analytics.by_category.customer_impact || 0,
          strategic_signals: analytics.by_category.strategic_initiative || 0
        },
        insights: {
          most_common_signal_type: Object.keys(analytics.by_type).reduce((a, b) => 
            analytics.by_type[a] > analytics.by_type[b] ? a : b, 'none'),
          avg_competitive_score: analytics.avg_competitive_score.toFixed(2),
          avg_customer_impact_score: analytics.avg_customer_impact_score.toFixed(2),
          avg_strategic_score: analytics.avg_strategic_score.toFixed(2)
        },
        breakdown: {
          by_type: analytics.by_type,
          by_category: analytics.by_category
        },
        top_signals: analytics.top_signals.map(signal => ({
          title: signal.title,
          type: signal.signal_type,
          importance: signal.importance_score,
          confidence: signal.confidence_score,
          detected_at: signal.detected_at,
          jira_key: signal.metadata?.jira_key,
          url: signal.url
        }))
      };

      console.log(`✅ Competitive intelligence report generated: ${analytics.total_signals} signals analyzed`);
      return report;

    } catch (error) {
      console.error('Failed to generate competitive report:', error.message);
      throw error;
    }
  }
}

module.exports = JiraStoryMonitor;