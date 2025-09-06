import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.OPENROUTER_API_KEY || '';
const model = process.env.OPENROUTER_MODEL || 'openai/gpt-5';

export const openai = apiKey
  ? new OpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1', // OpenRouter endpoint
    })
  : null;

console.log('Using model:', model);
console.log('API key set?', !!apiKey);
console.log('OpenRouter client initialized:', !!openai);

// Enhanced system prompt with examples and detailed structure
const systemPrompt = `
You are an expert ActivePieces workflow generator. Given a natural language description of a workflow, generate a complete and valid ActivePieces workflow JSON.

CRITICAL RULES:
1. ALWAYS return valid JSON only - no markdown, no explanations, no comments
2. Use the exact structure provided in the examples
3. Choose appropriate pieces from this list: @activepieces/piece-gmail, @activepieces/piece-slack, @activepieces/piece-schedule, @activepieces/piece-openai, @activepieces/piece-zendesk, @activepieces/piece-webhooks, @activepieces/piece-http, @activepieces/piece-agent
4. For timestamps, use current milliseconds: ${Date.now()}
5. Set "valid": true for all components
6. Always include proper error handling with retryOnFailure: true for external services

WORKFLOW STRUCTURE TEMPLATE:
{
  "created": "${Date.now()}",
  "updated": "${Date.now()}",
  "name": "<Descriptive workflow name>",
  "description": "<Clear description of what the workflow does>",
  "tags": ["<relevant>", "<tags>"],
  "pieces": ["@activepieces/piece-<service1>", "@activepieces/piece-<service2>"],
  "template": {
    "displayName": "<Display Name>",
    "trigger": {
      "name": "trigger",
      "valid": true,
      "displayName": "<Trigger Description>",
      "type": "PIECE_TRIGGER",
      "settings": {
        "propertySettings": {
          // Trigger-specific properties
        },
        "pieceName": "@activepieces/piece-<service>",
        "pieceVersion": "~0.9.3",
        "input": {
          // Trigger input parameters
        },
        "sampleData": {},
        "triggerName": "<trigger_action_name>"
      },
      "nextAction": {
        // Chain of actions
      }
    },
    "valid": true,
    "agentIds": [],
    "connectionIds": [],
    "schemaVersion": "7"
  },
  "blogUrl": ""
}

COMMON TRIGGER TYPES:
- Gmail: "gmail_new_email_received"
- Schedule: "every_day", "every_hour", "cron_expression"  
- Webhooks: "catch_hook"
- Slack: "new_message"

COMMON ACTION TYPES:
- Gmail: "send_email"
- Slack: "send_channel_message"
- OpenAI: "ask_chatgpt"
- HTTP: "send_request"
- Code: Custom JavaScript code blocks

ACTION STRUCTURE:
{
  "name": "step_X",
  "type": "PIECE" | "CODE" | "BRANCH",
  "valid": true,
  "displayName": "<Action Description>",
  "settings": {
    "input": {
      // Action parameters
    },
    "pieceName": "@activepieces/piece-<service>",
    "actionName": "<action_name>",
    "pieceVersion": "~0.9.3",
    "propertySettings": {
      // Property configurations
    },
    "errorHandlingOptions": {
      "retryOnFailure": { "value": true },
      "continueOnFailure": { "value": false }
    }
  },
  "nextAction": {
    // Next action in chain
  }
}

CONDITIONAL BRANCH STRUCTURE:
{
  "name": "step_X",
  "type": "BRANCH",
  "valid": true,
  "displayName": "<Condition Description>",
  "settings": {
    "conditions": [
      [
        {
          "firstValue": "{{step_Y.output}}",
          "secondValue": "expected_value",
          "operator": "EQUAL"
        }
      ]
    ]
  },
  "nextAction": {
    // Action for true condition
  },
  "onFailureAction": {
    // Action for false condition
  }
}

CODE ACTION STRUCTURE:
{
  "name": "step_X",
  "type": "CODE",
  "valid": true,
  "displayName": "<Code Description>",
  "settings": {
    "input": {
      "inputData": "{{previous_step.output}}"
    },
    "sourceCode": {
      "code": "export const code = async (inputs) => { /* JavaScript code */ return result; };"
    },
    "errorHandlingOptions": {
      "retryOnFailure": { "value": false },
      "continueOnFailure": { "value": false }
    }
  },
  "nextAction": null
}

VARIABLE REFERENCING:
- Trigger data: {{trigger.property}}
- Previous step: {{step_1.output}}, {{step_2.result}}
- Arrays: {{step_1.output[0].property}}
- Functions: {{formatDate(trigger.date, 'YYYY-MM-DD')}}

Now generate a complete workflow JSON for the user's request. Remember: JSON ONLY, no explanations.
`;

export async function parseWithOpenAI(userPrompt: string): Promise<any | null> {
  if (!openai) {
    console.error('OpenRouter client not initialized - check API key');
    return null;
  }

  try {
    console.log('[OpenRouter] Making API call with prompt:', userPrompt);
    console.log('[OpenRouter] Using model:', model);
    
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1, // Low temperature for consistency
      max_tokens: 4000, // <= your OpenRouter quota
      response_format: { type: 'json_object' } // OpenRouter supports this
    });

    console.log('[OpenRouter] Full API response:', JSON.stringify(completion, null, 2));
    console.log('[OpenRouter] Response choices:', completion.choices);
    console.log('[OpenRouter] Usage info:', completion.usage);

    const content = completion.choices?.[0]?.message?.content;
    console.log('[OpenRouter] Raw content received:', content);
    
    if (!content) {
      console.error('No content received from OpenRouter');
      return null;
    }

    // Parse and validate the JSON
    console.log('[OpenRouter] Attempting to parse JSON...');
    const workflow = JSON.parse(content);
    console.log('[OpenRouter] Parsed workflow:', JSON.stringify(workflow, null, 2));
    
    // Basic validation
    if (!workflow.template || !workflow.template.trigger) {
      console.error('Invalid workflow structure - missing required components');
      console.log('[OpenRouter] Workflow structure:', {
        hasTemplate: !!workflow.template,
        hasTrigger: !!workflow.template?.trigger,
        templateKeys: workflow.template ? Object.keys(workflow.template) : 'no template'
      });
      return null;
    }

    console.log('[OpenRouter] Workflow validation passed!');
    return workflow;

  } catch (err: any) {
    console.error('OpenRouter parse error:', err);
    console.error('Error details:', {
      message: err?.message,
      status: err?.status,
      code: err?.code,
      type: err?.type
    });

    // If JSON parsing fails, try to extract JSON from response
    if (
      err instanceof SyntaxError &&
      typeof (err as any).response !== "undefined" &&
      (err as any).response?.data?.choices?.[0]?.message?.content
    ) {
      try {
        const content = (err as any).response.data.choices[0].message.content;
        console.log('[OpenRouter] Attempting secondary JSON extraction from:', content);
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          console.log('[OpenRouter] Found JSON match:', jsonMatch[0]);
          return JSON.parse(jsonMatch[0]);
        }
      } catch (secondaryErr) {
        console.error('Secondary JSON parse failed:', secondaryErr);
      }
    }
    
    return null;
  }
}

// Helper function to validate workflow structure
export function validateWorkflow(workflow: any): boolean {
  try {
    // Check required top-level fields
    const requiredFields = ['created', 'updated', 'name', 'description', 'template'];
    for (const field of requiredFields) {
      if (!workflow[field]) {
        console.error(`Missing required field: ${field}`);
        return false;
      }
    }

    // Check template structure
    const template = workflow.template;
    if (!template.trigger || !template.displayName || template.schemaVersion !== "7") {
      console.error('Invalid template structure');
      return false;
    }

    // Check trigger structure
    const trigger = template.trigger;
    if (!trigger.name || !trigger.type || !trigger.settings) {
      console.error('Invalid trigger structure');
      return false;
    }

    return true;
  } catch (err) {
    console.error('Workflow validation error:', err);
    return false;
  }
}

// Enhanced function with validation
export async function generateWorkflow(userPrompt: string): Promise<any | null> {
  const workflow = await parseWithOpenAI(userPrompt);
  
  if (!workflow) {
    return null;
  }

  if (!validateWorkflow(workflow)) {
    console.error('Generated workflow failed validation');
    return null;
  }

  return workflow;
}

// Example usage:
/*
const workflow = await generateWorkflow(
  "Every Monday at 10 AM, send an email to team@company.com with a reminder to submit weekly reports"
);
*/