import React, { useState } from 'react';
import { Clock, Play, Trash2, Eye, ChevronDown, ChevronUp, Code, Download } from 'lucide-react';
import { WorkflowTemplate } from '../types/workflow';
import { useWorkflowStore } from '../store/workflow';
import { downloadWorkflow } from '../services/workflowService';

interface WorkflowHistoryProps {
  templates: WorkflowTemplate[];
  onSelectTemplate: (template: WorkflowTemplate) => void;
  onDeleteTemplate: (id: string) => void;
}

export const WorkflowHistory: React.FC<WorkflowHistoryProps> = ({ 
  templates, 
  onSelectTemplate, 
  onDeleteTemplate 
}) => {
  const { loadingTemplates } = useWorkflowStore();
  const [expandedWorkflows, setExpandedWorkflows] = useState<Set<string>>(new Set());
  const [showJSON, setShowJSON] = useState<Set<string>>(new Set());

  const toggleWorkflow = (workflowId: string) => {
    const newExpanded = new Set(expandedWorkflows);
    if (newExpanded.has(workflowId)) {
      newExpanded.delete(workflowId);
    } else {
      newExpanded.add(workflowId);
    }
    setExpandedWorkflows(newExpanded);
  };

  const toggleJSON = (workflowId: string) => {
    const newShowJSON = new Set(showJSON);
    if (newShowJSON.has(workflowId)) {
      newShowJSON.delete(workflowId);
    } else {
      newShowJSON.add(workflowId);
    }
    setShowJSON(newShowJSON);
  };

  const handleDownload = (template: WorkflowTemplate) => {
    const workflow = template.workflow as any;
    const displayName = workflow.template?.displayName || workflow.displayName || template.name;
    downloadWorkflow(workflow, displayName);
  };

  const getWorkflowDetails = (template: WorkflowTemplate) => {
    const workflow = template.workflow as any;
    
    // Handle new template structure
    if (workflow.template) {
      const trigger = workflow.template.trigger;
      const actions = [];
      let currentAction = trigger.nextAction;
      while (currentAction) {
        actions.push(currentAction);
        currentAction = currentAction.nextAction;
      }
      
      return {
        displayName: workflow.template.displayName || workflow.name,
        description: workflow.description || '',
        trigger: {
          name: trigger.displayName || trigger.name,
          type: trigger.settings?.pieceName || trigger.type
        },
                 actions: actions.map((action: any) => ({
           name: action.displayName || action.name,
           type: action.settings?.pieceName || action.type
         }))
      };
    }
    
    // Handle old structure
    return {
      displayName: workflow.displayName || template.name,
      description: template.description,
      trigger: {
        name: workflow.trigger?.name || 'Unknown Trigger',
        type: workflow.trigger?.type || 'Unknown'
      },
      actions: (workflow.actions || []).map((action: any) => ({
        name: action.name || 'Unknown Action',
        type: action.type || 'Unknown'
      }))
    };
  };

  if (loadingTemplates) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-black rounded-2xl shadow-xl p-8 border border-neutral-800">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-300">Loading your workflows...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-black rounded-2xl shadow-xl border border-neutral-800 overflow-hidden">
        <div className="p-6 bg-neutral-950 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Workflow History</h2>
              <p className="text-gray-400">Your previously generated and saved workflows</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {templates.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-neutral-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Workflows Yet</h3>
              <p className="text-gray-400">Generate your first workflow to see it here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {templates.map((template) => {
                const details = getWorkflowDetails(template);
                
                return (
                  <div
                    key={template.id}
                    className="bg-neutral-950 rounded-lg border border-neutral-800 overflow-hidden"
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-1">
                            {details.displayName}
                          </h3>
                          <p className="text-sm text-gray-400 mb-3">
                            {details.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>
                              Created: {new Date(template.createdAt).toLocaleDateString()}
                            </span>
                            <span>
                              {details.actions.length} actions
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => toggleWorkflow(template.id)}
                            className="p-2 rounded-lg bg-neutral-800 text-gray-300 hover:bg-neutral-700 transition-colors duration-200"
                            title="Toggle details"
                          >
                            {expandedWorkflows.has(template.id) ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => toggleJSON(template.id)}
                            className="p-2 rounded-lg bg-neutral-800 text-gray-300 hover:bg-neutral-700 transition-colors duration-200"
                            title="Show JSON"
                          >
                            <Code className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(template)}
                            className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
                            title="Download workflow"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onSelectTemplate(template)}
                            className="p-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors duration-200"
                            title="Try Activepieces"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteTemplate(template.id)}
                            className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors duration-200"
                            title="Delete workflow"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {expandedWorkflows.has(template.id) && (
                      <div className="border-t border-neutral-800 p-4 bg-neutral-900">
                        {showJSON.has(template.id) ? (
                          <div className="bg-gray-900 rounded-lg p-3 overflow-auto max-h-64">
                            <pre className="text-xs text-green-400 font-mono">
                              {JSON.stringify(template.workflow, null, 2)}
                            </pre>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="text-sm font-medium text-gray-300 mb-3">Workflow Details:</div>
                            <div className="space-y-2">
                              <div className="flex items-center">
                                <div className="flex-1">
                                  <div className="bg-neutral-950 rounded-lg p-3 border border-neutral-800">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                        1
                                      </div>
                                      <div>
                                        <h4 className="text-sm font-semibold text-white">{details.trigger.name}</h4>
                                        <p className="text-xs text-gray-400">{details.trigger.type}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                                                             {details.actions.map((action: any, index: number) => (
                                 <div key={index} className="flex items-center">
                                  <div className="flex-1">
                                    <div className="bg-neutral-950 rounded-lg p-3 border border-neutral-800">
                                      <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                          {index + 2}
                                        </div>
                                        <div>
                                          <h4 className="text-sm font-semibold text-white">{action.name}</h4>
                                          <p className="text-xs text-gray-400">{action.type}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};