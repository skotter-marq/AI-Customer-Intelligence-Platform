/**
 * N8n Integration Service
 * Handles all communication between the platform and n8n workflows
 */

export interface N8nWorkflow {
  id?: string;
  name: string;
  active: boolean;
  nodes: N8nNode[];
  connections: { [key: string]: { main: Array<Array<{ node: string; type: string; index: number }>> } };
  settings?: {
    timezone?: string;
    saveExecutionProgress?: boolean;
    saveManualExecutions?: boolean;
  };
}

export interface N8nNode {
  id: string;
  name: string;
  type: string;
  position: [number, number];
  parameters: { [key: string]: any };
  typeVersion?: number;
}

export interface N8nExecution {
  id: string;
  mode: string;
  startedAt: string;
  stoppedAt?: string;
  status: 'success' | 'error' | 'running' | 'waiting';
  workflowId: string;
  data?: {
    resultData?: {
      runData?: { [key: string]: any[] };
    };
  };
}

export interface AgentWorkflowConfig {
  agentId: string;
  agentType: 'renewal' | 'health' | 'competitive' | 'market-trends';
  name: string;
  schedule: string; // cron expression
  customerQuery?: {
    segment?: string;
    status?: string[];
    tier?: string[];
    excludeTags?: string[];
  };
  competitorIds?: string[];
  emailTemplates?: {
    [key: string]: string;
  };
  settings: {
    tone: string;
    frequency: string;
    maxAttempts: number;
  };
}

class N8nIntegrationService {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly platformBaseUrl: string;

  constructor() {
    this.baseUrl = process.env.N8N_BASE_URL || 'http://localhost:5678';
    this.apiKey = process.env.N8N_API_KEY || '';
    this.platformBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  }

  /**
   * Create a new workflow in n8n based on agent configuration
   */
  async createAgentWorkflow(config: AgentWorkflowConfig): Promise<string> {
    const workflow = this.generateWorkflowFromConfig(config);
    
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/workflows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-API-KEY': this.apiKey,
        },
        body: JSON.stringify(workflow),
      });

      if (!response.ok) {
        throw new Error(`Failed to create workflow: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Activate the workflow immediately
      await this.activateWorkflow(result.id);
      
      return result.id;
    } catch (error) {
      console.error('Error creating n8n workflow:', error);
      throw error;
    }
  }

  /**
   * Generate n8n workflow configuration from agent settings
   */
  private generateWorkflowFromConfig(config: AgentWorkflowConfig): N8nWorkflow {
    switch (config.agentType) {
      case 'renewal':
        return this.generateRenewalWorkflow(config);
      case 'health':
        return this.generateHealthWorkflow(config);
      case 'competitive':
        return this.generateCompetitiveWorkflow(config);
      case 'market-trends':
        return this.generateMarketTrendsWorkflow(config);
      default:
        throw new Error(`Unknown agent type: ${config.agentType}`);
    }
  }

  /**
   * Generate renewal specialist workflow
   */
  private generateRenewalWorkflow(config: AgentWorkflowConfig): N8nWorkflow {
    const nodes: N8nNode[] = [
      // Schedule trigger
      {
        id: 'schedule-trigger',
        name: 'Schedule Trigger',
        type: 'n8n-nodes-base.scheduleTrigger',
        position: [250, 300],
        parameters: {
          rule: {
            interval: [{
              field: 'cronExpression',
              expression: config.schedule
            }]
          }
        }
      },
      
      // Get customers from platform API
      {
        id: 'get-customers',
        name: 'Get Target Customers',
        type: 'n8n-nodes-base.httpRequest',
        position: [450, 300],
        parameters: {
          url: `${this.platformBaseUrl}/api/customers/query`,
          method: 'POST',
          sendHeaders: true,
          headerParameters: {
            parameters: [
              {
                name: 'Content-Type',
                value: 'application/json'
              }
            ]
          },
          sendBody: true,
          bodyParameters: {
            parameters: []
          },
          jsonParameters: JSON.stringify({
            filters: config.customerQuery,
            include: ['contacts', 'renewal_date', 'engagement_score', 'account_tier']
          })
        }
      },

      // Split customers into batches
      {
        id: 'split-customers',
        name: 'Split Into Batches',
        type: 'n8n-nodes-base.splitInBatches',
        position: [650, 300],
        parameters: {
          batchSize: 10,
          options: {}
        }
      },

      // Send renewal email
      {
        id: 'send-email',
        name: 'Send Renewal Email',
        type: 'n8n-nodes-base.emailSend',
        position: [850, 300],
        parameters: {
          fromEmail: 'noreply@yourcompany.com',
          toEmail: '={{ $json.primary_contact.email }}',
          subject: `Renewal Opportunity - {{ $json.company_name }}`,
          emailType: 'html',
          message: config.emailTemplates?.initial_outreach || this.getDefaultRenewalTemplate(config.settings.tone)
        }
      },

      // Log interaction back to platform
      {
        id: 'log-interaction',
        name: 'Log Customer Interaction',
        type: 'n8n-nodes-base.httpRequest',
        position: [1050, 300],
        parameters: {
          url: `${this.platformBaseUrl}/api/customers/{{ $json.id }}/agent-interaction`,
          method: 'POST',
          sendHeaders: true,
          headerParameters: {
            parameters: [
              {
                name: 'Content-Type',
                value: 'application/json'
              }
            ]
          },
          sendBody: true,
          jsonParameters: JSON.stringify({
            agentId: config.agentId,
            action: 'renewal_email_sent',
            result: 'sent',
            data: {
              emailType: 'initial_outreach',
              template: 'renewal_' + config.settings.tone
            }
          })
        }
      }
    ];

    return {
      name: config.name,
      active: false,
      nodes,
      connections: {
        'schedule-trigger': {
          main: [
            [{ node: 'get-customers', type: 'main', index: 0 }]
          ]
        },
        'get-customers': {
          main: [
            [{ node: 'split-customers', type: 'main', index: 0 }]
          ]
        },
        'split-customers': {
          main: [
            [{ node: 'send-email', type: 'main', index: 0 }]
          ]
        },
        'send-email': {
          main: [
            [{ node: 'log-interaction', type: 'main', index: 0 }]
          ]
        }
      },
      settings: {
        timezone: 'America/New_York',
        saveExecutionProgress: true,
        saveManualExecutions: true
      }
    };
  }

  /**
   * Generate competitive intelligence workflow
   */
  private generateCompetitiveWorkflow(config: AgentWorkflowConfig): N8nWorkflow {
    const nodes: N8nNode[] = [
      // Webhook trigger for competitor signals
      {
        id: 'webhook-trigger',
        name: 'Competitor Signal Webhook',
        type: 'n8n-nodes-base.webhook',
        position: [250, 300],
        parameters: {
          path: `competitor-signal-${config.agentId}`,
          httpMethod: 'POST',
          responseMode: 'responseNode'
        }
      },

      // Process competitor signal
      {
        id: 'process-signal',
        name: 'Process Competitor Signal',
        type: 'n8n-nodes-base.function',
        position: [450, 300],
        parameters: {
          functionCode: `
            const signal = items[0].json;
            
            // Determine severity and affected customers
            let severity = 'low';
            if (signal.type === 'pricing_change' && Math.abs(signal.change) > 0.15) {
              severity = 'high';
            } else if (signal.type === 'feature_launch') {
              severity = 'medium';
            }
            
            return items.map(item => ({
              json: {
                ...item.json,
                severity,
                requiresAction: severity === 'high'
              }
            }));
          `
        }
      },

      // Get affected customers
      {
        id: 'get-affected-customers',
        name: 'Get Affected Customers',
        type: 'n8n-nodes-base.httpRequest',
        position: [650, 300],
        parameters: {
          url: `${this.platformBaseUrl}/api/customers/affected-by-competitor`,
          method: 'POST',
          sendBody: true,
          jsonParameters: JSON.stringify({
            competitorId: '={{ $json.competitor_id }}',
            signalType: '={{ $json.type }}',
            filters: config.customerQuery
          })
        }
      },

      // Send competitive alert
      {
        id: 'send-alert',
        name: 'Send Competitive Alert',
        type: 'n8n-nodes-base.slack',
        position: [850, 300],
        parameters: {
          channel: '#competitive-intel',
          text: `🚨 Competitive Alert: {{ $json.competitor_name }} {{ $json.type }}. {{ $json.affected_customers_count }} customers potentially affected.`,
          otherOptions: {}
        }
      }
    ];

    return {
      name: config.name,
      active: false,
      nodes,
      connections: {
        'webhook-trigger': {
          main: [
            [{ node: 'process-signal', type: 'main', index: 0 }]
          ]
        },
        'process-signal': {
          main: [
            [{ node: 'get-affected-customers', type: 'main', index: 0 }]
          ]
        },
        'get-affected-customers': {
          main: [
            [{ node: 'send-alert', type: 'main', index: 0 }]
          ]
        }
      }
    };
  }

  /**
   * Generate health check workflow
   */
  private generateHealthWorkflow(config: AgentWorkflowConfig): N8nWorkflow {
    // Similar pattern to renewal workflow but focused on health metrics
    const nodes: N8nNode[] = [
      {
        id: 'schedule-trigger',
        name: 'Health Check Schedule',
        type: 'n8n-nodes-base.scheduleTrigger',
        position: [250, 300],
        parameters: {
          rule: {
            interval: [{
              field: 'cronExpression',
              expression: config.schedule
            }]
          }
        }
      },
      {
        id: 'get-unhealthy-customers',
        name: 'Get At-Risk Customers',
        type: 'n8n-nodes-base.httpRequest',
        position: [450, 300],
        parameters: {
          url: `${this.platformBaseUrl}/api/customers/health-check`,
          method: 'POST',
          jsonParameters: JSON.stringify({
            healthThreshold: 70,
            daysInactive: 30,
            filters: config.customerQuery
          })
        }
      }
      // ... more nodes for health workflow
    ];

    return {
      name: config.name,
      active: false,
      nodes,
      connections: {
        'schedule-trigger': {
          main: [
            [{ node: 'get-unhealthy-customers', type: 'main', index: 0 }]
          ]
        }
      }
    };
  }

  /**
   * Generate market trends workflow
   */
  private generateMarketTrendsWorkflow(config: AgentWorkflowConfig): N8nWorkflow {
    // Placeholder - similar pattern for market trends monitoring
    return {
      name: config.name,
      active: false,
      nodes: [],
      connections: {}
    };
  }

  /**
   * Activate a workflow in n8n
   */
  async activateWorkflow(workflowId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/workflows/${workflowId}/activate`, {
        method: 'POST',
        headers: {
          'X-N8N-API-KEY': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to activate workflow: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error activating workflow:', error);
      throw error;
    }
  }

  /**
   * Deactivate a workflow in n8n
   */
  async deactivateWorkflow(workflowId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/workflows/${workflowId}/deactivate`, {
        method: 'POST',
        headers: {
          'X-N8N-API-KEY': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to deactivate workflow: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deactivating workflow:', error);
      throw error;
    }
  }

  /**
   * Get workflow executions from n8n
   */
  async getWorkflowExecutions(workflowId: string, limit: number = 10): Promise<N8nExecution[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/executions?workflowId=${workflowId}&limit=${limit}`, {
        headers: {
          'X-N8N-API-KEY': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get executions: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error getting executions:', error);
      return [];
    }
  }

  /**
   * Get workflow status from n8n
   */
  async getWorkflowStatus(workflowId: string): Promise<{ active: boolean; lastExecution?: N8nExecution }> {
    try {
      const [workflowResponse, executionsResponse] = await Promise.all([
        fetch(`${this.baseUrl}/api/v1/workflows/${workflowId}`, {
          headers: { 'X-N8N-API-KEY': this.apiKey }
        }),
        this.getWorkflowExecutions(workflowId, 1)
      ]);

      if (!workflowResponse.ok) {
        throw new Error(`Failed to get workflow status: ${workflowResponse.statusText}`);
      }

      const workflow = await workflowResponse.json();
      const lastExecution = executionsResponse[0] || null;

      return {
        active: workflow.active,
        lastExecution
      };
    } catch (error) {
      console.error('Error getting workflow status:', error);
      return { active: false };
    }
  }

  /**
   * Delete a workflow from n8n
   */
  async deleteWorkflow(workflowId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/workflows/${workflowId}`, {
        method: 'DELETE',
        headers: {
          'X-N8N-API-KEY': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete workflow: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting workflow:', error);
      throw error;
    }
  }

  /**
   * Get default email template based on tone
   */
  private getDefaultRenewalTemplate(tone: string): string {
    const templates = {
      professional: `
        <p>Dear {{ $json.primary_contact.first_name }},</p>
        <p>I hope this message finds you well. I'm reaching out regarding your upcoming renewal for {{ $json.company_name }}.</p>
        <p>Your current subscription is scheduled to renew on {{ $json.renewal_date }}. I wanted to personally ensure you're getting maximum value from our platform.</p>
        <p>Would you be available for a brief 15-minute call this week to discuss your renewal and explore any additional features that might benefit your team?</p>
        <p>Best regards,<br>Your Customer Success Team</p>
      `,
      friendly: `
        <p>Hi {{ $json.primary_contact.first_name }}!</p>
        <p>Hope you're having a great week! I wanted to reach out about your {{ $json.company_name }} renewal coming up on {{ $json.renewal_date }}.</p>
        <p>We'd love to make sure you're getting the most out of our platform. Any questions or new features you'd like to explore?</p>
        <p>Let's chat soon!</p>
        <p>Cheers,<br>Your Success Team</p>
      `,
      casual: `
        <p>Hey {{ $json.primary_contact.first_name }},</p>
        <p>Just a heads up that your renewal is coming up on {{ $json.renewal_date }}. Want to make sure everything's going smoothly!</p>
        <p>Got 10 minutes to catch up this week?</p>
        <p>Thanks!<br>The Team</p>
      `
    };

    return templates[tone as keyof typeof templates] || templates.professional;
  }
}

export const n8nIntegration = new N8nIntegrationService();
export default N8nIntegrationService;