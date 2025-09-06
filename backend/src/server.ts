import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PromptParser } from './services/promptParser';
import { WorkflowTemplate } from './types/workflow';
import { parseWithOpenAI } from './lib/openai';
import { PrismaClient, Prisma } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

// Users (simple onboarding without auth)
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const { email } = req.query as { email?: string };
    if (!email) return res.status(400).json({ error: 'email is required' });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Error fetching user by email:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { email, username, password, bio, role } = req.body as { email: string; username: string; password: string; bio?: string; role: string };
    if (!email || !username || !password || !role) {
      return res.status(400).json({ error: 'email, username, password, role are required' });
    }
    const created = await prisma.user.create({
      data: { email, username, password, bio, role }
    });
    res.json(created);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.post('/api/generate-workflow', async (req, res) => {
  try {
    const { prompt, userId } = req.body as { prompt?: string; userId?: string };
    console.log('[generate-workflow] incoming:', { userId, prompt });
    
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Log before calling any LLM
    console.log('[generate-workflow] before LLM parse:', { userId, promptLength: prompt.length });

    // Static workflow data instead of calling OpenRouter API
    console.log('[generate-workflow] Using static data instead of OpenRouter API');
    
    const staticWorkflow = {
      "created": "1757004182049",
      "updated": "1757004182049",
      "name": "Untitled",
      "description": "",
      "tags": [],
      "pieces": [
        "@activepieces/piece-gmail",
        "@activepieces/piece-agent",
        "@activepieces/piece-slack"
      ],
      "template": {
        "displayName": "Untitled",
        "trigger": {
          "name": "trigger",
          "valid": false,
          "displayName": "New Email",
          "type": "PIECE_TRIGGER",
          "settings": {
            "propertySettings": {
              "to": {
                "type": "MANUAL"
              },
              "auth": {
                "type": "MANUAL"
              },
              "from": {
                "type": "MANUAL"
              },
              "label": {
                "type": "MANUAL"
              },
              "subject": {
                "type": "MANUAL"
              },
              "category": {
                "type": "MANUAL"
              }
            },
            "pieceName": "@activepieces/piece-gmail",
            "pieceVersion": "~0.9.3",
            "input": {},
            "sampleData": {},
            "triggerName": "gmail_new_email_received"
          },
          "nextAction": {
            "name": "step_1",
            "type": "PIECE",
            "valid": false,
            "settings": {
              "input": {
                "agentId": "MRbFhiNIfvhlNLJFOakOr"
              },
              "pieceName": "@activepieces/piece-agent",
              "actionName": "run_agent",
              "sampleData": {},
              "pieceVersion": "~0.2.7",
              "propertySettings": {
                "prompt": {
                  "type": "MANUAL"
                },
                "agentId": {
                  "type": "MANUAL"
                }
              },
              "errorHandlingOptions": {
                "retryOnFailure": {
                  "value": false
                },
                "continueOnFailure": {
                  "value": false
                }
              }
            },
            "nextAction": {
              "name": "step_2",
              "skip": false,
              "type": "PIECE",
              "valid": false,
              "settings": {
                "input": {
                  "replyBroadcast": false
                },
                "pieceName": "@activepieces/piece-slack",
                "actionName": "send_channel_message",
                "sampleData": {},
                "pieceVersion": "~0.10.9",
                "propertySettings": {
                  "auth": {
                    "type": "MANUAL"
                  },
                  "file": {
                    "type": "MANUAL"
                  },
                  "info": {
                    "type": "MANUAL"
                  },
                  "text": {
                    "type": "MANUAL"
                  },
                  "blocks": {
                    "type": "MANUAL"
                  },
                  "channel": {
                    "type": "MANUAL"
                  },
                  "threadTs": {
                    "type": "MANUAL"
                  },
                  "username": {
                    "type": "MANUAL"
                  },
                  "profilePicture": {
                    "type": "MANUAL"
                  },
                  "replyBroadcast": {
                    "type": "MANUAL"
                  }
                },
                "errorHandlingOptions": {
                  "retryOnFailure": {
                    "value": false
                  },
                  "continueOnFailure": {
                    "value": false
                  }
                }
              },
              "displayName": "Send Message To A Channel"
            },
            "displayName": "Prompt Enhancer"
          }
        },
        "valid": false,
        "agentIds": [
          "MRbFhiNIfvhlNLJFOakOr"
        ],
        "connectionIds": [],
        "schemaVersion": "7"
      },
      "blogUrl": ""
    }
    

    console.log('[generate-workflow] Static workflow structure:', {
      hasTemplate: !!staticWorkflow.template,
      hasTrigger: !!staticWorkflow.template?.trigger,
      actionsCount: staticWorkflow.template?.trigger?.nextAction ? 'Has actions' : 'No actions'
    });

    console.log('[generate-workflow] final workflow:', {
      displayName: staticWorkflow.template.displayName,
      triggerType: staticWorkflow.template.trigger.settings.pieceName,
      actionsCount: staticWorkflow.template.trigger.nextAction ? 'Has actions' : 'No actions',
      source: 'Static Data'
    });

    // Store the workflow in database if userId is provided
    if (userId) {
      try {
        const savedWorkflow = await prisma.workflowTemplate.create({
          data: {
            name: staticWorkflow.name,
            description: staticWorkflow.description,
            prompt: prompt,
            workflow: (staticWorkflow as unknown) as Prisma.InputJsonValue,
            userId: userId
          }
        });
        console.log('[generate-workflow] Workflow saved to database:', { id: savedWorkflow.id, userId: savedWorkflow.userId });
      } catch (dbError) {
        console.error('[generate-workflow] Failed to save workflow to database:', dbError);
        // Continue even if database save fails
      }
    }
    
    res.json({ 
      workflow: staticWorkflow,
      parsed: staticWorkflow 
    });
  } catch (error) {
    console.error('Error generating workflow:', error);
    res.status(500).json({ error: 'Failed to generate workflow' });
  }
});

app.get('/api/workflows', async (req, res) => {
  try {
    const { userId } = req.query as { userId?: string };
    const items = await prisma.workflowTemplate.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: 'desc' }
    });
    res.json(items);
  } catch (error) {
    console.error('Error fetching workflows:', error);
    res.status(500).json({ error: 'Failed to fetch workflows' });
  }
});

app.post('/api/workflows', async (req, res) => {
  try {
    const { name, description, prompt, workflow, userId } = req.body as WorkflowTemplate & { userId: string };
    console.log('[save-workflow] incoming:', { userId, name, description, promptExists: !!prompt, hasWorkflow: !!workflow });
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const created = await prisma.workflowTemplate.create({
      data: {
        name,
        description,
        prompt,
        workflow: (workflow as unknown) as Prisma.InputJsonValue,
        userId
      }
    });
    console.log('[save-workflow] created:', { id: created.id, userId: created.userId });

    res.json(created);
  } catch (error) {
    console.error('Error saving workflow:', error);
    res.status(500).json({ error: 'Failed to save workflow' });
  }
});

app.delete('/api/workflows/:id', async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    await prisma.workflowTemplate.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting workflow:', error);
    res.status(500).json({ error: 'Failed to delete workflow' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Prompt-to-Workflow API running on port ${PORT}`);
});

export default app; 