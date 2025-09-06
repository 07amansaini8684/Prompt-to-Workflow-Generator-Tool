// Activepieces node definitions and custom Gmail Thread node
export const ACTIVEPIECES_NODES = {
  triggers: {
    gmail_new_email: {
      type: '@activepieces/piece-gmail',
      name: 'Gmail - New Email',
      description: 'Triggers when a new email is received'
    },
    webhook: {
      type: '@activepieces/piece-webhook',
      name: 'Webhook',
      description: 'Triggers when HTTP request is received'
    },
    schedule: {
      type: '@activepieces/piece-schedule',
      name: 'Schedule',
      description: 'Triggers on a schedule'
    }
  },
  actions: {
    openai_chat: {
      type: '@activepieces/piece-openai',
      name: 'ChatGPT',
      description: 'Send message to ChatGPT'
    },
    gmail_send: {
      type: '@activepieces/piece-gmail',
      name: 'Gmail - Send Email',
      description: 'Send an email via Gmail'
    },
    gmail_get_thread: {
      type: '@activepieces/piece-gmail',
      name: 'Gmail - Get Thread',
      description: 'Get complete email thread details'
    },
    slack_send_message: {
      type: '@activepieces/piece-slack',
      name: 'Slack - Send Message',
      description: 'Send message to Slack channel'
    },
    salesforce_create_record: {
      type: '@activepieces/piece-salesforce',
      name: 'Salesforce - Create Record',
      description: 'Create a record in Salesforce'
    },
    conditional: {
      type: '@activepieces/piece-code',
      name: 'Conditional Logic',
      description: 'Execute conditional logic'
    }
  }
};

// Custom Gmail Thread Node Implementation
export const CUSTOM_GMAIL_THREAD_NODE = {
  displayName: 'Get Gmail Thread',
  description: 'Retrieves complete email thread including all messages and metadata',
  auth: 'gmail_oauth2',
  minimumSupportedRelease: '0.20.0',
  logoUrl: 'https://cdn.activepieces.com/pieces/gmail.png',
  actions: {
    get_thread: {
      displayName: 'Get Thread',
      description: 'Get complete email thread by thread ID',
      props: {
        connection: {
          displayName: 'Connection',
          required: true,
          type: 'connection'
        },
        threadId: {
          displayName: 'Thread ID',
          required: true,
          type: 'short_text',
          description: 'The ID of the email thread to retrieve'
        },
        format: {
          displayName: 'Format',
          required: false,
          type: 'dropdown',
          defaultValue: 'full',
          options: {
            full: 'Full (includes attachments)',
            metadata: 'Metadata only',
            minimal: 'Minimal (subject and snippet only)'
          }
        }
      },
      async run(context) {
        const { connection, threadId, format } = context.propsValue;
        
        // Implementation would use Gmail API
        return {
          threadId,
          messages: [],
          historyId: '',
          snippet: 'Email thread content...'
        };
      }
    }
  }
};