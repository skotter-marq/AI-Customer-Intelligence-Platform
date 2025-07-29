// lib/content-templates.js
/**
 * Content Template System
 * Manages and processes content templates for automated marketing content generation
 */

const { createClient } = require('@supabase/supabase-js');
const TemplateValidator = require('./template-validator.js');
require('dotenv').config({ path: '.env.local' });

class ContentTemplates {
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    this.validator = new TemplateValidator();
    
    // Built-in template library
    this.builtInTemplates = {
      case_study: {
        name: 'Customer Success Story',
        description: 'Template for creating customer success stories from meeting insights',
        variables: {
          customer_name: 'string',
          challenge_description: 'string',
          impact_area: 'string', 
          solution_description: 'string',
          result_1: 'string',
          result_2: 'string',
          result_3: 'string',
          customer_quote: 'string',
          customer_contact_name: 'string',
          customer_contact_title: 'string',
          customer_description: 'string'
        },
        content: `# Customer Success Story: {{customer_name}}

## Challenge
{{customer_name}} faced {{challenge_description}} which was impacting {{impact_area}}.

## Solution
Our team worked with {{customer_name}} to implement {{solution_description}}.

## Results
- {{result_1}}
- {{result_2}}
- {{result_3}}

## Quote
"{{customer_quote}}" - {{customer_contact_name}}, {{customer_contact_title}}

## About {{customer_name}}
{{customer_description}}`
      },
      battle_card: {
        name: 'Competitive Battle Card',
        description: 'Template for creating competitive battle cards from intelligence signals',
        variables: {
          competitor_name: 'string',
          competitor_description: 'string',
          our_advantage_1: 'string',
          our_advantage_2: 'string',
          our_advantage_3: 'string',
          their_advantage_1: 'string',
          their_advantage_2: 'string',
          our_pricing: 'string',
          their_pricing: 'string',
          talk_track_point_1: 'string',
          talk_track_point_2: 'string',
          talk_track_point_3: 'string',
          recent_intelligence: 'string',
          last_updated: 'string'
        },
        content: `# Battle Card: {{competitor_name}}

## Overview
{{competitor_description}}

## Key Differentiators
### Our Advantages
- {{our_advantage_1}}
- {{our_advantage_2}}
- {{our_advantage_3}}

### Their Advantages
- {{their_advantage_1}}
- {{their_advantage_2}}

## Pricing Comparison
- Our pricing: {{our_pricing}}
- Their pricing: {{their_pricing}}

## Talk Track
When competing against {{competitor_name}}, emphasize:
1. {{talk_track_point_1}}
2. {{talk_track_point_2}}
3. {{talk_track_point_3}}

## Recent Intelligence
{{recent_intelligence}}

Last Updated: {{last_updated}}`
      },
      blog_post: {
        name: 'Thought Leadership Blog Post',
        description: 'Template for creating blog posts from market insights',
        variables: {
          post_title: 'string',
          author_name: 'string',
          intro_hook: 'string',
          main_point_1: 'string',
          main_point_2: 'string',
          main_point_3: 'string',
          supporting_data: 'string',
          call_to_action: 'string',
          meta_description: 'string',
          keywords: 'array'
        },
        content: `# {{post_title}}

{{intro_hook}}

## Key Insights

### {{main_point_1}}
[Content about main point 1]

### {{main_point_2}}
[Content about main point 2]

### {{main_point_3}}
[Content about main point 3]

## Supporting Data
{{supporting_data}}

## Conclusion
{{call_to_action}}

---
*About the Author: {{author_name}}*`
      },
      email_campaign: {
        name: 'Product Update Email',
        description: 'Template for product update emails from JIRA completions',
        variables: {
          product_name: 'string',
          update_title: 'string',
          customer_name: 'string',
          update_description: 'string',
          customer_benefit: 'string',
          getting_started_instructions: 'string',
          support_contact_info: 'string',
          company_name: 'string'
        },
        content: `Subject: {{product_name}} Update: {{update_title}}

Hi {{customer_name}},

We've got some exciting news to share! Based on your feedback and requests, we've released {{update_title}}.

## What's New
{{update_description}}

## How This Helps You
{{customer_benefit}}

## Get Started
{{getting_started_instructions}}

## Questions?
{{support_contact_info}}

Thanks for being a valued customer!

The {{company_name}} Team`
      },
      social_media: {
        name: 'Social Media Post',
        description: 'Template for social media posts from company updates',
        variables: {
          platform: 'string',
          main_message: 'string',
          hashtags: 'array',
          call_to_action: 'string',
          link_url: 'string',
          image_description: 'string'
        },
        content: `{{main_message}}

{{#if call_to_action}}
{{call_to_action}}
{{/if}}

{{#if link_url}}
Learn more: {{link_url}}
{{/if}}

{{#if hashtags}}
{{#each hashtags}}#{{this}} {{/each}}
{{/if}}`
      },
      press_release: {
        name: 'Press Release',
        description: 'Template for press releases from major announcements',
        variables: {
          headline: 'string',
          dateline: 'string',
          company_name: 'string',
          announcement_summary: 'string',
          quote_1: 'string',
          quote_1_attribution: 'string',
          details_paragraph_1: 'string',
          details_paragraph_2: 'string',
          quote_2: 'string',
          quote_2_attribution: 'string',
          about_company: 'string',
          contact_info: 'string'
        },
        content: `# {{headline}}

{{dateline}} -- {{company_name}} {{announcement_summary}}

{{details_paragraph_1}}

"{{quote_1}}" said {{quote_1_attribution}}.

{{details_paragraph_2}}

"{{quote_2}}" added {{quote_2_attribution}}.

## About {{company_name}}
{{about_company}}

## Contact
{{contact_info}}`
      },
      one_pager: {
        name: 'Product One-Pager',
        description: 'Template for product one-pagers from feature analysis',
        variables: {
          product_name: 'string',
          value_proposition: 'string',
          target_audience: 'string',
          key_benefit_1: 'string',
          key_benefit_2: 'string',
          key_benefit_3: 'string',
          use_case_1: 'string',
          use_case_2: 'string',
          technical_specs: 'string',
          pricing_info: 'string',
          contact_info: 'string'
        },
        content: `# {{product_name}}

## Value Proposition
{{value_proposition}}

## Target Audience
{{target_audience}}

## Key Benefits
- {{key_benefit_1}}
- {{key_benefit_2}}
- {{key_benefit_3}}

## Use Cases
### {{use_case_1}}
[Details about use case 1]

### {{use_case_2}}
[Details about use case 2]

## Technical Specifications
{{technical_specs}}

## Pricing
{{pricing_info}}

## Contact
{{contact_info}}`
      },
      testimonial: {
        name: 'Customer Testimonial',
        description: 'Template for customer testimonials from positive feedback',
        variables: {
          customer_name: 'string',
          customer_title: 'string',
          company_name: 'string',
          testimonial_text: 'string',
          context: 'string',
          product_mentioned: 'string',
          outcome_achieved: 'string'
        },
        content: `# Customer Testimonial

## Context
{{context}}

## Testimonial
"{{testimonial_text}}"

**{{customer_name}}**, {{customer_title}}  
{{company_name}}

## Outcome
{{outcome_achieved}} using {{product_mentioned}}.`
      },
      changelog: {
        name: 'Product Changelog Entry',
        description: 'Template for changelog entries from product updates',
        variables: {
          version: 'string',
          release_date: 'string',
          new_features: 'array',
          improvements: 'array',
          bug_fixes: 'array',
          breaking_changes: 'array'
        },
        content: `# Version {{version}} - {{release_date}}

{{#if new_features}}
## 🎉 New Features
{{#each new_features}}
- {{this}}
{{/each}}
{{/if}}

{{#if improvements}}
## 🚀 Improvements
{{#each improvements}}
- {{this}}
{{/each}}
{{/if}}

{{#if bug_fixes}}
## 🐛 Bug Fixes
{{#each bug_fixes}}
- {{this}}
{{/each}}
{{/if}}

{{#if breaking_changes}}
## ⚠️ Breaking Changes
{{#each breaking_changes}}
- {{this}}
{{/each}}
{{/if}}`
      },
      demo_script: {
        name: 'Product Demo Script',
        description: 'Template for product demo scripts from feature highlights',
        variables: {
          product_name: 'string',
          demo_duration: 'string',
          target_audience: 'string',
          opening_hook: 'string',
          feature_1: 'string',
          feature_1_benefit: 'string',
          feature_2: 'string',
          feature_2_benefit: 'string',
          feature_3: 'string',
          feature_3_benefit: 'string',
          closing_cta: 'string',
          next_steps: 'string'
        },
        content: `# {{product_name}} Demo Script ({{demo_duration}})

**Target Audience**: {{target_audience}}

## Opening (2 minutes)
{{opening_hook}}

## Feature Demonstration

### {{feature_1}} (3 minutes)
**Demo**: [Show feature 1]
**Benefit**: {{feature_1_benefit}}

### {{feature_2}} (3 minutes)
**Demo**: [Show feature 2]
**Benefit**: {{feature_2_benefit}}

### {{feature_3}} (3 minutes)
**Demo**: [Show feature 3]
**Benefit**: {{feature_3_benefit}}

## Closing (2 minutes)
{{closing_cta}}

## Next Steps
{{next_steps}}`
      }
    };
  }

  /**
   * Get all available content templates
   * @returns {Array} List of content templates
   */
  async getTemplates() {
    try {
      const { data: templates, error } = await this.supabase
        .from('content_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch templates: ${error.message}`);
      }

      return templates;
    } catch (error) {
      console.error('❌ Failed to get templates:', error.message);
      throw error;
    }
  }

  /**
   * Get a specific template by ID
   * @param {string} templateId - Template ID
   * @returns {Object} Template details
   */
  async getTemplate(templateId) {
    try {
      const { data: template, error } = await this.supabase
        .from('content_templates')
        .select('*')
        .eq('id', templateId)
        .eq('is_active', true)
        .single();

      if (error) {
        throw new Error(`Failed to fetch template: ${error.message}`);
      }

      return template;
    } catch (error) {
      console.error('❌ Failed to get template:', error.message);
      throw error;
    }
  }

  /**
   * Create a new content template with validation
   * @param {Object} templateData - Template data
   * @param {Object} options - Creation options
   * @returns {Object} Created template with validation result
   */
  async createTemplate(templateData, options = {}) {
    try {
      const template = {
        template_name: templateData.name,
        template_type: templateData.type,
        template_category: templateData.category,
        template_description: templateData.description,
        template_content: templateData.content,
        template_variables: templateData.variables || {},
        required_data_sources: templateData.requiredDataSources || [],
        target_audience: templateData.targetAudience,
        content_format: templateData.format || 'markdown',
        approval_required: templateData.approvalRequired !== false,
        created_by: templateData.createdBy || 'AI System'
      };

      // Validate template before creation
      const validation = await this.validator.validateTemplate(template);
      
      if (!validation.isValid && !options.skipValidation) {
        throw new Error(`Template validation failed: ${validation.errors.join(', ')}`);
      }

      // Add validation metadata
      template.validation_score = validation.scores.overall_score;
      template.validation_metadata = {
        last_validated: new Date().toISOString(),
        validation_version: '1.0',
        complexity_score: validation.performance.complexity_score,
        validation_warnings: validation.warnings.length,
        validation_suggestions: validation.suggestions.length
      };

      const { data: createdTemplate, error } = await this.supabase
        .from('content_templates')
        .insert(template)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create template: ${error.message}`);
      }

      console.log(`✅ Template created: ${createdTemplate.template_name}`);
      console.log(`   Validation score: ${validation.scores.overall_score.toFixed(2)}`);
      
      if (validation.warnings.length > 0) {
        console.log(`   Warnings: ${validation.warnings.length}`);
      }

      return {
        template: createdTemplate,
        validation: validation
      };
    } catch (error) {
      console.error('❌ Failed to create template:', error.message);
      throw error;
    }
  }

  /**
   * Update an existing template
   * @param {string} templateId - Template ID
   * @param {Object} updates - Template updates
   * @returns {Object} Updated template
   */
  async updateTemplate(templateId, updates) {
    try {
      const { data: updatedTemplate, error } = await this.supabase
        .from('content_templates')
        .update(updates)
        .eq('id', templateId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update template: ${error.message}`);
      }

      console.log(`✅ Template updated: ${updatedTemplate.template_name}`);
      return updatedTemplate;
    } catch (error) {
      console.error('❌ Failed to update template:', error.message);
      throw error;
    }
  }

  /**
   * Process template content with variables
   * @param {string} templateContent - Template content with variables
   * @param {Object} variables - Variable values
   * @returns {string} Processed content
   */
  processTemplate(templateContent, variables = {}) {
    try {
      let processedContent = templateContent;

      // Handle simple variable substitution {{variable}}
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        processedContent = processedContent.replace(regex, value || `[${key}]`);
      });

      // Handle conditional blocks {{#if condition}}
      processedContent = this.processConditionals(processedContent, variables);

      // Handle loops {{#each array}}
      processedContent = this.processLoops(processedContent, variables);

      // Clean up any remaining template syntax
      processedContent = this.cleanupTemplate(processedContent);

      return processedContent;
    } catch (error) {
      console.error('❌ Failed to process template:', error.message);
      return templateContent;
    }
  }

  /**
   * Process conditional blocks in template
   * @param {string} content - Template content
   * @param {Object} variables - Variable values
   * @returns {string} Processed content
   */
  processConditionals(content, variables) {
    // Simple conditional processing {{#if variable}}...{{/if}}
    const conditionalRegex = /\{\{#if (\w+)\}\}(.*?)\{\{\/if\}\}/gs;
    
    return content.replace(conditionalRegex, (match, condition, block) => {
      const conditionValue = variables[condition];
      if (conditionValue && conditionValue !== '' && conditionValue !== null && conditionValue !== undefined) {
        return block.trim();
      }
      return '';
    });
  }

  /**
   * Process loops in template
   * @param {string} content - Template content
   * @param {Object} variables - Variable values
   * @returns {string} Processed content
   */
  processLoops(content, variables) {
    // Simple loop processing {{#each array}}...{{/each}}
    const loopRegex = /\{\{#each (\w+)\}\}(.*?)\{\{\/each\}\}/gs;
    
    return content.replace(loopRegex, (match, arrayName, block) => {
      const arrayValue = variables[arrayName];
      if (Array.isArray(arrayValue) && arrayValue.length > 0) {
        return arrayValue.map(item => {
          return block.replace(/\{\{this\}\}/g, item);
        }).join('');
      }
      return '';
    });
  }

  /**
   * Clean up remaining template syntax
   * @param {string} content - Template content
   * @returns {string} Cleaned content
   */
  cleanupTemplate(content) {
    // Remove any remaining handlebars syntax
    return content
      .replace(/\{\{[^}]+\}\}/g, '') // Remove remaining variables
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Clean up multiple newlines
      .trim();
  }

  /**
   * Validate template syntax
   * @param {string} templateContent - Template content to validate
   * @returns {Object} Validation result
   */
  validateTemplate(templateContent) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      variables: [],
      conditionals: [],
      loops: []
    };

    try {
      // Extract variables
      const variableMatches = templateContent.match(/\{\{(\w+)\}\}/g);
      if (variableMatches) {
        validation.variables = [...new Set(variableMatches.map(match => 
          match.replace(/\{\{|\}\}/g, '')
        ))];
      }

      // Extract conditionals
      const conditionalMatches = templateContent.match(/\{\{#if (\w+)\}\}/g);
      if (conditionalMatches) {
        validation.conditionals = conditionalMatches.map(match => 
          match.replace(/\{\{#if |}\}/g, '')
        );
      }

      // Extract loops
      const loopMatches = templateContent.match(/\{\{#each (\w+)\}\}/g);
      if (loopMatches) {
        validation.loops = loopMatches.map(match => 
          match.replace(/\{\{#each |}\}/g, '')
        );
      }

      // Check for unmatched conditional blocks
      const ifCount = (templateContent.match(/\{\{#if/g) || []).length;
      const endIfCount = (templateContent.match(/\{\{\/if\}\}/g) || []).length;
      if (ifCount !== endIfCount) {
        validation.isValid = false;
        validation.errors.push('Unmatched conditional blocks ({{#if}} and {{/if}})');
      }

      // Check for unmatched loop blocks
      const eachCount = (templateContent.match(/\{\{#each/g) || []).length;
      const endEachCount = (templateContent.match(/\{\{\/each\}\}/g) || []).length;
      if (eachCount !== endEachCount) {
        validation.isValid = false;
        validation.errors.push('Unmatched loop blocks ({{#each}} and {{/each}})');
      }

      // Check for empty template
      if (!templateContent.trim()) {
        validation.isValid = false;
        validation.errors.push('Template content is empty');
      }

      // Warnings for best practices
      if (validation.variables.length === 0) {
        validation.warnings.push('Template has no variables - consider adding dynamic content');
      }

      if (templateContent.length < 50) {
        validation.warnings.push('Template is very short - consider adding more content');
      }

    } catch (error) {
      validation.isValid = false;
      validation.errors.push(`Template validation error: ${error.message}`);
    }

    return validation;
  }

  /**
   * Get template suggestions based on content type
   * @param {string} contentType - Type of content needed
   * @param {Object} context - Context for suggestions
   * @returns {Array} Template suggestions
   */
  getTemplateSuggestions(contentType, context = {}) {
    const suggestions = [];

    // Built-in template suggestions
    Object.entries(this.builtInTemplates).forEach(([key, template]) => {
      if (key === contentType || template.name.toLowerCase().includes(contentType.toLowerCase())) {
        suggestions.push({
          ...template,
          id: key,
          source: 'built-in',
          match_score: 1.0
        });
      }
    });

    // Add context-based suggestions
    if (context.hasCustomerData) {
      suggestions.push({
        id: 'case_study',
        name: 'Customer Success Story',
        description: 'Perfect for showcasing customer results',
        match_score: 0.9,
        source: 'built-in'
      });
    }

    if (context.hasCompetitiveData) {
      suggestions.push({
        id: 'battle_card',
        name: 'Competitive Battle Card',
        description: 'Ideal for competitive positioning',
        match_score: 0.9,
        source: 'built-in'
      });
    }

    if (context.hasProductUpdate) {
      suggestions.push({
        id: 'email_campaign',
        name: 'Product Update Email',
        description: 'Great for announcing product updates',
        match_score: 0.8,
        source: 'built-in'
      });
    }

    return suggestions.sort((a, b) => b.match_score - a.match_score);
  }

  /**
   * Install built-in templates to database
   * @returns {Array} Installed templates
   */
  async installBuiltInTemplates() {
    try {
      console.log('📦 Installing built-in templates...');
      
      const installedTemplates = [];
      
      for (const [templateId, template] of Object.entries(this.builtInTemplates)) {
        // Check if template already exists
        const { data: existingTemplate } = await this.supabase
          .from('content_templates')
          .select('id')
          .eq('template_name', template.name)
          .single();

        if (existingTemplate) {
          console.log(`⚠️  Template already exists: ${template.name}`);
          continue;
        }

        // Create template
        const templateData = {
          name: template.name,
          type: templateId,
          category: this.getCategoryFromType(templateId),
          description: template.description,
          content: template.content,
          variables: template.variables,
          requiredDataSources: this.getRequiredDataSources(templateId),
          targetAudience: this.getTargetAudience(templateId),
          format: 'markdown',
          createdBy: 'Built-in System'
        };

        const createdTemplate = await this.createTemplate(templateData, { skipValidation: true });
        installedTemplates.push(createdTemplate);
      }

      console.log(`✅ Installed ${installedTemplates.length} built-in templates`);
      return installedTemplates;
    } catch (error) {
      console.error('❌ Failed to install built-in templates:', error.message);
      throw error;
    }
  }

  /**
   * Get category from template type
   * @param {string} templateType - Template type
   * @returns {string} Category
   */
  getCategoryFromType(templateType) {
    const categoryMap = {
      'case_study': 'customer_advocacy',
      'battle_card': 'competitive_intelligence',
      'blog_post': 'thought_leadership',
      'email_campaign': 'product_marketing',
      'social_media': 'demand_generation',
      'press_release': 'marketing_campaign',
      'one_pager': 'sales_enablement',
      'testimonial': 'customer_advocacy',
      'changelog': 'product_marketing',
      'demo_script': 'sales_enablement'
    };

    return categoryMap[templateType] || 'marketing_campaign';
  }

  /**
   * Get required data sources for template type
   * @param {string} templateType - Template type
   * @returns {Array} Required data sources
   */
  getRequiredDataSources(templateType) {
    const dataSourceMap = {
      'case_study': ['customer_meeting', 'customer_insight'],
      'battle_card': ['competitive_signal', 'market_research'],
      'blog_post': ['market_research', 'customer_insight'],
      'email_campaign': ['product_update', 'customer_feedback'],
      'social_media': ['product_update', 'customer_feedback'],
      'press_release': ['product_update', 'market_research'],
      'one_pager': ['product_update', 'customer_feedback'],
      'testimonial': ['customer_feedback', 'customer_meeting'],
      'changelog': ['product_update'],
      'demo_script': ['product_update', 'customer_feedback']
    };

    return dataSourceMap[templateType] || [];
  }

  /**
   * Get target audience for template type
   * @param {string} templateType - Template type
   * @returns {string} Target audience
   */
  getTargetAudience(templateType) {
    const audienceMap = {
      'case_study': 'prospects',
      'battle_card': 'internal_team',
      'blog_post': 'prospects',
      'email_campaign': 'customers',
      'social_media': 'prospects',
      'press_release': 'media',
      'one_pager': 'prospects',
      'testimonial': 'prospects',
      'changelog': 'customers',
      'demo_script': 'internal_team'
    };

    return audienceMap[templateType] || 'prospects';
  }

  /**
   * Validate an existing template
   * @param {string} templateId - Template ID
   * @returns {Object} Validation result
   */
  async validateExistingTemplate(templateId) {
    try {
      const template = await this.getTemplate(templateId);
      const validation = await this.validator.validateTemplate(template);
      
      // Update validation metadata in database
      await this.supabase
        .from('content_templates')
        .update({
          validation_score: validation.scores.overall_score,
          validation_metadata: {
            last_validated: new Date().toISOString(),
            validation_version: '1.0',
            complexity_score: validation.performance.complexity_score,
            validation_warnings: validation.warnings.length,
            validation_suggestions: validation.suggestions.length
          }
        })
        .eq('id', templateId);

      return validation;
    } catch (error) {
      console.error('❌ Failed to validate template:', error.message);
      throw error;
    }
  }

  /**
   * Validate all templates in the system
   * @returns {Object} Validation summary
   */
  async validateAllTemplates() {
    try {
      console.log('🔍 Validating all templates...');
      
      const templates = await this.getTemplates();
      const validationResults = [];
      
      for (const template of templates) {
        const validation = await this.validator.validateTemplate(template);
        validationResults.push({
          id: template.id,
          name: template.template_name,
          type: template.template_type,
          validation: validation
        });
      }

      // Generate summary
      const summary = {
        total_templates: templates.length,
        valid_templates: validationResults.filter(r => r.validation.isValid).length,
        invalid_templates: validationResults.filter(r => !r.validation.isValid).length,
        average_score: validationResults.reduce((sum, r) => sum + r.validation.scores.overall_score, 0) / validationResults.length,
        total_errors: validationResults.reduce((sum, r) => sum + r.validation.errors.length, 0),
        total_warnings: validationResults.reduce((sum, r) => sum + r.validation.warnings.length, 0),
        validation_date: new Date().toISOString(),
        results: validationResults
      };

      console.log(`✅ Validation complete: ${summary.valid_templates}/${summary.total_templates} templates valid`);
      console.log(`   Average score: ${summary.average_score.toFixed(2)}`);
      
      return summary;
    } catch (error) {
      console.error('❌ Failed to validate all templates:', error.message);
      throw error;
    }
  }

  /**
   * Get templates that need validation updates
   * @param {number} daysOld - Days since last validation
   * @returns {Array} Templates needing validation
   */
  async getTemplatesNeedingValidation(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const { data: templates, error } = await this.supabase
        .from('content_templates')
        .select('*')
        .eq('is_active', true)
        .or(`validation_metadata->>'last_validated'.is.null,validation_metadata->>'last_validated'.lt.${cutoffDate.toISOString()}`);

      if (error) {
        throw new Error(`Failed to get templates needing validation: ${error.message}`);
      }

      return templates;
    } catch (error) {
      console.error('❌ Failed to get templates needing validation:', error.message);
      throw error;
    }
  }

  /**
   * Get template validation summary
   * @returns {Object} Validation summary
   */
  async getValidationSummary() {
    try {
      const { data: templates, error } = await this.supabase
        .from('content_templates')
        .select('validation_score, validation_metadata, is_active')
        .eq('is_active', true);

      if (error) {
        throw new Error(`Failed to get validation summary: ${error.message}`);
      }

      const summary = {
        total_templates: templates.length,
        validated_templates: templates.filter(t => t.validation_score !== null).length,
        unvalidated_templates: templates.filter(t => t.validation_score === null).length,
        average_score: 0,
        score_distribution: {
          excellent: 0, // 0.9-1.0
          good: 0,      // 0.7-0.89
          fair: 0,      // 0.5-0.69
          poor: 0       // < 0.5
        },
        needs_attention: []
      };

      const validatedTemplates = templates.filter(t => t.validation_score !== null);
      
      if (validatedTemplates.length > 0) {
        summary.average_score = validatedTemplates.reduce((sum, t) => sum + t.validation_score, 0) / validatedTemplates.length;
        
        validatedTemplates.forEach(template => {
          const score = template.validation_score;
          if (score >= 0.9) summary.score_distribution.excellent++;
          else if (score >= 0.7) summary.score_distribution.good++;
          else if (score >= 0.5) summary.score_distribution.fair++;
          else {
            summary.score_distribution.poor++;
            summary.needs_attention.push({
              score: score,
              warnings: template.validation_metadata?.validation_warnings || 0,
              suggestions: template.validation_metadata?.validation_suggestions || 0
            });
          }
        });
      }

      return summary;
    } catch (error) {
      console.error('❌ Failed to get validation summary:', error.message);
      throw error;
    }
  }

  /**
   * Enhanced template validation with detailed reporting
   * @param {string} templateContent - Template content
   * @param {Object} options - Validation options
   * @returns {Object} Enhanced validation result
   */
  validateTemplateContent(templateContent, options = {}) {
    try {
      const baseValidation = this.validateTemplate(templateContent);
      
      // Add enhanced validation features
      const enhancedValidation = {
        ...baseValidation,
        recommendations: [],
        complexity_analysis: {},
        performance_insights: {}
      };

      // Generate specific recommendations
      if (baseValidation.variables.length > 10) {
        enhancedValidation.recommendations.push({
          type: 'optimization',
          message: 'Consider grouping related variables into objects',
          priority: 'medium'
        });
      }

      if (baseValidation.conditionals.length > 5) {
        enhancedValidation.recommendations.push({
          type: 'maintainability',
          message: 'High number of conditionals may impact maintainability',
          priority: 'low'
        });
      }

      // Complexity analysis
      const totalComplexity = baseValidation.variables.length + 
                            (baseValidation.conditionals.length * 2) + 
                            (baseValidation.loops.length * 3);
      
      enhancedValidation.complexity_analysis = {
        total_complexity: totalComplexity,
        variable_complexity: baseValidation.variables.length,
        conditional_complexity: baseValidation.conditionals.length * 2,
        loop_complexity: baseValidation.loops.length * 3,
        complexity_rating: totalComplexity > 20 ? 'high' : totalComplexity > 10 ? 'medium' : 'low'
      };

      // Performance insights
      enhancedValidation.performance_insights = {
        estimated_render_time: Math.max(50, totalComplexity * 5), // milliseconds
        memory_usage_estimate: Math.max(1024, templateContent.length * 2), // bytes
        optimization_opportunities: []
      };

      if (totalComplexity > 15) {
        enhancedValidation.performance_insights.optimization_opportunities.push('Consider template caching');
      }

      if (templateContent.length > 5000) {
        enhancedValidation.performance_insights.optimization_opportunities.push('Consider template chunking');
      }

      return enhancedValidation;
    } catch (error) {
      console.error('❌ Enhanced validation failed:', error.message);
      return this.validateTemplate(templateContent); // Fallback to basic validation
    }
  }
}

module.exports = ContentTemplates;