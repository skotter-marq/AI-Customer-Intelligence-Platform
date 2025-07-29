// lib/coda-ai-analyzer.js
/**
 * AI Analysis Service for Coda Research Initiatives
 * Analyzes meeting transcripts to extract specific research data
 */

class CodaAIAnalyzer {
  constructor() {
    this.aiProvider = null;
    this.initializeAI();
  }

  async initializeAI() {
    try {
      const AIProvider = require('./ai-provider.js');
      this.aiProvider = new AIProvider();
    } catch (error) {
      console.warn('⚠️ AI Provider not available for Coda analysis:', error.message);
    }
  }

  /**
   * Analyze meeting transcript for JTBD research insights
   * @param {string} transcript - Meeting transcript
   * @param {Array} jtbdQuestions - Array of JTBD questions to analyze
   * @returns {Promise<Object>} - Analysis results
   */
  async analyzeForJTBD(transcript, jtbdQuestions) {
    if (!this.aiProvider) {
      console.warn('AI Provider not available for JTBD analysis');
      return { error: 'AI analysis not available' };
    }

    try {
      console.log('🧠 Analyzing transcript for JTBD insights...');

      const prompt = this.buildJTBDPrompt(transcript, jtbdQuestions);
      
      const analysis = await this.aiProvider.analyzeContent(prompt, {
        temperature: 0.3, // Lower temperature for more focused analysis
        maxTokens: 2000
      });

      return this.parseJTBDResponse(analysis, jtbdQuestions);

    } catch (error) {
      console.error('❌ JTBD analysis failed:', error);
      return { error: error.message };
    }
  }

  /**
   * Analyze meeting transcript for custom research questions
   * @param {string} transcript - Meeting transcript
   * @param {Array} customQuestions - Array of custom research questions
   * @returns {Promise<Object>} - Analysis results
   */
  async analyzeForCustomResearch(transcript, customQuestions) {
    if (!this.aiProvider) {
      console.warn('AI Provider not available for custom research analysis');
      return { error: 'AI analysis not available' };
    }

    try {
      console.log('🔍 Analyzing transcript for custom research insights...');

      const prompt = this.buildCustomResearchPrompt(transcript, customQuestions);
      
      const analysis = await this.aiProvider.analyzeContent(prompt, {
        temperature: 0.2,
        maxTokens: 1500
      });

      return this.parseCustomResearchResponse(analysis, customQuestions);

    } catch (error) {
      console.error('❌ Custom research analysis failed:', error);
      return { error: error.message };
    }
  }

  /**
   * Extract specific data points from transcript
   * @param {string} transcript - Meeting transcript
   * @param {Object} extractionRules - Rules for data extraction
   * @returns {Promise<Object>} - Extracted data
   */
  async extractSpecificData(transcript, extractionRules) {
    if (!this.aiProvider) {
      return { error: 'AI analysis not available' };
    }

    try {
      console.log('📊 Extracting specific data points from transcript...');

      const results = {};

      for (const [fieldName, rule] of Object.entries(extractionRules)) {
        const prompt = this.buildExtractionPrompt(transcript, rule);
        const analysis = await this.aiProvider.analyzeContent(prompt, {
          temperature: 0.1, // Very focused extraction
          maxTokens: 500
        });

        results[fieldName] = this.parseExtractionResponse(analysis, rule);
      }

      return results;

    } catch (error) {
      console.error('❌ Data extraction failed:', error);
      return { error: error.message };
    }
  }

  /**
   * Build JTBD analysis prompt
   */
  buildJTBDPrompt(transcript, jtbdQuestions) {
    const jtbdList = jtbdQuestions.map((jtbd, index) => 
      `JTBD ${index + 1}: ${jtbd.description} ${jtbd.keywords ? `(look for keywords like ${jtbd.keywords})` : ''}`
    ).join('\n');

    return `Hi! Can you give me the top learnings for these JTBD/areas we got feedback on during this customer research call:

${jtbdList}

Here's the meeting transcript:
---
${transcript}
---

Please analyze the transcript and provide specific insights for each JTBD. Format your response as:

JTBD 1: [Your analysis and key learnings]
JTBD 2: [Your analysis and key learnings]
JTBD 3: [Your analysis and key learnings]

Focus on:
- Direct quotes that relate to each JTBD
- Pain points mentioned by the customer
- Specific examples or use cases discussed
- Priority level (high/medium/low) based on customer emphasis
- Actionable insights for product development

If no relevant information is found for a specific JTBD, please note "No relevant feedback found for this JTBD."`;
  }

  /**
   * Build custom research prompt
   */
  buildCustomResearchPrompt(transcript, customQuestions) {
    const questionList = customQuestions.map((q, index) => 
      `${index + 1}. ${q.question} ${q.context ? `(Context: ${q.context})` : ''}`
    ).join('\n');

    return `Please analyze this meeting transcript to answer the following research questions:

${questionList}

Meeting transcript:
---
${transcript}
---

Please provide detailed answers for each question based on the transcript content. If information for a question is not available, please note "Information not available in transcript."

Format your response as:
1. [Answer to question 1]
2. [Answer to question 2]
3. [Answer to question 3]

Focus on specific quotes, examples, and actionable insights where possible.`;
  }

  /**
   * Build data extraction prompt
   */
  buildExtractionPrompt(transcript, rule) {
    return `Please extract the following information from this meeting transcript:

Extraction Task: ${rule.description}
${rule.keywords ? `Keywords to look for: ${rule.keywords}` : ''}
${rule.format ? `Expected format: ${rule.format}` : ''}

Meeting transcript:
---
${transcript}
---

Please provide only the extracted information in the requested format. If the information is not found, respond with "Not found".`;
  }

  /**
   * Parse JTBD analysis response
   */
  parseJTBDResponse(analysis, jtbdQuestions) {
    const results = {
      jtbd_insights: {},
      summary: '',
      priority_scores: {}
    };

    try {
      // Extract insights for each JTBD
      jtbdQuestions.forEach((jtbd, index) => {
        const jtbdNumber = index + 1;
        const regex = new RegExp(`JTBD ${jtbdNumber}:([^]*?)(?=JTBD ${jtbdNumber + 1}:|$)`, 'i');
        const match = analysis.match(regex);
        
        if (match) {
          const insight = match[1].trim();
          results.jtbd_insights[`jtbd_${jtbdNumber}`] = insight;
          
          // Extract priority if mentioned
          if (insight.toLowerCase().includes('high priority') || insight.toLowerCase().includes('critical')) {
            results.priority_scores[`jtbd_${jtbdNumber}`] = 'High';
          } else if (insight.toLowerCase().includes('medium priority') || insight.toLowerCase().includes('important')) {
            results.priority_scores[`jtbd_${jtbdNumber}`] = 'Medium';
          } else {
            results.priority_scores[`jtbd_${jtbdNumber}`] = 'Low';
          }
        }
      });

      // Generate summary
      const insightCount = Object.keys(results.jtbd_insights).length;
      results.summary = `Analyzed ${jtbdQuestions.length} JTBD areas, found insights for ${insightCount} areas`;

    } catch (error) {
      console.error('Error parsing JTBD response:', error);
      results.error = 'Failed to parse JTBD analysis';
    }

    return results;
  }

  /**
   * Parse custom research response
   */
  parseCustomResearchResponse(analysis, customQuestions) {
    const results = {
      research_findings: {},
      summary: ''
    };

    try {
      customQuestions.forEach((question, index) => {
        const questionNumber = index + 1;
        const regex = new RegExp(`${questionNumber}\\.([^]*?)(?=${questionNumber + 1}\\.|$)`, 'i');
        const match = analysis.match(regex);
        
        if (match) {
          results.research_findings[`question_${questionNumber}`] = match[1].trim();
        }
      });

      const findingCount = Object.keys(results.research_findings).length;
      results.summary = `Analyzed ${customQuestions.length} research questions, found answers for ${findingCount} questions`;

    } catch (error) {
      console.error('Error parsing custom research response:', error);
      results.error = 'Failed to parse custom research analysis';
    }

    return results;
  }

  /**
   * Parse extraction response
   */
  parseExtractionResponse(analysis, rule) {
    if (!analysis || analysis.toLowerCase().includes('not found')) {
      return rule.defaultValue || '';
    }

    // Apply any post-processing based on rule format
    if (rule.format === 'list') {
      return analysis.split(',').map(item => item.trim()).join(', ');
    } else if (rule.format === 'boolean') {
      return analysis.toLowerCase().includes('yes') || analysis.toLowerCase().includes('true');
    } else if (rule.format === 'number') {
      const number = analysis.match(/\d+/);
      return number ? parseInt(number[0]) : 0;
    }

    return analysis.trim();
  }

  /**
   * Get default JTBD questions for customer research
   */
  getDefaultJTBDQuestions() {
    return [
      {
        description: "I need appropriate access to locked elements so I can adapt the content to my specific needs.",
        keywords: "access, locked, permissions, customize, adapt"
      },
      {
        description: "I need to effectively manage and manipulate images so I can produce professional-looking content.",
        keywords: "images, photos, graphics, visual content, design"
      },
      {
        description: "I need to easily incorporate accurate data so I can produce content quickly without manual entry errors.",
        keywords: "data automations, smart fields, data integration, accuracy"
      }
    ];
  }

  /**
   * Get sample extraction rules for common research fields
   */
  getSampleExtractionRules() {
    return {
      pain_points: {
        description: "List the main pain points or challenges mentioned by the customer",
        keywords: "problem, issue, challenge, difficult, frustrated",
        format: "list"
      },
      feature_requests: {
        description: "Identify specific feature requests or enhancement suggestions",
        keywords: "want, need, would like, suggestion, feature",
        format: "list"
      },
      competitor_mentions: {
        description: "Extract any competitor names or competitive comparisons mentioned",
        keywords: "competitor, alternative, compared to, versus",
        format: "list"
      },
      urgency_level: {
        description: "Determine the urgency level of the customer's needs (High/Medium/Low)",
        keywords: "urgent, ASAP, critical, timeline, deadline",
        format: "text"
      },
      decision_timeline: {
        description: "Extract information about the customer's decision or implementation timeline",
        keywords: "when, timeline, deadline, by when, schedule",
        format: "text"
      }
    };
  }
}

module.exports = { CodaAIAnalyzer };