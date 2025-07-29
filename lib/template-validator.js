// lib/template-validator.js
/**
 * Template Validation System
 * Comprehensive validation for content templates including syntax, variables, and best practices
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

class TemplateValidator {
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Validation rules configuration
    this.rules = {
      syntax: {
        maxTemplateLength: 50000,
        minTemplateLength: 50,
        maxVariableLength: 100,
        requiredSections: ['title', 'content'],
        allowedFormats: ['markdown', 'html', 'plain_text', 'json']
      },
      variables: {
        maxVariableCount: 50,
        reservedNames: ['id', 'created_at', 'updated_at', 'deleted_at'],
        requiredVariableTypes: ['string', 'number', 'boolean', 'array', 'object']
      },
      content: {
        maxHeadingLevels: 6,
        maxListDepth: 5,
        minReadabilityScore: 0.6,
        maxDuplicateContent: 0.3
      },
      security: {
        forbiddenPatterns: [
          /javascript:/gi,
          /<script[^>]*>/gi,
          /on\w+\s*=/gi,
          /eval\s*\(/gi,
          /document\.\w+/gi
        ],
        dangerousVariables: ['script', 'eval', 'function', 'onclick', 'onload']
      }
    };
    
    // Performance thresholds
    this.performance = {
      maxProcessingTime: 5000, // 5 seconds
      maxMemoryUsage: 50 * 1024 * 1024, // 50MB
      maxVariableSubstitutions: 1000
    };
  }

  /**
   * Validate template comprehensively
   * @param {Object} template - Template object to validate
   * @param {Object} options - Validation options
   * @returns {Object} Validation result
   */
  async validateTemplate(template, options = {}) {
    const startTime = Date.now();
    
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      performance: {
        validation_time: 0,
        memory_usage: 0,
        complexity_score: 0
      },
      scores: {
        syntax_score: 0,
        content_score: 0,
        security_score: 0,
        performance_score: 0,
        overall_score: 0
      },
      metadata: {
        variable_count: 0,
        conditional_count: 0,
        loop_count: 0,
        estimated_processing_time: 0
      }
    };

    try {
      // 1. Basic structure validation
      const structureValidation = this.validateStructure(template);
      this.mergeValidationResults(validation, structureValidation);

      // 2. Syntax validation
      const syntaxValidation = this.validateSyntax(template);
      this.mergeValidationResults(validation, syntaxValidation);
      validation.scores.syntax_score = syntaxValidation.score;

      // 3. Variable validation
      const variableValidation = this.validateVariables(template);
      this.mergeValidationResults(validation, variableValidation);
      validation.metadata.variable_count = variableValidation.variable_count;

      // 4. Content validation
      const contentValidation = this.validateContent(template);
      this.mergeValidationResults(validation, contentValidation);
      validation.scores.content_score = contentValidation.score;

      // 5. Security validation
      const securityValidation = this.validateSecurity(template);
      this.mergeValidationResults(validation, securityValidation);
      validation.scores.security_score = securityValidation.score;

      // 6. Performance validation
      const performanceValidation = this.validatePerformance(template);
      this.mergeValidationResults(validation, performanceValidation);
      validation.scores.performance_score = performanceValidation.score;

      // 7. Advanced template features
      const advancedValidation = this.validateAdvancedFeatures(template);
      this.mergeValidationResults(validation, advancedValidation);
      validation.metadata.conditional_count = advancedValidation.conditional_count;
      validation.metadata.loop_count = advancedValidation.loop_count;

      // 8. Business logic validation
      const businessValidation = await this.validateBusinessLogic(template);
      this.mergeValidationResults(validation, businessValidation);

      // 9. Accessibility validation
      const accessibilityValidation = this.validateAccessibility(template);
      this.mergeValidationResults(validation, accessibilityValidation);

      // 10. Calculate overall scores
      this.calculateOverallScores(validation);

      // 11. Generate suggestions
      this.generateSuggestions(validation, template);

      // Set final validation status
      validation.isValid = validation.errors.length === 0;

      // Performance metrics
      validation.performance.validation_time = Date.now() - startTime;
      validation.performance.memory_usage = process.memoryUsage().heapUsed;
      validation.performance.complexity_score = this.calculateComplexityScore(template);

      return validation;

    } catch (error) {
      validation.isValid = false;
      validation.errors.push(`Validation error: ${error.message}`);
      validation.performance.validation_time = Date.now() - startTime;
      return validation;
    }
  }

  /**
   * Validate template structure
   * @param {Object} template - Template object
   * @returns {Object} Validation result
   */
  validateStructure(template) {
    const validation = { errors: [], warnings: [], suggestions: [] };

    // Check required fields
    const requiredFields = ['template_name', 'template_type', 'template_content'];
    requiredFields.forEach(field => {
      if (!template[field]) {
        validation.errors.push(`Missing required field: ${field}`);
      }
    });

    // Check template name format
    if (template.template_name && template.template_name.length > 100) {
      validation.errors.push('Template name too long (max 100 characters)');
    }

    // Check template type
    if (template.template_type && !/^[a-z_]+$/.test(template.template_type)) {
      validation.errors.push('Template type must be lowercase letters and underscores only');
    }

    // Check content format
    if (template.content_format && !this.rules.syntax.allowedFormats.includes(template.content_format)) {
      validation.errors.push(`Unsupported content format: ${template.content_format}`);
    }

    return validation;
  }

  /**
   * Validate template syntax
   * @param {Object} template - Template object
   * @returns {Object} Validation result with score
   */
  validateSyntax(template) {
    const validation = { errors: [], warnings: [], suggestions: [], score: 0 };
    const content = template.template_content || '';

    let score = 1.0;

    // Check content length
    if (content.length < this.rules.syntax.minTemplateLength) {
      validation.errors.push(`Template too short (min ${this.rules.syntax.minTemplateLength} characters)`);
      score -= 0.2;
    }

    if (content.length > this.rules.syntax.maxTemplateLength) {
      validation.errors.push(`Template too long (max ${this.rules.syntax.maxTemplateLength} characters)`);
      score -= 0.3;
    }

    // Check variable syntax
    const variableMatches = content.match(/\{\{[^}]+\}\}/g) || [];
    variableMatches.forEach(match => {
      const variableName = match.replace(/\{\{|\}\}/g, '').trim();
      
      if (variableName.length > this.rules.syntax.maxVariableLength) {
        validation.errors.push(`Variable name too long: ${variableName}`);
        score -= 0.1;
      }
      
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(variableName.split('.')[0])) {
        validation.errors.push(`Invalid variable name: ${variableName}`);
        score -= 0.1;
      }
    });

    // Check handlebars syntax
    const ifMatches = (content.match(/\{\{#if/g) || []).length;
    const endIfMatches = (content.match(/\{\{\/if\}\}/g) || []).length;
    if (ifMatches !== endIfMatches) {
      validation.errors.push('Unmatched {{#if}} and {{/if}} blocks');
      score -= 0.2;
    }

    const eachMatches = (content.match(/\{\{#each/g) || []).length;
    const endEachMatches = (content.match(/\{\{\/each\}\}/g) || []).length;
    if (eachMatches !== endEachMatches) {
      validation.errors.push('Unmatched {{#each}} and {{/each}} blocks');
      score -= 0.2;
    }

    // Check for malformed handlebars
    const malformedMatches = content.match(/\{\{[^}]*\{|\}[^}]*\}\}/g);
    if (malformedMatches && malformedMatches.length > 0) {
      validation.errors.push('Malformed handlebars syntax detected');
      score -= 0.2;
    }

    // Warnings for best practices
    if (variableMatches.length === 0) {
      validation.warnings.push('Template has no variables - consider adding dynamic content');
    }

    if (content.includes('{{{{')) {
      validation.warnings.push('Escaped handlebars detected - ensure this is intentional');
    }

    validation.score = Math.max(0, Math.min(1, score));
    return validation;
  }

  /**
   * Validate template variables
   * @param {Object} template - Template object
   * @returns {Object} Validation result with variable count
   */
  validateVariables(template) {
    const validation = { errors: [], warnings: [], suggestions: [], variable_count: 0 };
    const content = template.template_content || '';
    const definedVariables = template.template_variables || {};

    // Extract all variables from content
    const usedVariables = new Set();
    const variableMatches = content.match(/\{\{(?!#|\/)([\w.]+)\}\}/g) || [];
    
    variableMatches.forEach(match => {
      const variableName = match.replace(/\{\{|\}\}/g, '').trim().split('.')[0];
      usedVariables.add(variableName);
    });

    validation.variable_count = usedVariables.size;

    // Check variable count limit
    if (usedVariables.size > this.rules.variables.maxVariableCount) {
      validation.errors.push(`Too many variables (max ${this.rules.variables.maxVariableCount})`);
    }

    // Check for reserved variable names
    usedVariables.forEach(variable => {
      if (this.rules.variables.reservedNames.includes(variable)) {
        validation.errors.push(`Reserved variable name: ${variable}`);
      }
    });

    // Check for dangerous variable names
    usedVariables.forEach(variable => {
      if (this.rules.variables.dangerousVariables.includes(variable.toLowerCase())) {
        validation.warnings.push(`Potentially dangerous variable name: ${variable}`);
      }
    });

    // Check for undefined variables
    usedVariables.forEach(variable => {
      if (!definedVariables[variable]) {
        validation.warnings.push(`Variable used but not defined: ${variable}`);
      }
    });

    // Check for defined but unused variables
    Object.keys(definedVariables).forEach(variable => {
      if (!usedVariables.has(variable)) {
        validation.warnings.push(`Variable defined but not used: ${variable}`);
      }
    });

    // Check variable types
    Object.entries(definedVariables).forEach(([name, type]) => {
      if (!this.rules.variables.requiredVariableTypes.includes(type)) {
        validation.errors.push(`Invalid variable type for ${name}: ${type}`);
      }
    });

    return validation;
  }

  /**
   * Validate template content quality
   * @param {Object} template - Template object
   * @returns {Object} Validation result with content score
   */
  validateContent(template) {
    const validation = { errors: [], warnings: [], suggestions: [], score: 0 };
    const content = template.template_content || '';

    let score = 1.0;

    // Check heading structure
    const headings = content.match(/^#{1,6}\s+.+$/gm) || [];
    if (headings.length > 0) {
      const maxHeadingLevel = Math.max(...headings.map(h => h.match(/^#+/)[0].length));
      
      if (maxHeadingLevel > this.rules.content.maxHeadingLevels) {
        validation.warnings.push(`Deep heading nesting (level ${maxHeadingLevel})`);
        score -= 0.1;
      }
    }

    // Check list structure
    const lists = content.match(/^[\s]*[-*+]\s+/gm) || [];
    if (lists.length > 0) {
      const maxListDepth = Math.max(...lists.map(l => Math.floor(l.match(/^\s*/)[0].length / 2)));
      
      if (maxListDepth > this.rules.content.maxListDepth) {
        validation.warnings.push(`Deep list nesting (depth ${maxListDepth})`);
        score -= 0.1;
      }
    }

    // Check for duplicate content
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const uniqueSentences = new Set(sentences.map(s => s.trim().toLowerCase()));
    const duplicateRatio = 1 - (uniqueSentences.size / sentences.length);
    
    if (duplicateRatio > this.rules.content.maxDuplicateContent) {
      validation.warnings.push(`High duplicate content ratio: ${(duplicateRatio * 100).toFixed(1)}%`);
      score -= 0.2;
    }

    // Check readability (simplified)
    const words = content.split(/\s+/).filter(w => w.length > 0);
    if (words.length > 0 && sentences.length > 0) {
      const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
      const avgSentenceLength = words.length / sentences.length;
      
      const readabilityScore = Math.max(0, 1 - (avgWordLength / 10) - (avgSentenceLength / 30));
      
      if (readabilityScore < this.rules.content.minReadabilityScore) {
        validation.warnings.push(`Low readability score: ${readabilityScore.toFixed(2)}`);
        score -= 0.1;
      }
    }

    // Content structure suggestions
    if (!content.includes('#')) {
      validation.suggestions.push('Consider adding headings to improve structure');
    }

    if (!content.includes('-') && !content.includes('*') && !content.includes('+')) {
      validation.suggestions.push('Consider using bullet points to improve readability');
    }

    if (content.length > 2000 && !content.includes('\n\n')) {
      validation.suggestions.push('Consider adding paragraph breaks for better readability');
    }

    validation.score = Math.max(0, Math.min(1, score));
    return validation;
  }

  /**
   * Validate template security
   * @param {Object} template - Template object
   * @returns {Object} Validation result with security score
   */
  validateSecurity(template) {
    const validation = { errors: [], warnings: [], suggestions: [], score: 1.0 };
    const content = template.template_content || '';

    let score = 1.0;

    // Check for forbidden patterns
    this.rules.security.forbiddenPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        validation.errors.push(`Forbidden pattern detected: ${pattern.source}`);
        score -= 0.3;
      }
    });

    // Check for potential XSS vulnerabilities
    const xssPatterns = [
      /javascript:/gi,
      /vbscript:/gi,
      /onload\s*=/gi,
      /onerror\s*=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi
    ];

    xssPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        validation.errors.push(`Potential XSS vulnerability: ${pattern.source}`);
        score -= 0.4;
      }
    });

    // Check for data leakage risks
    const dataLeakagePatterns = [
      /password/gi,
      /secret/gi,
      /token/gi,
      /api[_-]?key/gi
    ];

    dataLeakagePatterns.forEach(pattern => {
      if (pattern.test(content)) {
        validation.warnings.push(`Potential data leakage risk: ${pattern.source}`);
        score -= 0.1;
      }
    });

    // Check for SQL injection patterns
    const sqlPatterns = [
      /union\s+select/gi,
      /drop\s+table/gi,
      /insert\s+into/gi,
      /delete\s+from/gi
    ];

    sqlPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        validation.warnings.push(`SQL injection pattern detected: ${pattern.source}`);
        score -= 0.2;
      }
    });

    validation.score = Math.max(0, Math.min(1, score));
    return validation;
  }

  /**
   * Validate template performance
   * @param {Object} template - Template object
   * @returns {Object} Validation result with performance score
   */
  validatePerformance(template) {
    const validation = { errors: [], warnings: [], suggestions: [], score: 1.0 };
    const content = template.template_content || '';

    let score = 1.0;

    // Estimate processing complexity
    const variableCount = (content.match(/\{\{[^}]+\}\}/g) || []).length;
    const conditionalCount = (content.match(/\{\{#if/g) || []).length;
    const loopCount = (content.match(/\{\{#each/g) || []).length;
    
    const complexityScore = variableCount + (conditionalCount * 2) + (loopCount * 3);
    
    if (complexityScore > 100) {
      validation.warnings.push(`High template complexity: ${complexityScore}`);
      score -= 0.2;
    }

    // Check for potential performance issues
    if (variableCount > this.performance.maxVariableSubstitutions) {
      validation.errors.push(`Too many variable substitutions: ${variableCount}`);
      score -= 0.3;
    }

    // Check for nested loops (performance killer)
    const nestedLoops = content.match(/\{\{#each[^}]+\}\}[\s\S]*?\{\{#each/g);
    if (nestedLoops && nestedLoops.length > 0) {
      validation.warnings.push('Nested loops detected - may impact performance');
      score -= 0.2;
    }

    // Check for large static content
    if (content.length > 10000) {
      validation.suggestions.push('Consider breaking large templates into smaller components');
    }

    validation.score = Math.max(0, Math.min(1, score));
    return validation;
  }

  /**
   * Validate advanced template features
   * @param {Object} template - Template object
   * @returns {Object} Validation result with feature counts
   */
  validateAdvancedFeatures(template) {
    const validation = { errors: [], warnings: [], suggestions: [], conditional_count: 0, loop_count: 0 };
    const content = template.template_content || '';

    // Count conditionals
    const conditionals = content.match(/\{\{#if\s+\w+\}\}/g) || [];
    validation.conditional_count = conditionals.length;

    // Count loops
    const loops = content.match(/\{\{#each\s+\w+\}\}/g) || [];
    validation.loop_count = loops.length;

    // Check for complex conditionals
    const complexConditionals = content.match(/\{\{#if\s+\w+\s*[<>=!]+/g);
    if (complexConditionals) {
      validation.warnings.push('Complex conditional expressions detected');
    }

    // Check for helper functions
    const helpers = content.match(/\{\{[a-zA-Z_][a-zA-Z0-9_]*\s+/g) || [];
    if (helpers.length > 0) {
      validation.suggestions.push('Custom helper functions detected - ensure they are properly registered');
    }

    return validation;
  }

  /**
   * Validate business logic
   * @param {Object} template - Template object
   * @returns {Object} Validation result
   */
  async validateBusinessLogic(template) {
    const validation = { errors: [], warnings: [], suggestions: [] };

    // Check template type consistency
    if (template.template_type) {
      const expectedVariables = this.getExpectedVariablesForType(template.template_type);
      const definedVariables = Object.keys(template.template_variables || {});
      
      expectedVariables.forEach(variable => {
        if (!definedVariables.includes(variable)) {
          validation.warnings.push(`Expected variable missing for ${template.template_type}: ${variable}`);
        }
      });
    }

    // Check target audience appropriateness
    if (template.target_audience && template.template_content) {
      const audienceChecks = this.validateAudienceAppropriate(template.template_content, template.target_audience);
      validation.warnings.push(...audienceChecks.warnings);
      validation.suggestions.push(...audienceChecks.suggestions);
    }

    return validation;
  }

  /**
   * Validate accessibility
   * @param {Object} template - Template object
   * @returns {Object} Validation result
   */
  validateAccessibility(template) {
    const validation = { errors: [], warnings: [], suggestions: [] };
    const content = template.template_content || '';

    // Check heading hierarchy
    const headings = content.match(/^#{1,6}\s+.+$/gm) || [];
    const headingLevels = headings.map(h => h.match(/^#+/)[0].length);
    
    for (let i = 1; i < headingLevels.length; i++) {
      if (headingLevels[i] > headingLevels[i-1] + 1) {
        validation.warnings.push('Heading hierarchy skips levels - impacts accessibility');
        break;
      }
    }

    // Check for alt text in images
    const images = content.match(/!\[([^\]]*)\]\([^)]+\)/g) || [];
    images.forEach(img => {
      const altText = img.match(/!\[([^\]]*)\]/)[1];
      if (!altText.trim()) {
        validation.warnings.push('Images missing alt text - impacts accessibility');
      }
    });

    // Check for descriptive link text
    const links = content.match(/\[([^\]]+)\]\([^)]+\)/g) || [];
    links.forEach(link => {
      const linkText = link.match(/\[([^\]]+)\]/)[1];
      if (linkText.toLowerCase().includes('click here') || linkText.toLowerCase().includes('read more')) {
        validation.suggestions.push('Use descriptive link text instead of "click here" or "read more"');
      }
    });

    return validation;
  }

  /**
   * Merge validation results
   * @param {Object} target - Target validation object
   * @param {Object} source - Source validation object
   */
  mergeValidationResults(target, source) {
    target.errors.push(...source.errors);
    target.warnings.push(...source.warnings);
    target.suggestions.push(...source.suggestions);
  }

  /**
   * Calculate overall scores
   * @param {Object} validation - Validation object
   */
  calculateOverallScores(validation) {
    const scores = validation.scores;
    const weights = {
      syntax: 0.3,
      content: 0.25,
      security: 0.25,
      performance: 0.2
    };

    validation.scores.overall_score = 
      (scores.syntax_score * weights.syntax) +
      (scores.content_score * weights.content) +
      (scores.security_score * weights.security) +
      (scores.performance_score * weights.performance);

    validation.scores.overall_score = Math.max(0, Math.min(1, validation.scores.overall_score));
  }

  /**
   * Generate improvement suggestions
   * @param {Object} validation - Validation object
   * @param {Object} template - Template object
   */
  generateSuggestions(validation, template) {
    const content = template.template_content || '';

    // Suggest improvements based on scores
    if (validation.scores.syntax_score < 0.8) {
      validation.suggestions.push('Consider reviewing template syntax for better compliance');
    }

    if (validation.scores.content_score < 0.7) {
      validation.suggestions.push('Consider improving content structure with headings and lists');
    }

    if (validation.scores.security_score < 0.9) {
      validation.suggestions.push('Review template for security best practices');
    }

    if (validation.scores.performance_score < 0.8) {
      validation.suggestions.push('Consider optimizing template complexity for better performance');
    }

    // Content-specific suggestions
    if (content.length > 5000) {
      validation.suggestions.push('Consider breaking large templates into smaller, reusable components');
    }

    if (validation.metadata.variable_count > 20) {
      validation.suggestions.push('Consider grouping related variables into objects');
    }
  }

  /**
   * Calculate template complexity score
   * @param {Object} template - Template object
   * @returns {number} Complexity score
   */
  calculateComplexityScore(template) {
    const content = template.template_content || '';
    const variables = (content.match(/\{\{[^}]+\}\}/g) || []).length;
    const conditionals = (content.match(/\{\{#if/g) || []).length;
    const loops = (content.match(/\{\{#each/g) || []).length;
    const helpers = (content.match(/\{\{[a-zA-Z_][a-zA-Z0-9_]*\s+/g) || []).length;
    
    return variables + (conditionals * 2) + (loops * 3) + (helpers * 1.5);
  }

  /**
   * Get expected variables for template type
   * @param {string} templateType - Template type
   * @returns {Array} Expected variables
   */
  getExpectedVariablesForType(templateType) {
    const expectedVariables = {
      'case_study': ['customer_name', 'challenge_description', 'solution_description'],
      'battle_card': ['competitor_name', 'our_advantage_1', 'their_advantage_1'],
      'email_campaign': ['customer_name', 'product_name', 'update_title'],
      'blog_post': ['post_title', 'author_name', 'main_point_1'],
      'social_media': ['main_message', 'hashtags', 'call_to_action'],
      'press_release': ['headline', 'company_name', 'announcement_summary']
    };

    return expectedVariables[templateType] || [];
  }

  /**
   * Validate audience appropriateness
   * @param {string} content - Template content
   * @param {string} audience - Target audience
   * @returns {Object} Validation result
   */
  validateAudienceAppropriate(content, audience) {
    const validation = { warnings: [], suggestions: [] };
    const contentLower = (content || '').toLowerCase();

    const audienceChecks = {
      'prospects': {
        avoid: ['technical jargon', 'internal processes'],
        encourage: ['benefits', 'value proposition', 'results']
      },
      'customers': {
        avoid: ['sales language', 'competitor mentions'],
        encourage: ['product updates', 'how-to guides', 'support information']
      },
      'internal_team': {
        avoid: ['marketing speak', 'competitive positioning'],
        encourage: ['process details', 'technical specifications', 'internal metrics']
      }
    };

    const checks = audienceChecks[audience];
    if (checks && checks.avoid && checks.encourage) {
      checks.avoid.forEach(term => {
        if (contentLower.includes(term)) {
          validation.warnings.push(`Content may contain ${term} which might not be appropriate for ${audience}`);
        }
      });

      checks.encourage.forEach(term => {
        if (!contentLower.includes(term)) {
          validation.suggestions.push(`Consider including ${term} for ${audience} audience`);
        }
      });
    }

    return validation;
  }

  /**
   * Validate template against database constraints
   * @param {Object} template - Template object
   * @returns {Object} Validation result
   */
  async validateDatabaseConstraints(template) {
    const validation = { errors: [], warnings: [], suggestions: [] };

    try {
      // Check for duplicate template names
      if (template.template_name) {
        const { data: existingTemplates } = await this.supabase
          .from('content_templates')
          .select('id, template_name')
          .eq('template_name', template.template_name)
          .neq('id', template.id || '');

        if (existingTemplates && existingTemplates.length > 0) {
          validation.warnings.push(`Template name "${template.template_name}" already exists`);
        }
      }

      // Check template type usage
      if (template.template_type) {
        const { data: typeUsage } = await this.supabase
          .from('content_templates')
          .select('id')
          .eq('template_type', template.template_type);

        if (typeUsage && typeUsage.length > 10) {
          validation.suggestions.push(`Template type "${template.template_type}" is heavily used - consider versioning`);
        }
      }

    } catch (error) {
      validation.warnings.push(`Database validation failed: ${error.message}`);
    }

    return validation;
  }

  /**
   * Get validation summary
   * @param {Object} validation - Validation result
   * @returns {Object} Summary
   */
  getValidationSummary(validation) {
    return {
      status: validation.isValid ? 'valid' : 'invalid',
      overall_score: validation.scores.overall_score,
      error_count: validation.errors.length,
      warning_count: validation.warnings.length,
      suggestion_count: validation.suggestions.length,
      complexity_score: validation.performance.complexity_score,
      estimated_processing_time: validation.metadata.estimated_processing_time,
      validation_time: validation.performance.validation_time
    };
  }
}

module.exports = TemplateValidator;