import React, { useState } from 'react';
import { PromptInput } from './PromptInput';
import { RecentlyGeneratedWorkflows } from './RecentlyGeneratedWorkflows';
import { useWorkflowStore } from '../store/workflow';
import { Loader2, CheckCircle } from 'lucide-react';

export const WorkflowGenerator: React.FC = () => {
  const recentlyGenerated = useWorkflowStore(s => s.recentlyGenerated);
  const generating = useWorkflowStore(s => s.generating);
  const error = useWorkflowStore(s => s.error);
  const setPrompt = useWorkflowStore(s => s.setPrompt);
  const generateFromPrompt = useWorkflowStore(s => s.generateFromPrompt);
  const saveTemplate = useWorkflowStore(s => s.saveTemplate);
  
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Console log to track recentlyGenerated array
  console.log('[WorkflowGenerator] render - recentlyGenerated:', recentlyGenerated);
  console.log('[WorkflowGenerator] render - recentlyGenerated length:', recentlyGenerated.length);

  const handlePromptSubmit = async (prompt: string) => {
    console.log('[WorkflowGenerator] handlePromptSubmit - called with prompt:', prompt);
    setPrompt(prompt);
    await generateFromPrompt(prompt);
  };

  const handleSaveWorkflow = async (workflow: any) => {
    try {
      await saveTemplate({
        name: workflow.displayName,
        description: workflow.displayName,
        prompt: workflow.displayName,
        workflow: workflow
      });
      setSuccessMessage('Workflow saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save workflow:', error);
      // Error will be handled by the store
    }
  };

  const handleSelectWorkflow = (workflow: any) => {
    // This could be used to show more details or edit the workflow
    console.log('Selected workflow:', workflow);
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-900/20 border border-green-800 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <p className="text-green-300 text-sm">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-900/20 border border-red-800 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {generating && (
        <div className="mb-4 p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            <p className="text-blue-300 text-sm">Generating workflow with AI...</p>
          </div>
        </div>
      )}

      <div className={`grid gap-6 ${recentlyGenerated.length > 0 ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>
        {/* Left side - Prompt Input */}
        <div className={`${recentlyGenerated.length > 0 ? 'lg:col-span-1' : 'lg:col-span-1'}`}>
          <PromptInput onSubmit={handlePromptSubmit} isLoading={generating} />
        </div>
        
        {/* Right side - Recently Generated Workflows */}
        {recentlyGenerated.length > 0 && (
          <div className="lg:col-span-1">
            <RecentlyGeneratedWorkflows 
              workflows={recentlyGenerated}
              onSave={handleSaveWorkflow}
              onSelect={handleSelectWorkflow}
            />
          </div>
        )}
      </div>
    </div>
  );
}; 