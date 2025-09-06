export interface WorkflowNode {
  id: string;
  type: string;
  name: string;
  settings: Record<string, any>;
  position?: { x: number; y: number };
}

export interface WorkflowTrigger {
  id: string;
  type: string;
  name: string;
  settings: Record<string, any>;
}

export interface WorkflowConnection {
  sourceId: string;
  targetId: string;
}

export interface ActivepiecesWorkflow {
  displayName: string;
  trigger: WorkflowTrigger;
  actions: WorkflowNode[];
  connections: WorkflowConnection[];
}

export interface ParsedPrompt {
  intent: string;
  trigger: {
    type: string;
    source: string;
    conditions?: string[];
  };
  actions: Array<{
    type: string;
    description: string;
    target?: string;
    conditions?: string[];
  }>;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
  workflow: ActivepiecesWorkflow;
  createdAt: Date;
}