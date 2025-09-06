import { ParsedPrompt, ActivepiecesWorkflow } from '../types/workflow';

export class PromptParser {
  private static generateNodeId(): string {
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public static async parsePrompt(prompt: string): Promise<ParsedPrompt> {
    const lowerPrompt = prompt.toLowerCase();
    
    let trigger = { type: 'unknown', source: 'unknown' };
    const actions: any[] = [];

    // Improved trigger detection
    if (lowerPrompt.includes('gmail') && lowerPrompt.includes('email')) {
      trigger = { type: 'gmail', source: 'new_email' };
    } else if (lowerPrompt.includes('webhook')) {
      trigger = { type: 'webhook', source: 'incoming_request' };
    } else if (lowerPrompt.includes('schedule') || lowerPrompt.includes('daily') || lowerPrompt.includes('weekly') || 
               lowerPrompt.includes('every day') || lowerPrompt.includes('every hour') || lowerPrompt.includes('9 am') ||
               lowerPrompt.includes('morning') || lowerPrompt.includes('daily') || lowerPrompt.includes('weekly')) {
      trigger = { type: 'schedule', source: 'timer' };
    }

    // Improved action detection
    if (lowerPrompt.includes('categorize') && lowerPrompt.includes('chatgpt')) {
      actions.push({
        type: 'openai',
        description: 'Categorize email content using ChatGPT',
        target: 'classification'
      });
    }

    if (lowerPrompt.includes('forward') && lowerPrompt.includes('support')) {
      actions.push({
        type: 'gmail',
        description: 'Forward email to support',
        target: 'support@company.com'
      });
    }

    if (lowerPrompt.includes('slack') && lowerPrompt.includes('message')) {
      actions.push({
        type: 'slack',
        description: 'Send notification to Slack',
        target: 'slack_channel'
      });
    }

    if (lowerPrompt.includes('salesforce') || lowerPrompt.includes('crm')) {
      actions.push({
        type: 'salesforce',
        description: 'Create record in Salesforce',
        target: 'lead_object'
      });
    }

    // New action detections
    if (lowerPrompt.includes('support ticket') || lowerPrompt.includes('ticket')) {
      actions.push({
        type: 'zendesk',
        description: 'Check support tickets',
        target: 'high_priority_tickets'
      });
    }

    if (lowerPrompt.includes('summary') && lowerPrompt.includes('email')) {
      actions.push({
        type: 'gmail',
        description: 'Send summary email',
        target: 'management@company.com'
      });
    }

    if (lowerPrompt.includes('check') && lowerPrompt.includes('ticket')) {
      actions.push({
        type: 'zendesk',
        description: 'Check for high-priority tickets',
        target: 'ticket_monitoring'
      });
    }

    if (lowerPrompt.includes('send') && lowerPrompt.includes('email')) {
      actions.push({
        type: 'gmail',
        description: 'Send email notification',
        target: 'email_notification'
      });
    }

    if (lowerPrompt.includes('management') && lowerPrompt.includes('team')) {
      actions.push({
        type: 'gmail',
        description: 'Send to management team',
        target: 'management@company.com'
      });
    }

    return {
      intent: this.extractIntent(prompt),
      trigger,
      actions
    };
  }

  public static generateWorkflowJSON(parsedPrompt: ParsedPrompt): ActivepiecesWorkflow {
    const workflowId = this.generateNodeId();
    
    const trigger = {
      id: this.generateNodeId(),
      type: this.mapTriggerType(parsedPrompt.trigger.type),
      name: `${parsedPrompt.trigger.source} Trigger`,
      settings: this.generateTriggerSettings(parsedPrompt.trigger)
    };

    const actions = parsedPrompt.actions.map((action, index) => ({
      id: this.generateNodeId(),
      type: this.mapActionType(action.type),
      name: action.description,
      settings: this.generateActionSettings(action),
      position: { x: 100, y: 150 + (index * 120) }
    }));

    const connections = [] as Array<{ sourceId: string; targetId: string }>;
    let previousId = trigger.id;
    
    for (const action of actions) {
      connections.push({
        sourceId: previousId,
        targetId: action.id
      });
      previousId = action.id;
    }

    return {
      displayName: `Generated Workflow - ${parsedPrompt.intent}`,
      trigger,
      actions,
      connections
    };
  }

  private static extractIntent(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('email') && lowerPrompt.includes('categorize')) {
      return 'Email Categorization & Routing';
    } else if (lowerPrompt.includes('lead') && lowerPrompt.includes('salesforce')) {
      return 'Lead Management Automation';
    } else if (lowerPrompt.includes('support') && lowerPrompt.includes('ticket')) {
      return 'Support Ticket Automation';
    } else if (lowerPrompt.includes('daily') || lowerPrompt.includes('schedule')) {
      return 'Scheduled Task Automation';
    } else if (lowerPrompt.includes('summary') && lowerPrompt.includes('email')) {
      return 'Email Summary Automation';
    }
    
    return 'Custom Workflow Automation';
  }

  private static mapTriggerType(type: string): string {
    const triggerMap: Record<string, string> = {
      'gmail': '@activepieces/piece-gmail',
      'webhook': '@activepieces/piece-webhook',
      'schedule': '@activepieces/piece-schedule'
    };
    return triggerMap[type] || '@activepieces/piece-webhook';
  }

  private static mapActionType(type: string): string {
    const actionMap: Record<string, string> = {
      'openai': '@activepieces/piece-openai',
      'gmail': '@activepieces/piece-gmail',
      'slack': '@activepieces/piece-slack',
      'salesforce': '@activepieces/piece-salesforce',
      'zendesk': '@activepieces/piece-zendesk'
    };
    return actionMap[type] || '@activepieces/piece-code';
  }

  private static generateTriggerSettings(trigger: any): Record<string, any> {
    switch (trigger.type) {
      case 'gmail':
        return {
          connectionId: '{{connections.gmail}}',
          query: 'is:unread'
        };
      case 'webhook':
        return {
          endpoint: '/webhook/trigger'
        };
      case 'schedule':
        return {
          cronExpression: '0 9 * * *'
        };
      default:
        return {};
    }
  }

  private static generateActionSettings(action: any): Record<string, any> {
    switch (action.type) {
      case 'openai':
        return {
          connectionId: '{{connections.openai}}',
          model: 'gpt-3.5-turbo',
          prompt: 'Categorize this email and determine if it\'s a customer query: {{trigger.body.content}}',
          maxTokens: 500
        };
      case 'gmail':
        return {
          connectionId: '{{connections.gmail}}',
          to: action.target || 'support@company.com',
          subject: 'Forwarded: {{trigger.body.subject}}',
          body: '{{trigger.body.content}}'
        };
      case 'slack':
        return {
          connectionId: '{{connections.slack}}',
          channel: action.target || '#general',
          message: 'New email received: {{trigger.body.subject}}'
        };
      case 'salesforce':
        return {
          connectionId: '{{connections.salesforce}}',
          object: 'Lead',
          fields: {
            Email: '{{trigger.body.from}}',
            Company: '{{openai.response.company}}',
            Status: 'New'
          }
        };
      case 'zendesk':
        return {
          connectionId: '{{connections.zendesk}}',
          action: action.target === 'high_priority_tickets' ? 'search_tickets' : 'get_tickets',
          query: 'priority:high status:open',
          fields: ['id', 'subject', 'priority', 'status']
        };
      default:
        return {};
    }
  }
} 