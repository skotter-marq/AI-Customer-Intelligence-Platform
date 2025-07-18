// lib/competitive-intelligence.js
/**
 * Competitive Intelligence System
 * Monitors competitors across multiple channels and APIs
 */

const axios = require('axios');
const cheerio = require('cheerio');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

class CompetitiveIntelligence {
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Configure API clients
    this.setupApiClients();
  }

  setupApiClients() {
    // Web scraping client with proper headers
    this.webClient = axios.create({
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    // GitHub API client
    this.githubClient = axios.create({
      baseURL: 'https://api.github.com',
      timeout: 15000,
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'CompetitiveIntelligence/1.0'
      }
    });

    // Add GitHub token if available
    if (process.env.GITHUB_TOKEN) {
      this.githubClient.defaults.headers.common['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    // Product Hunt API client
    this.productHuntClient = axios.create({
      baseURL: 'https://api.producthunt.com/v2/api',
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'CompetitiveIntelligence/1.0'
      }
    });

    // Add Product Hunt token if available
    if (process.env.PRODUCT_HUNT_TOKEN) {
      this.productHuntClient.defaults.headers.common['Authorization'] = `Bearer ${process.env.PRODUCT_HUNT_TOKEN}`;
    }

    // Crunchbase API client
    this.crunchbaseClient = axios.create({
      baseURL: 'https://api.crunchbase.com/api/v4',
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CompetitiveIntelligence/1.0'
      }
    });

    // Add Crunchbase API key if available
    if (process.env.CRUNCHBASE_API_KEY) {
      this.crunchbaseClient.defaults.params = {
        user_key: process.env.CRUNCHBASE_API_KEY
      };
    }
  }

  /**
   * Monitor all active competitors
   * @returns {Object} Monitoring results
   */
  async monitorAllCompetitors() {
    try {
      console.log('🔍 Starting competitive intelligence monitoring...');
      
      // Get all active competitors with their monitoring sources
      const { data: competitors, error } = await this.supabase
        .from('competitors')
        .select(`
          *,
          monitoring_sources (*)
        `)
        .eq('status', 'active');

      if (error) {
        throw new Error(`Failed to fetch competitors: ${error.message}`);
      }

      const results = {
        competitors_monitored: 0,
        sources_checked: 0,
        signals_detected: 0,
        errors: []
      };

      for (const competitor of competitors) {
        try {
          console.log(`📊 Monitoring ${competitor.name}...`);
          
          const competitorResult = await this.monitorCompetitor(competitor);
          results.competitors_monitored++;
          results.sources_checked += competitorResult.sources_checked;
          results.signals_detected += competitorResult.signals_detected;
          
          if (competitorResult.errors.length > 0) {
            results.errors.push(...competitorResult.errors);
          }
          
        } catch (error) {
          console.error(`❌ Error monitoring ${competitor.name}:`, error.message);
          results.errors.push({
            competitor: competitor.name,
            error: error.message
          });
        }
      }

      console.log(`✅ Monitoring complete: ${results.competitors_monitored} competitors, ${results.signals_detected} signals detected`);
      return results;
      
    } catch (error) {
      console.error('❌ Competitive intelligence monitoring failed:', error.message);
      throw error;
    }
  }

  /**
   * Monitor a single competitor
   * @param {Object} competitor - Competitor data with monitoring sources
   * @returns {Object} Monitoring results
   */
  async monitorCompetitor(competitor) {
    const results = {
      sources_checked: 0,
      signals_detected: 0,
      errors: []
    };

    for (const source of competitor.monitoring_sources) {
      if (!source.is_active) continue;

      try {
        console.log(`  📡 Checking ${source.source_type}: ${source.source_name}`);
        
        const signals = await this.monitorSource(competitor.id, source);
        results.sources_checked++;
        results.signals_detected += signals.length;

        // Update last monitored timestamp
        await this.supabase
          .from('monitoring_sources')
          .update({ last_monitored: new Date().toISOString() })
          .eq('id', source.id);

        if (signals.length > 0) {
          console.log(`    ✅ Found ${signals.length} signals from ${source.source_name}`);
        }

      } catch (error) {
        console.error(`    ❌ Error monitoring ${source.source_name}:`, error.message);
        results.errors.push({
          competitor: competitor.name,
          source: source.source_name,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Monitor a specific source
   * @param {string} competitorId - Competitor ID
   * @param {Object} source - Monitoring source
   * @returns {Array} Detected signals
   */
  async monitorSource(competitorId, source) {
    const signals = [];

    switch (source.source_type) {
      case 'website':
        const websiteSignals = await this.monitorWebsite(competitorId, source);
        signals.push(...websiteSignals);
        break;

      case 'blog':
        const blogSignals = await this.monitorBlog(competitorId, source);
        signals.push(...blogSignals);
        break;

      case 'pricing_page':
        const pricingSignals = await this.monitorPricing(competitorId, source);
        signals.push(...pricingSignals);
        break;

      case 'product_updates':
        const productSignals = await this.monitorProductUpdates(competitorId, source);
        signals.push(...productSignals);
        break;

      case 'github':
        const githubSignals = await this.monitorGitHub(competitorId, source);
        signals.push(...githubSignals);
        break;

      case 'linkedin':
        const linkedinSignals = await this.monitorLinkedIn(competitorId, source);
        signals.push(...linkedinSignals);
        break;

      case 'twitter':
        const twitterSignals = await this.monitorTwitter(competitorId, source);
        signals.push(...twitterSignals);
        break;

      case 'product_hunt':
        const productHuntSignals = await this.monitorProductHunt(competitorId, source);
        signals.push(...productHuntSignals);
        break;

      case 'crunchbase':
        const crunchbaseSignals = await this.monitorCrunchbase(competitorId, source);
        signals.push(...crunchbaseSignals);
        break;

      default:
        console.warn(`    ⚠️  Unknown source type: ${source.source_type}`);
    }

    return signals;
  }

  /**
   * Monitor competitor website for changes
   * @param {string} competitorId - Competitor ID
   * @param {Object} source - Monitoring source
   * @returns {Array} Detected signals
   */
  async monitorWebsite(competitorId, source) {
    try {
      const response = await this.webClient.get(source.source_url);
      const $ = cheerio.load(response.data);
      const signals = [];

      // Extract key information
      const title = $('title').text().trim();
      const description = $('meta[name="description"]').attr('content') || '';
      const headings = $('h1, h2, h3').map((i, el) => $(el).text().trim()).get();

      // Look for new product announcements
      const productKeywords = ['launch', 'new', 'introducing', 'announce', 'release', 'beta', 'now available'];
      const content = $('body').text().toLowerCase();
      
      for (const keyword of productKeywords) {
        if (content.includes(keyword)) {
          const signal = await this.createSignal({
            competitorId,
            sourceId: source.id,
            signalType: 'product_launch',
            title: `Potential product announcement on ${source.source_name}`,
            description: `Keyword "${keyword}" detected in website content`,
            url: source.source_url,
            confidenceScore: 0.6,
            importanceScore: 0.7,
            tags: ['website', 'product', keyword]
          });
          signals.push(signal);
        }
      }

      return signals;
      
    } catch (error) {
      if (error.response?.status === 403 || error.response?.status === 429) {
        console.warn(`    ⚠️  Access limited for ${source.source_url}`);
        return [];
      }
      throw error;
    }
  }

  /**
   * Monitor competitor blog for new posts
   * @param {string} competitorId - Competitor ID
   * @param {Object} source - Monitoring source
   * @returns {Array} Detected signals
   */
  async monitorBlog(competitorId, source) {
    try {
      const response = await this.webClient.get(source.source_url);
      const $ = cheerio.load(response.data);
      const signals = [];

      // Look for blog posts (common blog structures)
      const posts = $('article, .post, .blog-post, [class*="post"]').slice(0, 5);
      
      posts.each(async (i, post) => {
        const $post = $(post);
        const title = $post.find('h1, h2, h3, .title, [class*="title"]').first().text().trim();
        const link = $post.find('a').first().attr('href');
        const excerpt = $post.find('p, .excerpt, [class*="excerpt"]').first().text().trim();

        if (title && title.length > 10) {
          const signal = await this.createSignal({
            competitorId,
            sourceId: source.id,
            signalType: 'blog_post',
            title: `New blog post: ${title}`,
            description: excerpt.substring(0, 500),
            url: link ? new URL(link, source.source_url).href : source.source_url,
            confidenceScore: 0.8,
            importanceScore: 0.6,
            tags: ['blog', 'content']
          });
          signals.push(signal);
        }
      });

      return signals;
      
    } catch (error) {
      if (error.response?.status === 403 || error.response?.status === 429) {
        console.warn(`    ⚠️  Access limited for ${source.source_url}`);
        return [];
      }
      throw error;
    }
  }

  /**
   * Monitor competitor pricing page
   * @param {string} competitorId - Competitor ID
   * @param {Object} source - Monitoring source
   * @returns {Array} Detected signals
   */
  async monitorPricing(competitorId, source) {
    try {
      const response = await this.webClient.get(source.source_url);
      const $ = cheerio.load(response.data);
      const signals = [];

      // Look for pricing information
      const priceElements = $('[class*="price"], [class*="cost"], [class*="plan"]');
      const prices = [];

      priceElements.each((i, el) => {
        const $el = $(el);
        const text = $el.text();
        const priceMatch = text.match(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)/);
        if (priceMatch) {
          prices.push({
            amount: priceMatch[1],
            context: text.trim()
          });
        }
      });

      if (prices.length > 0) {
        const signal = await this.createSignal({
          competitorId,
          sourceId: source.id,
          signalType: 'pricing_change',
          title: `Pricing information detected on ${source.source_name}`,
          description: `Found ${prices.length} pricing points: ${prices.map(p => '$' + p.amount).join(', ')}`,
          url: source.source_url,
          confidenceScore: 0.7,
          importanceScore: 0.8,
          tags: ['pricing', 'website'],
          metadata: { prices }
        });
        signals.push(signal);
      }

      return signals;
      
    } catch (error) {
      if (error.response?.status === 403 || error.response?.status === 429) {
        console.warn(`    ⚠️  Access limited for ${source.source_url}`);
        return [];
      }
      throw error;
    }
  }

  /**
   * Monitor product updates/changelog
   * @param {string} competitorId - Competitor ID
   * @param {Object} source - Monitoring source
   * @returns {Array} Detected signals
   */
  async monitorProductUpdates(competitorId, source) {
    try {
      const response = await this.webClient.get(source.source_url);
      const $ = cheerio.load(response.data);
      const signals = [];

      // Look for changelog entries
      const updates = $('[class*="update"], [class*="changelog"], [class*="release"], article, .entry').slice(0, 3);
      
      updates.each(async (i, update) => {
        const $update = $(update);
        const title = $update.find('h1, h2, h3, h4, .title').first().text().trim();
        const content = $update.find('p, .content, .description').first().text().trim();
        const date = $update.find('[class*="date"], time').first().text().trim();

        if (title && title.length > 5) {
          const signal = await this.createSignal({
            competitorId,
            sourceId: source.id,
            signalType: 'feature_update',
            title: `Product update: ${title}`,
            description: content.substring(0, 500),
            url: source.source_url,
            confidenceScore: 0.9,
            importanceScore: 0.8,
            tags: ['product_update', 'changelog'],
            metadata: { date }
          });
          signals.push(signal);
        }
      });

      return signals;
      
    } catch (error) {
      if (error.response?.status === 403 || error.response?.status === 429) {
        console.warn(`    ⚠️  Access limited for ${source.source_url}`);
        return [];
      }
      throw error;
    }
  }

  /**
   * Monitor GitHub repository
   * @param {string} competitorId - Competitor ID
   * @param {Object} source - Monitoring source
   * @returns {Array} Detected signals
   */
  async monitorGitHub(competitorId, source) {
    try {
      const urlParts = source.source_url.replace('https://github.com/', '').split('/');
      const owner = urlParts[0];
      const repo = urlParts[1];
      const signals = [];

      // Get recent releases
      const releasesResponse = await this.githubClient.get(`/repos/${owner}/${repo}/releases`);
      const releases = releasesResponse.data.slice(0, 3);

      for (const release of releases) {
        const signal = await this.createSignal({
          competitorId,
          sourceId: source.id,
          signalType: 'product_launch',
          title: `GitHub release: ${release.name || release.tag_name}`,
          description: release.body || 'New release published',
          url: release.html_url,
          confidenceScore: 0.9,
          importanceScore: 0.7,
          tags: ['github', 'release', 'open_source'],
          metadata: {
            tag: release.tag_name,
            published_at: release.published_at
          }
        });
        signals.push(signal);
      }

      return signals;
      
    } catch (error) {
      if (error.response?.status === 403 || error.response?.status === 404) {
        console.warn(`    ⚠️  GitHub access limited or repository not found`);
        return [];
      }
      throw error;
    }
  }

  /**
   * Monitor LinkedIn (placeholder - requires LinkedIn API access)
   * @param {string} competitorId - Competitor ID
   * @param {Object} source - Monitoring source
   * @returns {Array} Detected signals
   */
  async monitorLinkedIn(competitorId, source) {
    // LinkedIn requires special API access
    console.warn('    ⚠️  LinkedIn monitoring requires LinkedIn API access');
    return [];
  }

  /**
   * Monitor Twitter (placeholder - requires Twitter API access)
   * @param {string} competitorId - Competitor ID
   * @param {Object} source - Monitoring source
   * @returns {Array} Detected signals
   */
  async monitorTwitter(competitorId, source) {
    // Twitter requires API access
    console.warn('    ⚠️  Twitter monitoring requires Twitter API access');
    return [];
  }

  /**
   * Monitor Product Hunt
   * @param {string} competitorId - Competitor ID
   * @param {Object} source - Monitoring source
   * @returns {Array} Detected signals
   */
  async monitorProductHunt(competitorId, source) {
    try {
      if (!process.env.PRODUCT_HUNT_TOKEN) {
        console.warn('    ⚠️  Product Hunt monitoring requires API token');
        return [];
      }

      // Extract product slug from URL
      const urlParts = source.source_url.split('/');
      const productSlug = urlParts[urlParts.length - 1];
      
      const query = `
        query {
          post(slug: "${productSlug}") {
            name
            tagline
            description
            createdAt
            featuredAt
            commentsCount
            votesCount
            url
          }
        }
      `;

      const response = await this.productHuntClient.post('/graphql', { query });
      const post = response.data.data.post;

      if (post) {
        const signal = await this.createSignal({
          competitorId,
          sourceId: source.id,
          signalType: 'product_launch',
          title: `Product Hunt activity: ${post.name}`,
          description: post.description || post.tagline,
          url: post.url,
          confidenceScore: 0.8,
          importanceScore: 0.6,
          tags: ['product_hunt', 'product_launch'],
          metadata: {
            votes: post.votesCount,
            comments: post.commentsCount,
            featured_at: post.featuredAt
          }
        });
        return [signal];
      }

      return [];
      
    } catch (error) {
      console.warn('    ⚠️  Product Hunt monitoring failed:', error.message);
      return [];
    }
  }

  /**
   * Monitor Crunchbase
   * @param {string} competitorId - Competitor ID
   * @param {Object} source - Monitoring source
   * @returns {Array} Detected signals
   */
  async monitorCrunchbase(competitorId, source) {
    try {
      if (!process.env.CRUNCHBASE_API_KEY) {
        console.warn('    ⚠️  Crunchbase monitoring requires API key');
        return [];
      }

      // This is a placeholder - Crunchbase API requires specific endpoints
      console.warn('    ⚠️  Crunchbase monitoring not yet implemented');
      return [];
      
    } catch (error) {
      console.warn('    ⚠️  Crunchbase monitoring failed:', error.message);
      return [];
    }
  }

  /**
   * Create and save an intelligence signal
   * @param {Object} signalData - Signal data
   * @returns {Object} Created signal
   */
  async createSignal(signalData) {
    const signal = {
      competitor_id: signalData.competitorId,
      source_id: signalData.sourceId,
      signal_type: signalData.signalType,
      title: signalData.title,
      description: signalData.description,
      url: signalData.url,
      detected_at: new Date().toISOString(),
      published_at: signalData.publishedAt || new Date().toISOString(),
      confidence_score: signalData.confidenceScore || 0.5,
      importance_score: signalData.importanceScore || 0.5,
      sentiment_score: signalData.sentimentScore || null,
      tags: signalData.tags || [],
      metadata: signalData.metadata || {},
      is_processed: false,
      is_alert_sent: false
    };

    const { data, error } = await this.supabase
      .from('intelligence_signals')
      .insert(signal)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create signal: ${error.message}`);
    }

    return data;
  }

  /**
   * Get recent high-priority signals
   * @param {number} days - Number of days to look back
   * @returns {Array} Recent signals
   */
  async getRecentHighPrioritySignals(days = 7) {
    const { data, error } = await this.supabase
      .from('recent_high_priority_signals')
      .select('*')
      .limit(20);

    if (error) {
      throw new Error(`Failed to get recent signals: ${error.message}`);
    }

    return data;
  }

  /**
   * Get monitoring analytics
   * @returns {Object} Analytics data
   */
  async getMonitoringAnalytics() {
    try {
      const { data: totalSignals } = await this.supabase
        .from('intelligence_signals')
        .select('*');

      const { data: recentSignals } = await this.supabase
        .from('intelligence_signals')
        .select('*')
        .gte('detected_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const { data: competitors } = await this.supabase
        .from('competitors')
        .select('*')
        .eq('status', 'active');

      const { data: sources } = await this.supabase
        .from('monitoring_sources')
        .select('*')
        .eq('is_active', true);

      return {
        totalSignals: totalSignals?.length || 0,
        recentSignals: recentSignals?.length || 0,
        activeCompetitors: competitors?.length || 0,
        activeSources: sources?.length || 0
      };
      
    } catch (error) {
      throw new Error(`Failed to get analytics: ${error.message}`);
    }
  }
}

module.exports = CompetitiveIntelligence;