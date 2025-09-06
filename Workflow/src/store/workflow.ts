import { create } from 'zustand';
import { ActivepiecesWorkflow, WorkflowTemplate } from '../types/workflow';
import { generateWorkflow as apiGenerateWorkflow, getWorkflows as apiGetWorkflows, saveWorkflow as apiSaveWorkflow, deleteWorkflow as apiDeleteWorkflow } from '../services/workflowService';

interface WorkflowState {
  prompt: string;
  setPrompt: (v: string) => void;

  current: ActivepiecesWorkflow | null;
  generating: boolean;
  error: string | null;
  generateFromPrompt: (prompt?: string) => Promise<void>;
  clearError: () => void;

  // Recently generated workflows
  recentlyGenerated: ActivepiecesWorkflow[];
  addToRecentlyGenerated: (workflow: ActivepiecesWorkflow) => void;
  clearRecentlyGenerated: () => void;

  templates: WorkflowTemplate[];
  loadingTemplates: boolean;
  templatesInitialized: boolean; // Add flag to track if templates have been loaded
  loadTemplates: () => Promise<void>;
  saveTemplate: (template: Omit<WorkflowTemplate, 'id' | 'createdAt'>) => Promise<WorkflowTemplate>;
  deleteTemplateLocal: (id: string) => void;
  deleteTemplate: (id: string) => Promise<void>;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  prompt: '',
  setPrompt: (v) => set({ prompt: v, error: null }), // Clear error when prompt changes

  current: null,
  generating: false,
  error: null,
  generateFromPrompt: async (p) => {
    const prompt = p ?? get().prompt;
    if (!prompt.trim()) return;
    console.log('[store] generateFromPrompt - starting with prompt:', prompt);
    set({ generating: true, error: null });
    try {
      const userId = localStorage.getItem('userId') || undefined;
      console.log('[store] generateFromPrompt - userId from localStorage:', userId);
      const response = await apiGenerateWorkflow(prompt, userId);
      console.log('[store] generateFromPrompt - API response received:', response);
      
      // Handle both old and new response structures
      const workflow = (response as any).workflow || response;
      set({ current: workflow });
      // Add to recently generated
      get().addToRecentlyGenerated(workflow);
    } catch (e: any) {
      console.error('[store] generateFromPrompt - error occurred:', e);
      set({ error: e?.message || 'Failed to generate workflow' });
    } finally {
      set({ generating: false });
    }
  },
  clearError: () => set({ error: null }),

  // Recently generated workflows
  recentlyGenerated: [],
  addToRecentlyGenerated: (workflow) => {
    const current = get().recentlyGenerated;
    console.log('[store] addToRecentlyGenerated - current array:', current);
    console.log('[store] addToRecentlyGenerated - adding workflow:', workflow);
    // Add to beginning of array (most recent first)
    const newArray = [workflow, ...current];
    console.log('[store] addToRecentlyGenerated - new array:', newArray);
    set({ recentlyGenerated: newArray });
  },
  clearRecentlyGenerated: () => {
    console.log('[store] clearRecentlyGenerated - clearing array');
    set({ recentlyGenerated: [] });
  },

  templates: [],
  loadingTemplates: false,
  templatesInitialized: false,
  loadTemplates: async () => {
    console.log('[workflow store] loadTemplates - starting template loading, initialized:', get().templatesInitialized);
    
    // If already initialized, don't load again
    if (get().templatesInitialized) {
      console.log('[workflow store] loadTemplates - already initialized, skipping');
      return;
    }
    
    // If already loading, don't start another request
    if (get().loadingTemplates) {
      console.log('[workflow store] loadTemplates - already loading, skipping');
      return;
    }
    
    // If templates are already loaded, don't fetch again
    const currentTemplates = get().templates;
    console.log('[workflow store] loadTemplates - current templates count:', currentTemplates.length);
    
    if (currentTemplates.length > 0) {
      console.log('[workflow store] loadTemplates - templates already loaded, marking as initialized');
      set({ templatesInitialized: true });
      return;
    }
    
    console.log('[workflow store] loadTemplates - fetching templates from API...');
    set({ loadingTemplates: true, error: null });
    try {
      const userId = localStorage.getItem('userId') || undefined;
      console.log('[workflow store] loadTemplates - userId from localStorage:', userId);
      const templates = await apiGetWorkflows(userId);
      console.log('[workflow store] loadTemplates - API response received:', templates.length, 'templates');
      set({ templates, templatesInitialized: true });
    } catch (e: any) {
      console.error('[workflow store] loadTemplates - error occurred:', e);
      set({ error: e?.message || 'Failed to load workflows', templatesInitialized: true });
    } finally {
      console.log('[workflow store] loadTemplates - setting loadingTemplates to false');
      set({ loadingTemplates: false });
    }
  },

  saveTemplate: async (template) => {
    const userId = localStorage.getItem('userId');
    console.log('[store] saveTemplate - userId from localStorage:', userId);
    if (!userId) throw new Error('No userId found');
    const saved = await apiSaveWorkflow({ ...template, userId });
    set({ templates: [saved, ...get().templates] });
    return saved;
  },

  deleteTemplateLocal: (id) => {
    set({ templates: get().templates.filter(t => t.id !== id) });
  },
  deleteTemplate: async (id) => {
    try {
      await apiDeleteWorkflow(id);
      // Remove from local state after successful deletion
      get().deleteTemplateLocal(id);
    } catch (error) {
      console.error('Failed to delete template:', error);
      throw error;
    }
  },
})); 