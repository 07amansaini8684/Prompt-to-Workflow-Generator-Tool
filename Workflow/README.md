# Prompt to Workflow Generator

A full-stack application that converts natural language prompts into Activepieces-compatible workflows using AI-powered parsing.

## 🚀 Features

- **AI-Powered Prompt Parsing**: Convert natural language descriptions into structured workflows
- **Activepieces Integration**: Generate JSON workflows compatible with Activepieces format
- **Custom Gmail Thread Node**: Extended Gmail functionality for complete thread operations
- **Visual Workflow Preview**: See your automation flow before deployment
- **Template Library**: Save and reuse successful workflow patterns
- **Real-time Generation**: Instant workflow creation with live preview

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Express.js + Node.js
- **Workflow Engine**: Activepieces-compatible JSON generation
- **AI Integration**: OpenAI GPT for prompt parsing
- **Database**: In-memory storage (easily extensible to PostgreSQL)

## 📦 Installation & Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/PromptWorkflow-Task.git
cd PromptWorkflow-Task
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. (Optional) Start the API server:
```bash
npm run server
```

## 🎯 Sample Prompt

Try this example prompt:
> "When a new email comes to my Gmail, categorize the email using ChatGPT, and if it's a customer query, forward it to my support email automatically."

## 📋 Activepieces Custom Node

The project includes a custom Gmail Thread reader node that extends the standard Gmail piece:

```typescript
// Custom Gmail: Get Thread action
{
  displayName: 'Get Thread',
  description: 'Get complete email thread by thread ID',
  props: {
    threadId: { type: 'short_text', required: true },
    format: { type: 'dropdown', defaultValue: 'full' }
  }
}
```

## 🔄 Workflow Generation Process

1. **Prompt Analysis**: NLP parsing extracts triggers, actions, and conditions
2. **Node Mapping**: Maps parsed elements to Activepieces node types
3. **JSON Generation**: Creates valid Activepieces workflow format
4. **Validation**: Ensures workflow structure and connections are valid
5. **Export**: Provides downloadable JSON for direct Activepieces import

## 📊 Supported Integrations

- **Gmail**: Email triggers and actions
- **OpenAI**: ChatGPT content processing
- **Slack**: Team notifications
- **Salesforce**: CRM automation
- **Webhook**: Custom HTTP triggers
- **Schedule**: Time-based automation

## 🎬 Demo Video

[Demo video showing the complete workflow generation and Activepieces integration]

## 👨‍💻 Author

Built by [Your Name] for the Activepieces Full Stack Developer Challenge.

---

This project demonstrates advanced full-stack development skills including React, Node.js, API design, AI integration, and complex JSON workflow generation for automation platforms.