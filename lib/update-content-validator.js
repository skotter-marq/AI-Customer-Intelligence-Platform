// lib/update-content-validator.js
/**
 * Update Content Validator
 * Comprehensive validation system for generated content quality assurance
 */

const { createClient } = require('@supabase/supabase-js');
const AIProvider = require('./ai-provider.js');
const { EventEmitter } = require('events');
require('dotenv').config({ path: '.env.local' });

class UpdateContentValidator extends EventEmitter {
  constructor() {
    super();
    
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    this.aiProvider = new AIProvider();
    
    // Validation configuration
    this.config = {
      enableAIValidation: true,
      enableGrammarCheck: true,
      enableFactCheck: true,
      enableBrandConsistency: true,
      enableAccessibilityCheck: true,
      enableSEOValidation: true,
      enableComplianceCheck: true,
      enablePerformanceCheck: true,
      strictMode: false,
      autoFixEnabled: true,
      maxValidationTime: 30000, // 30 seconds
      requiredPassingScore: 0.8,
      criticalValidationRules: [
        'grammar_check',
        'fact_accuracy',
        'brand_consistency',
        'legal_compliance'
      ]
    };
    
    // Validation rules
    this.validationRules = {
      content_structure: {
        name: 'Content Structure',
        description: 'Validates content structure and formatting',
        weight: 0.15,
        critical: false,
        checks: [
          'has_title',
          'has_content_body',
          'proper_headings',
          'consistent_formatting',
          'logical_flow'
        ]
      },
      grammar_spelling: {
        name: 'Grammar & Spelling',
        description: 'Validates grammar, spelling, and language usage',
        weight: 0.2,
        critical: true,
        checks: [
          'spell_check',
          'grammar_check',
          'punctuation_check',
          'capitalization_check',
          'sentence_structure'
        ]
      },
      fact_accuracy: {
        name: 'Fact Accuracy',
        description: 'Validates factual accuracy and consistency',
        weight: 0.25,
        critical: true,
        checks: [
          'data_accuracy',
          'date_consistency',
          'version_accuracy',
          'feature_descriptions',
          'technical_accuracy'
        ]
      },
      brand_consistency: {
        name: 'Brand Consistency',
        description: 'Ensures brand voice and messaging consistency',
        weight: 0.15,
        critical: true,
        checks: [
          'tone_consistency',
          'brand_voice',
          'messaging_alignment',
          'terminology_usage',
          'style_guide_compliance'
        ]
      },
      accessibility: {
        name: 'Accessibility',
        description: 'Validates content accessibility standards',
        weight: 0.1,
        critical: false,
        checks: [
          'readability_score',
          'alt_text_presence',
          'heading_hierarchy',
          'color_contrast',
          'plain_language'
        ]
      },
      seo_optimization: {
        name: 'SEO Optimization',
        description: 'Validates SEO best practices',
        weight: 0.1,
        critical: false,
        checks: [
          'keyword_density',
          'meta_descriptions',
          'title_optimization',
          'content_length',
          'internal_linking'
        ]
      },
      legal_compliance: {
        name: 'Legal Compliance',
        description: 'Validates legal and regulatory compliance',
        weight: 0.05,
        critical: true,
        checks: [
          'disclaimer_presence',
          'privacy_compliance',
          'accessibility_compliance',
          'copyright_compliance',
          'regulatory_compliance'
        ]
      }
    };
    
    // Brand guidelines
    this.brandGuidelines = {
      tone: {
        preferred: ['professional', 'friendly', 'innovative', 'helpful'],
        avoid: ['overly casual', 'aggressive', 'condescending', 'jargon-heavy']
      },
      terminology: {
        preferred: {
          'AI': 'artificial intelligence',
          'ML': 'machine learning',
          'API': 'application programming interface',
          'UI': 'user interface',
          'UX': 'user experience'
        },
        avoid: ['utilize', 'leverage', 'synergy', 'paradigm', 'disruptive']
      },
      style: {
        voice: 'active',
        person: 'second_person',
        tense: 'present',
        sentence_length: 'medium',
        paragraph_length: 'short'
      }
    };
    
    // Performance thresholds
    this.performanceThresholds = {
      readability_score: 60, // Flesch Reading Ease
      sentence_length: 20, // words
      paragraph_length: 150, // words
      content_length: {
        min: 100,
        max: 2000
      },
      keyword_density: {
        min: 0.5,
        max: 3.0
      }
    };
    
    // Validation cache
    this.validationCache = new Map();
    this.cacheTimeout = 300000; // 5 minutes
    
    // Statistics
    this.stats = {
      totalValidations: 0,
      passedValidations: 0,
      failedValidations: 0,
      averageScore: 0,
      averageValidationTime: 0,
      autoFixesApplied: 0,
      criticalIssuesFound: 0
    };
  }

  /**
   * Validate content comprehensively
   * @param {Object} content - Content to validate
   * @param {Object} options - Validation options
   * @returns {Object} Validation results
   */
  async validateContent(content, options = {}) {
    const startTime = Date.now();
    
    try {
      console.log(`🔍 Starting comprehensive validation for content: ${content.content_title || 'Untitled'}`);
      
      const {
        skipCache = false,
        strictMode = this.config.strictMode,
        autoFix = this.config.autoFixEnabled,
        customRules = [],
        skipRules = []
      } = options;
      
      // Check cache first
      const cacheKey = this.generateCacheKey(content, options);
      if (!skipCache && this.validationCache.has(cacheKey)) {
        const cached = this.validationCache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          console.log('📋 Using cached validation results');
          return cached.results;
        }
      }
      
      // Prepare validation context
      const validationContext = {
        content: content,
        content_type: content.content_type || 'general',
        target_audience: content.target_audience || 'general',
        generation_source: content.generation_trigger || 'manual',
        priority: content.priority || 'medium',
        strictMode: strictMode,
        autoFix: autoFix
      };
      
      // Run validation rules
      const validationResults = await this.runValidationRules(validationContext, customRules, skipRules);
      
      // Calculate overall score
      const overallScore = this.calculateOverallScore(validationResults);
      
      // Determine pass/fail status
      const passed = overallScore >= this.config.requiredPassingScore;
      const criticalIssues = this.findCriticalIssues(validationResults);
      
      // Apply auto-fixes if enabled
      let fixedContent = content;
      let appliedFixes = [];
      if (autoFix && validationResults.fixable_issues && validationResults.fixable_issues.length > 0) {
        const fixResults = await this.applyAutoFixes(content, validationResults.fixable_issues);
        fixedContent = fixResults.content;
        appliedFixes = fixResults.applied_fixes;
      }
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(validationResults, validationContext);
      
      // Create final validation result
      const finalResult = {
        validation_id: this.generateValidationId(),
        content_id: content.id,
        content_title: content.content_title,
        validation_timestamp: new Date().toISOString(),
        validation_duration: Date.now() - startTime,
        overall_score: overallScore,
        passed: passed,
        critical_issues: criticalIssues,
        rule_results: validationResults,
        applied_fixes: appliedFixes,
        fixed_content: fixedContent,
        recommendations: recommendations,
        validation_context: validationContext,
        next_steps: this.generateNextSteps(passed, criticalIssues, recommendations)
      };
      
      // Cache results
      this.validationCache.set(cacheKey, {
        results: finalResult,
        timestamp: Date.now()
      });
      
      // Update statistics
      this.updateStatistics(finalResult);
      
      // Emit events
      this.emit('validation_completed', finalResult);
      if (!passed) {
        this.emit('validation_failed', finalResult);
      }
      if (criticalIssues.length > 0) {
        this.emit('critical_issues_found', finalResult);
      }
      
      console.log(`✅ Validation completed: ${overallScore.toFixed(2)} score, ${passed ? 'PASSED' : 'FAILED'}`);
      
      return finalResult;
      
    } catch (error) {
      console.error('❌ Content validation failed:', error.message);
      this.stats.failedValidations++;
      
      return {
        validation_id: this.generateValidationId(),
        content_id: content.id,
        validation_timestamp: new Date().toISOString(),
        validation_duration: Date.now() - startTime,
        overall_score: 0,
        passed: false,
        error: error.message,
        critical_issues: [{ type: 'validation_error', message: error.message }],
        rule_results: {},
        applied_fixes: [],
        fixed_content: content,
        recommendations: ['Fix validation system error before republishing'],
        next_steps: ['Contact system administrator']
      };
    }
  }

  /**
   * Run all validation rules
   * @param {Object} context - Validation context
   * @param {Array} customRules - Custom validation rules
   * @param {Array} skipRules - Rules to skip
   * @returns {Object} Validation results
   */
  async runValidationRules(context, customRules = [], skipRules = []) {
    const results = {};
    const fixableIssues = [];
    
    // Get rules to run
    const rulesToRun = Object.keys(this.validationRules)
      .filter(ruleId => !skipRules.includes(ruleId))
      .concat(customRules);
    
    // Run each validation rule
    for (const ruleId of rulesToRun) {
      try {
        console.log(`🔍 Running validation rule: ${ruleId}`);
        
        const ruleConfig = this.validationRules[ruleId];
        if (!ruleConfig) {
          console.warn(`Unknown validation rule: ${ruleId}`);
          continue;
        }
        
        const ruleResult = await this.runValidationRule(ruleId, ruleConfig, context);
        results[ruleId] = ruleResult;
        
        // Collect fixable issues
        if (ruleResult.fixable_issues) {
          fixableIssues.push(...ruleResult.fixable_issues);
        }
        
      } catch (error) {
        console.error(`❌ Validation rule '${ruleId}' failed:`, error.message);
        results[ruleId] = {
          rule_id: ruleId,
          passed: false,
          score: 0,
          error: error.message,
          issues: [{ type: 'rule_error', message: error.message }],
          fixable_issues: []
        };
      }
    }
    
    results.fixable_issues = fixableIssues;
    return results;
  }

  /**
   * Run individual validation rule
   * @param {string} ruleId - Rule identifier
   * @param {Object} ruleConfig - Rule configuration
   * @param {Object} context - Validation context
   * @returns {Object} Rule result
   */
  async runValidationRule(ruleId, ruleConfig, context) {
    const startTime = Date.now();
    
    try {
      let ruleResult = {};
      
      switch (ruleId) {
        case 'content_structure':
          ruleResult = await this.validateContentStructure(context);
          break;
        case 'grammar_spelling':
          ruleResult = await this.validateGrammarSpelling(context);
          break;
        case 'fact_accuracy':
          ruleResult = await this.validateFactAccuracy(context);
          break;
        case 'brand_consistency':
          ruleResult = await this.validateBrandConsistency(context);
          break;
        case 'accessibility':
          ruleResult = await this.validateAccessibility(context);
          break;
        case 'seo_optimization':
          ruleResult = await this.validateSEOOptimization(context);
          break;
        case 'legal_compliance':
          ruleResult = await this.validateLegalCompliance(context);
          break;
        default:
          throw new Error(`Unknown validation rule: ${ruleId}`);
      }
      
      return {
        rule_id: ruleId,
        rule_name: ruleConfig.name,
        passed: ruleResult.score >= (context.strictMode ? 0.9 : 0.8),
        score: ruleResult.score,
        weight: ruleConfig.weight,
        critical: ruleConfig.critical,
        issues: ruleResult.issues || [],
        fixable_issues: ruleResult.fixable_issues || [],
        suggestions: ruleResult.suggestions || [],
        validation_time: Date.now() - startTime
      };
      
    } catch (error) {
      return {
        rule_id: ruleId,
        rule_name: ruleConfig.name,
        passed: false,
        score: 0,
        weight: ruleConfig.weight,
        critical: ruleConfig.critical,
        error: error.message,
        issues: [{ type: 'rule_error', message: error.message }],
        fixable_issues: [],
        suggestions: [],
        validation_time: Date.now() - startTime
      };
    }
  }

  /**
   * Validate content structure
   * @param {Object} context - Validation context
   * @returns {Object} Validation result
   */
  async validateContentStructure(context) {
    const content = context.content;
    const issues = [];
    const fixableIssues = [];
    let score = 1.0;
    
    // Check for title
    if (!content.content_title || content.content_title.trim().length === 0) {
      issues.push({ type: 'missing_title', message: 'Content is missing a title' });
      fixableIssues.push({ type: 'add_title', content: content.content_title });
      score -= 0.3;
    }
    
    // Check for content body
    if (!content.generated_content || content.generated_content.trim().length === 0) {
      issues.push({ type: 'missing_content_body', message: 'Content is missing main body text' });
      score -= 0.4;
    }
    
    // Check content length
    const contentLength = content.generated_content ? content.generated_content.length : 0;
    if (contentLength < this.performanceThresholds.content_length.min) {
      issues.push({ type: 'content_too_short', message: `Content is too short (${contentLength} chars)` });
      score -= 0.2;
    } else if (contentLength > this.performanceThresholds.content_length.max) {
      issues.push({ type: 'content_too_long', message: `Content is too long (${contentLength} chars)` });
      fixableIssues.push({ type: 'trim_content', target_length: this.performanceThresholds.content_length.max });
      score -= 0.1;
    }
    
    // Check for proper headings
    const headingPattern = /^#{1,6}\s+.+$/gm;
    const headings = content.generated_content ? content.generated_content.match(headingPattern) || [] : [];
    if (contentLength > 500 && headings.length === 0) {
      issues.push({ type: 'missing_headings', message: 'Long content should have section headings' });
      fixableIssues.push({ type: 'add_headings', suggestion: 'Add section headings to improve readability' });
      score -= 0.1;
    }
    
    return {
      score: Math.max(score, 0),
      issues: issues,
      fixable_issues: fixableIssues,
      suggestions: [
        'Use clear, descriptive titles',
        'Structure content with appropriate headings',
        'Keep content length within recommended range'
      ]
    };
  }

  /**
   * Validate grammar and spelling
   * @param {Object} context - Validation context
   * @returns {Object} Validation result
   */
  async validateGrammarSpelling(context) {
    const content = context.content.generated_content || '';
    const issues = [];
    const fixableIssues = [];
    let score = 1.0;
    
    // Basic grammar checks
    const grammarIssues = this.checkBasicGrammar(content);
    issues.push(...grammarIssues);
    if (grammarIssues.length > 0) {
      score -= Math.min(grammarIssues.length * 0.05, 0.3);
      fixableIssues.push({ type: 'fix_grammar', issues: grammarIssues });
    }
    
    // Spelling checks
    const spellingIssues = this.checkBasicSpelling(content);
    issues.push(...spellingIssues);
    if (spellingIssues.length > 0) {
      score -= Math.min(spellingIssues.length * 0.05, 0.3);
      fixableIssues.push({ type: 'fix_spelling', issues: spellingIssues });
    }
    
    // Punctuation checks
    const punctuationIssues = this.checkPunctuation(content);
    issues.push(...punctuationIssues);
    if (punctuationIssues.length > 0) {
      score -= Math.min(punctuationIssues.length * 0.03, 0.2);
      fixableIssues.push({ type: 'fix_punctuation', issues: punctuationIssues });
    }
    
    // Sentence structure
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const longSentences = sentences.filter(s => s.split(' ').length > this.performanceThresholds.sentence_length);
    if (longSentences.length > 0) {
      issues.push({ type: 'long_sentences', message: `${longSentences.length} sentences are too long` });
      fixableIssues.push({ type: 'split_sentences', sentences: longSentences });
      score -= Math.min(longSentences.length * 0.03, 0.2);
    }
    
    return {
      score: Math.max(score, 0),
      issues: issues,
      fixable_issues: fixableIssues,
      suggestions: [
        'Keep sentences concise and clear',
        'Use active voice when possible',
        'Proofread for spelling and grammar errors'
      ]
    };
  }

  /**
   * Validate fact accuracy
   * @param {Object} context - Validation context
   * @returns {Object} Validation result
   */
  async validateFactAccuracy(context) {
    const content = context.content;
    const issues = [];
    const fixableIssues = [];
    let score = 1.0;
    
    // Check for dates
    const datePattern = /\b(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}|\w+ \d{1,2}, \d{4})\b/g;
    const dates = content.generated_content ? content.generated_content.match(datePattern) || [] : [];
    for (const date of dates) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        issues.push({ type: 'invalid_date', message: `Invalid date format: ${date}` });
        fixableIssues.push({ type: 'fix_date_format', date: date });
        score -= 0.1;
      } else if (parsedDate > new Date()) {
        issues.push({ type: 'future_date', message: `Date appears to be in the future: ${date}` });
        score -= 0.1;
      }
    }
    
    // Check for version numbers
    const versionPattern = /\bv?\d+\.\d+(\.\d+)?(-\w+)?\b/g;
    const versions = content.generated_content ? content.generated_content.match(versionPattern) || [] : [];
    if (versions.length > 0 && content.update_id) {
      // In a real implementation, you would check against actual product versions
      console.log(`Found ${versions.length} version references`);
    }
    
    // Check for numerical data consistency
    const numberPattern = /\b\d{1,3}(,\d{3})*(\.\d+)?%?\b/g;
    const numbers = content.generated_content ? content.generated_content.match(numberPattern) || [] : [];
    if (numbers.length > 0) {
      // Check for unrealistic percentages
      const percentages = numbers.filter(n => n.includes('%')).map(n => parseFloat(n.replace('%', '')));
      const unrealisticPercentages = percentages.filter(p => p > 100 || p < 0);
      if (unrealisticPercentages.length > 0) {
        issues.push({ type: 'unrealistic_percentage', message: `Unrealistic percentage values found` });
        score -= 0.2;
      }
    }
    
    // Use AI for fact checking if enabled
    if (this.config.enableFactCheck && this.config.enableAIValidation) {
      try {
        const aiFactCheck = await this.performAIFactCheck(content);
        if (aiFactCheck.issues.length > 0) {
          issues.push(...aiFactCheck.issues);
          score -= Math.min(aiFactCheck.issues.length * 0.1, 0.3);
        }
      } catch (error) {
        console.warn('AI fact check failed:', error.message);
      }
    }
    
    return {
      score: Math.max(score, 0),
      issues: issues,
      fixable_issues: fixableIssues,
      suggestions: [
        'Verify all dates and version numbers',
        'Double-check numerical data and percentages',
        'Ensure technical details are accurate'
      ]
    };
  }

  /**
   * Validate brand consistency
   * @param {Object} context - Validation context
   * @returns {Object} Validation result
   */
  async validateBrandConsistency(context) {
    const content = context.content.generated_content || '';
    const issues = [];
    const fixableIssues = [];
    let score = 1.0;
    
    // Check tone consistency
    const toneIssues = this.checkToneConsistency(content);
    issues.push(...toneIssues);
    if (toneIssues.length > 0) {
      score -= Math.min(toneIssues.length * 0.05, 0.2);
      fixableIssues.push({ type: 'adjust_tone', issues: toneIssues });
    }
    
    // Check terminology usage
    const terminologyIssues = this.checkTerminologyUsage(content);
    issues.push(...terminologyIssues);
    if (terminologyIssues.length > 0) {
      score -= Math.min(terminologyIssues.length * 0.05, 0.2);
      fixableIssues.push({ type: 'fix_terminology', issues: terminologyIssues });
    }
    
    // Check for avoided words
    const avoidedWords = this.brandGuidelines.terminology.avoid;
    const foundAvoidedWords = avoidedWords.filter(word => 
      content.toLowerCase().includes(word.toLowerCase())
    );
    if (foundAvoidedWords.length > 0) {
      issues.push({ type: 'avoided_words', message: `Found avoided words: ${foundAvoidedWords.join(', ')}` });
      fixableIssues.push({ type: 'replace_avoided_words', words: foundAvoidedWords });
      score -= foundAvoidedWords.length * 0.05;
    }
    
    // Check voice consistency (active vs passive)
    const passiveVoicePattern = /\b(was|were|is|are|been|being)\s+\w+ed\b/g;
    const passiveVoiceMatches = content.match(passiveVoicePattern) || [];
    const totalSentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const passiveVoiceRatio = totalSentences > 0 ? passiveVoiceMatches.length / totalSentences : 0;
    
    if (passiveVoiceRatio > 0.3) {
      issues.push({ type: 'excessive_passive_voice', message: `High passive voice usage (${(passiveVoiceRatio * 100).toFixed(1)}%)` });
      fixableIssues.push({ type: 'convert_to_active_voice', ratio: passiveVoiceRatio });
      score -= 0.1;
    }
    
    return {
      score: Math.max(score, 0),
      issues: issues,
      fixable_issues: fixableIssues,
      suggestions: [
        'Maintain consistent brand voice and tone',
        'Use preferred terminology',
        'Prefer active voice over passive voice'
      ]
    };
  }

  /**
   * Validate accessibility
   * @param {Object} context - Validation context
   * @returns {Object} Validation result
   */
  async validateAccessibility(context) {
    const content = context.content.generated_content || '';
    const issues = [];
    const fixableIssues = [];
    let score = 1.0;
    
    // Calculate readability score
    const readabilityScore = this.calculateReadabilityScore(content);
    if (readabilityScore < this.performanceThresholds.readability_score) {
      issues.push({ type: 'low_readability', message: `Low readability score: ${readabilityScore.toFixed(1)}` });
      fixableIssues.push({ type: 'improve_readability', current_score: readabilityScore });
      score -= 0.3;
    }
    
    // Check for heading hierarchy
    const headingPattern = /^(#{1,6})\s+(.+)$/gm;
    const headings = [];
    let match;
    while ((match = headingPattern.exec(content)) !== null) {
      headings.push({ level: match[1].length, text: match[2] });
    }
    
    if (headings.length > 0) {
      // Check if headings skip levels
      for (let i = 1; i < headings.length; i++) {
        if (headings[i].level > headings[i-1].level + 1) {
          issues.push({ type: 'heading_hierarchy_skip', message: 'Heading hierarchy skips levels' });
          fixableIssues.push({ type: 'fix_heading_hierarchy', headings: headings });
          score -= 0.1;
          break;
        }
      }
    }
    
    // Check for alt text on images (if any image references)
    const imagePattern = /!\[([^\]]*)\]\([^)]+\)/g;
    const images = content.match(imagePattern) || [];
    const imagesWithoutAlt = images.filter(img => {
      const altMatch = img.match(/!\[([^\]]*)\]/);
      return !altMatch || altMatch[1].trim().length === 0;
    });
    
    if (imagesWithoutAlt.length > 0) {
      issues.push({ type: 'missing_alt_text', message: `${imagesWithoutAlt.length} images missing alt text` });
      fixableIssues.push({ type: 'add_alt_text', images: imagesWithoutAlt });
      score -= 0.2;
    }
    
    // Check for plain language
    const complexWords = this.findComplexWords(content);
    if (complexWords.length > content.split(' ').length * 0.1) {
      issues.push({ type: 'complex_language', message: `High usage of complex words (${complexWords.length})` });
      fixableIssues.push({ type: 'simplify_language', words: complexWords });
      score -= 0.1;
    }
    
    return {
      score: Math.max(score, 0),
      issues: issues,
      fixable_issues: fixableIssues,
      suggestions: [
        'Aim for a readability score above 60',
        'Use proper heading hierarchy',
        'Provide alt text for all images',
        'Use plain language where possible'
      ]
    };
  }

  /**
   * Validate SEO optimization
   * @param {Object} context - Validation context
   * @returns {Object} Validation result
   */
  async validateSEOOptimization(context) {
    const content = context.content.generated_content || '';
    const title = context.content.content_title || '';
    const issues = [];
    const fixableIssues = [];
    let score = 1.0;
    
    // Check title length
    if (title.length < 30) {
      issues.push({ type: 'title_too_short', message: `Title is too short (${title.length} chars)` });
      fixableIssues.push({ type: 'extend_title', current_length: title.length });
      score -= 0.2;
    } else if (title.length > 60) {
      issues.push({ type: 'title_too_long', message: `Title is too long (${title.length} chars)` });
      fixableIssues.push({ type: 'shorten_title', current_length: title.length });
      score -= 0.1;
    }
    
    // Check for keyword density
    const words = content.toLowerCase().split(/\s+/);
    const wordCount = words.length;
    const wordFreq = {};
    
    words.forEach(word => {
      if (word.length > 3) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });
    
    const keywordDensities = Object.entries(wordFreq)
      .map(([word, count]) => ({
        word: word,
        density: (count / wordCount) * 100
      }))
      .filter(item => item.density > 0.5);
    
    const overOptimized = keywordDensities.filter(item => 
      item.density > this.performanceThresholds.keyword_density.max
    );
    
    if (overOptimized.length > 0) {
      issues.push({ type: 'keyword_stuffing', message: `Potential keyword stuffing detected` });
      fixableIssues.push({ type: 'reduce_keyword_density', keywords: overOptimized });
      score -= 0.2;
    }
    
    // Check for internal links (if applicable)
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links = content.match(linkPattern) || [];
    const internalLinks = links.filter(link => !link.includes('http'));
    
    if (content.length > 500 && internalLinks.length === 0) {
      issues.push({ type: 'no_internal_links', message: 'Consider adding internal links' });
      score -= 0.1;
    }
    
    return {
      score: Math.max(score, 0),
      issues: issues,
      fixable_issues: fixableIssues,
      suggestions: [
        'Keep title length between 30-60 characters',
        'Maintain keyword density between 0.5-3%',
        'Add relevant internal links',
        'Use descriptive link text'
      ]
    };
  }

  /**
   * Validate legal compliance
   * @param {Object} context - Validation context
   * @returns {Object} Validation result
   */
  async validateLegalCompliance(context) {
    const content = context.content.generated_content || '';
    const issues = [];
    const fixableIssues = [];
    let score = 1.0;
    
    // Check for required disclaimers
    const hasDisclaimer = content.toLowerCase().includes('disclaimer') || 
                         content.toLowerCase().includes('terms of service') ||
                         content.toLowerCase().includes('privacy policy');
    
    if (content.length > 1000 && !hasDisclaimer) {
      issues.push({ type: 'missing_disclaimer', message: 'Long content should include appropriate disclaimers' });
      fixableIssues.push({ type: 'add_disclaimer', content_type: context.content_type });
      score -= 0.2;
    }
    
    // Check for copyright compliance
    const copyrightPattern = /copyright|©|\(c\)/gi;
    const hasCopyright = content.match(copyrightPattern);
    
    if (content.includes('©') || content.includes('copyright')) {
      // Check if copyright notice is properly formatted
      const copyrightNoticePattern = /©\s*\d{4}|copyright\s*\d{4}/gi;
      if (!content.match(copyrightNoticePattern)) {
        issues.push({ type: 'invalid_copyright', message: 'Copyright notice should include year' });
        fixableIssues.push({ type: 'fix_copyright_notice' });
        score -= 0.1;
      }
    }
    
    // Check for privacy-related content
    const privacyKeywords = ['personal data', 'privacy', 'gdpr', 'data protection', 'cookies'];
    const hasPrivacyContent = privacyKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );
    
    if (hasPrivacyContent) {
      const hasPrivacyDisclaimer = content.toLowerCase().includes('privacy policy') ||
                                  content.toLowerCase().includes('data protection');
      if (!hasPrivacyDisclaimer) {
        issues.push({ type: 'missing_privacy_disclaimer', message: 'Privacy-related content should include privacy policy reference' });
        fixableIssues.push({ type: 'add_privacy_disclaimer' });
        score -= 0.3;
      }
    }
    
    // Check for accessibility compliance
    const accessibilityKeywords = ['accessibility', 'wcag', 'ada compliance'];
    const hasAccessibilityContent = accessibilityKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );
    
    if (hasAccessibilityContent) {
      console.log('Content includes accessibility references');
    }
    
    return {
      score: Math.max(score, 0),
      issues: issues,
      fixable_issues: fixableIssues,
      suggestions: [
        'Include appropriate disclaimers for long content',
        'Ensure copyright notices are properly formatted',
        'Reference privacy policy for data-related content',
        'Follow accessibility guidelines'
      ]
    };
  }

  /**
   * Check basic grammar issues
   * @param {string} content - Content to check
   * @returns {Array} Grammar issues
   */
  checkBasicGrammar(content) {
    const issues = [];
    
    // Check for double spaces
    if (content.includes('  ')) {
      issues.push({ type: 'double_spaces', message: 'Found double spaces' });
    }
    
    // Check for missing spaces after punctuation
    const punctuationPattern = /[.!?][a-zA-Z]/g;
    if (content.match(punctuationPattern)) {
      issues.push({ type: 'missing_space_after_punctuation', message: 'Missing space after punctuation' });
    }
    
    // Check for repeated words
    const repeatedWordsPattern = /\b(\w+)\s+\1\b/gi;
    const repeatedWords = content.match(repeatedWordsPattern);
    if (repeatedWords && repeatedWords.length > 0) {
      issues.push({ type: 'repeated_words', message: `Found repeated words: ${repeatedWords.join(', ')}` });
    }
    
    return issues;
  }

  /**
   * Check basic spelling issues
   * @param {string} content - Content to check
   * @returns {Array} Spelling issues
   */
  checkBasicSpelling(content) {
    const issues = [];
    
    // Common misspellings
    const commonMisspellings = {
      'recieve': 'receive',
      'seperate': 'separate',
      'definately': 'definitely',
      'occured': 'occurred',
      'neccessary': 'necessary',
      'begining': 'beginning',
      'sucessful': 'successful',
      'managment': 'management',
      'beleive': 'believe',
      'acheive': 'achieve'
    };
    
    Object.entries(commonMisspellings).forEach(([wrong, correct]) => {
      if (content.toLowerCase().includes(wrong)) {
        issues.push({ 
          type: 'misspelling', 
          message: `Possible misspelling: "${wrong}" should be "${correct}"`,
          wrong: wrong,
          correct: correct
        });
      }
    });
    
    return issues;
  }

  /**
   * Check punctuation issues
   * @param {string} content - Content to check
   * @returns {Array} Punctuation issues
   */
  checkPunctuation(content) {
    const issues = [];
    
    // Check for missing periods at end of sentences
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length > 0) {
      const lastSentence = sentences[sentences.length - 1];
      if (lastSentence.trim().length > 0 && !content.trim().match(/[.!?]$/)) {
        issues.push({ type: 'missing_end_punctuation', message: 'Missing punctuation at end of content' });
      }
    }
    
    // Check for excessive exclamation marks
    const exclamationCount = (content.match(/!/g) || []).length;
    if (exclamationCount > 3) {
      issues.push({ type: 'excessive_exclamation', message: `Too many exclamation marks (${exclamationCount})` });
    }
    
    return issues;
  }

  /**
   * Check tone consistency
   * @param {string} content - Content to check
   * @returns {Array} Tone issues
   */
  checkToneConsistency(content) {
    const issues = [];
    
    // Check for casual language in professional content
    const casualWords = ['gonna', 'wanna', 'yeah', 'ok', 'awesome', 'super', 'really'];
    const foundCasualWords = casualWords.filter(word => 
      content.toLowerCase().includes(word.toLowerCase())
    );
    
    if (foundCasualWords.length > 0) {
      issues.push({ 
        type: 'casual_language', 
        message: `Found casual language: ${foundCasualWords.join(', ')}`,
        words: foundCasualWords
      });
    }
    
    // Check for inconsistent person (mixing you/we/they)
    const personIndicators = {
      first: ['we', 'us', 'our'],
      second: ['you', 'your'],
      third: ['they', 'their', 'them']
    };
    
    const foundPersons = [];
    Object.entries(personIndicators).forEach(([person, indicators]) => {
      if (indicators.some(indicator => content.toLowerCase().includes(indicator))) {
        foundPersons.push(person);
      }
    });
    
    if (foundPersons.length > 1) {
      issues.push({ 
        type: 'inconsistent_person', 
        message: `Mixed person usage: ${foundPersons.join(', ')}`,
        persons: foundPersons
      });
    }
    
    return issues;
  }

  /**
   * Check terminology usage
   * @param {string} content - Content to check
   * @returns {Array} Terminology issues
   */
  checkTerminologyUsage(content) {
    const issues = [];
    
    // Check for preferred terminology
    Object.entries(this.brandGuidelines.terminology.preferred).forEach(([abbrev, full]) => {
      if (content.includes(abbrev) && !content.includes(full)) {
        issues.push({ 
          type: 'missing_full_term', 
          message: `Use full term "${full}" for "${abbrev}"`,
          abbreviation: abbrev,
          full_term: full
        });
      }
    });
    
    return issues;
  }

  /**
   * Calculate readability score (simplified Flesch Reading Ease)
   * @param {string} content - Content to analyze
   * @returns {number} Readability score
   */
  calculateReadabilityScore(content) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const syllables = words.reduce((count, word) => count + this.countSyllables(word), 0);
    
    if (sentences.length === 0 || words.length === 0) {
      return 0;
    }
    
    const avgSentenceLength = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;
    
    // Simplified Flesch Reading Ease formula
    const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Count syllables in a word
   * @param {string} word - Word to count syllables for
   * @returns {number} Number of syllables
   */
  countSyllables(word) {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    const vowels = 'aeiouy';
    let syllableCount = 0;
    let previousWasVowel = false;
    
    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i]);
      if (isVowel && !previousWasVowel) {
        syllableCount++;
      }
      previousWasVowel = isVowel;
    }
    
    // Adjust for silent e
    if (word.endsWith('e') && syllableCount > 1) {
      syllableCount--;
    }
    
    return Math.max(1, syllableCount);
  }

  /**
   * Find complex words
   * @param {string} content - Content to analyze
   * @returns {Array} Complex words
   */
  findComplexWords(content) {
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const complexWords = [];
    
    words.forEach(word => {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (cleanWord.length > 3 && this.countSyllables(cleanWord) > 2) {
        complexWords.push(cleanWord);
      }
    });
    
    return [...new Set(complexWords)];
  }

  /**
   * Perform AI fact checking
   * @param {Object} content - Content to check
   * @returns {Object} Fact check results
   */
  async performAIFactCheck(content) {
    try {
      const prompt = `
Please fact-check the following content for accuracy:

CONTENT:
${content.generated_content}

CONTEXT:
- Content Type: ${content.content_type}
- Target Audience: ${content.target_audience}
- Generated From: ${content.generation_trigger}

Please identify any potential factual inaccuracies, outdated information, or claims that need verification. Focus on:
1. Technical accuracy
2. Date/version consistency
3. Numerical data accuracy
4. Feature descriptions
5. Any claims that seem unrealistic

Return a JSON response with:
- issues: array of potential issues
- confidence: confidence level (0-1)
- recommendations: suggested fixes
`;

      const aiResponse = await this.aiProvider.generateText(prompt, {
        max_tokens: 500,
        temperature: 0.1
      });

      // Parse AI response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          issues: parsed.issues || [],
          confidence: parsed.confidence || 0.8,
          recommendations: parsed.recommendations || []
        };
      }

      return { issues: [], confidence: 0.8, recommendations: [] };

    } catch (error) {
      console.warn('AI fact check failed:', error.message);
      return { issues: [], confidence: 0.5, recommendations: [] };
    }
  }

  /**
   * Calculate overall validation score
   * @param {Object} results - Validation results
   * @returns {number} Overall score
   */
  calculateOverallScore(results) {
    let totalScore = 0;
    let totalWeight = 0;
    
    Object.entries(results).forEach(([ruleId, result]) => {
      if (result.score !== undefined && result.weight !== undefined) {
        totalScore += result.score * result.weight;
        totalWeight += result.weight;
      }
    });
    
    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Find critical issues
   * @param {Object} results - Validation results
   * @returns {Array} Critical issues
   */
  findCriticalIssues(results) {
    const criticalIssues = [];
    
    Object.entries(results).forEach(([ruleId, result]) => {
      if (result.critical && (!result.passed || result.score < 0.5)) {
        criticalIssues.push({
          rule: ruleId,
          rule_name: result.rule_name,
          score: result.score,
          issues: result.issues
        });
      }
    });
    
    return criticalIssues;
  }

  /**
   * Apply auto-fixes to content
   * @param {Object} content - Content to fix
   * @param {Array} fixableIssues - Issues that can be fixed
   * @returns {Object} Fixed content and applied fixes
   */
  async applyAutoFixes(content, fixableIssues) {
    const appliedFixes = [];
    let fixedContent = { ...content };
    
    for (const issue of fixableIssues) {
      try {
        const fixResult = await this.applyAutoFix(fixedContent, issue);
        if (fixResult.success) {
          fixedContent = fixResult.content;
          appliedFixes.push({
            type: issue.type,
            description: fixResult.description,
            applied_at: new Date().toISOString()
          });
        }
      } catch (error) {
        console.warn(`Failed to apply auto-fix for ${issue.type}:`, error.message);
      }
    }
    
    return {
      content: fixedContent,
      applied_fixes: appliedFixes
    };
  }

  /**
   * Apply individual auto-fix
   * @param {Object} content - Content to fix
   * @param {Object} issue - Issue to fix
   * @returns {Object} Fix result
   */
  async applyAutoFix(content, issue) {
    switch (issue.type) {
      case 'add_title':
        if (!content.content_title || content.content_title.trim().length === 0) {
          content.content_title = 'Generated Content';
          return { success: true, content: content, description: 'Added default title' };
        }
        break;
        
      case 'trim_content':
        if (content.generated_content && content.generated_content.length > issue.target_length) {
          content.generated_content = content.generated_content.substring(0, issue.target_length - 3) + '...';
          return { success: true, content: content, description: 'Trimmed content to target length' };
        }
        break;
        
      case 'fix_double_spaces':
        if (content.generated_content) {
          content.generated_content = content.generated_content.replace(/\s{2,}/g, ' ');
          return { success: true, content: content, description: 'Fixed double spaces' };
        }
        break;
        
      case 'replace_avoided_words':
        if (content.generated_content && issue.words) {
          let fixedText = content.generated_content;
          issue.words.forEach(word => {
            const replacement = this.getWordReplacement(word);
            if (replacement) {
              fixedText = fixedText.replace(new RegExp(word, 'gi'), replacement);
            }
          });
          content.generated_content = fixedText;
          return { success: true, content: content, description: 'Replaced avoided words' };
        }
        break;
        
      default:
        return { success: false, content: content, description: 'Unknown fix type' };
    }
    
    return { success: false, content: content, description: 'Fix not applicable' };
  }

  /**
   * Get replacement for avoided word
   * @param {string} word - Word to replace
   * @returns {string} Replacement word
   */
  getWordReplacement(word) {
    const replacements = {
      'utilize': 'use',
      'leverage': 'use',
      'synergy': 'collaboration',
      'paradigm': 'model',
      'disruptive': 'innovative'
    };
    
    return replacements[word.toLowerCase()] || null;
  }

  /**
   * Generate recommendations
   * @param {Object} results - Validation results
   * @param {Object} context - Validation context
   * @returns {Array} Recommendations
   */
  generateRecommendations(results, context) {
    const recommendations = [];
    
    Object.entries(results).forEach(([ruleId, result]) => {
      if (result.suggestions && result.suggestions.length > 0) {
        recommendations.push(...result.suggestions);
      }
      
      if (result.score < 0.8) {
        recommendations.push(`Improve ${result.rule_name} score (currently ${(result.score * 100).toFixed(1)}%)`);
      }
    });
    
    // Remove duplicates
    return [...new Set(recommendations)];
  }

  /**
   * Generate next steps
   * @param {boolean} passed - Whether validation passed
   * @param {Array} criticalIssues - Critical issues found
   * @param {Array} recommendations - Recommendations
   * @returns {Array} Next steps
   */
  generateNextSteps(passed, criticalIssues, recommendations) {
    const nextSteps = [];
    
    if (passed) {
      nextSteps.push('Content is ready for publication');
      if (recommendations.length > 0) {
        nextSteps.push('Consider implementing recommendations for further improvement');
      }
    } else {
      nextSteps.push('Content requires revision before publication');
      
      if (criticalIssues.length > 0) {
        nextSteps.push('Address critical issues first');
        nextSteps.push('Re-run validation after fixes');
      }
      
      if (recommendations.length > 0) {
        nextSteps.push('Review and implement recommendations');
      }
    }
    
    return nextSteps;
  }

  /**
   * Update statistics
   * @param {Object} result - Validation result
   */
  updateStatistics(result) {
    this.stats.totalValidations++;
    
    if (result.passed) {
      this.stats.passedValidations++;
    } else {
      this.stats.failedValidations++;
    }
    
    this.stats.averageScore = (this.stats.averageScore * (this.stats.totalValidations - 1) + result.overall_score) / this.stats.totalValidations;
    this.stats.averageValidationTime = (this.stats.averageValidationTime * (this.stats.totalValidations - 1) + result.validation_duration) / this.stats.totalValidations;
    this.stats.autoFixesApplied += result.applied_fixes.length;
    this.stats.criticalIssuesFound += result.critical_issues.length;
  }

  /**
   * Generate cache key
   * @param {Object} content - Content object
   * @param {Object} options - Validation options
   * @returns {string} Cache key
   */
  generateCacheKey(content, options) {
    const contentHash = this.hashContent(content);
    const optionsHash = this.hashOptions(options);
    return `${contentHash}_${optionsHash}`;
  }

  /**
   * Generate validation ID
   * @returns {string} Validation ID
   */
  generateValidationId() {
    return `val_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Hash content for caching
   * @param {Object} content - Content to hash
   * @returns {string} Content hash
   */
  hashContent(content) {
    const contentString = JSON.stringify({
      id: content.id,
      content_title: content.content_title,
      generated_content: content.generated_content,
      content_type: content.content_type
    });
    
    return contentString.length.toString(36) + contentString.slice(-10);
  }

  /**
   * Hash options for caching
   * @param {Object} options - Options to hash
   * @returns {string} Options hash
   */
  hashOptions(options) {
    const optionsString = JSON.stringify(options);
    return optionsString.length.toString(36);
  }

  /**
   * Get validation statistics
   * @returns {Object} Statistics
   */
  getStatistics() {
    return {
      ...this.stats,
      cache_size: this.validationCache.size,
      success_rate: this.stats.totalValidations > 0 ? 
        (this.stats.passedValidations / this.stats.totalValidations) * 100 : 0
    };
  }

  /**
   * Get validation configuration
   * @returns {Object} Configuration
   */
  getConfiguration() {
    return this.config;
  }

  /**
   * Update validation configuration
   * @param {Object} updates - Configuration updates
   */
  updateConfiguration(updates) {
    Object.assign(this.config, updates);
    this.emit('configuration_updated', this.config);
  }

  /**
   * Clear validation cache
   */
  clearCache() {
    this.validationCache.clear();
    console.log('🗑️ Validation cache cleared');
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStatistics() {
    return {
      cache_size: this.validationCache.size,
      cache_timeout: this.cacheTimeout,
      cache_hit_rate: this.stats.totalValidations > 0 ? 
        ((this.stats.totalValidations - this.stats.failedValidations) / this.stats.totalValidations) * 100 : 0
    };
  }
}

module.exports = UpdateContentValidator;