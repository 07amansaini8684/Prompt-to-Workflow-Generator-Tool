import React, { useState, useRef, useEffect } from 'react';
import { Download, Upload, Eye, Code, MoreVertical, Play, Trash2 } from 'lucide-react';
import { ActivepiecesWorkflow } from '../types/workflow';
import { downloadWorkflow } from '../services/workflowService';

interface RecentlyGeneratedWorkflowsProps {
  workflows: ActivepiecesWorkflow[];
  onSave?: (workflow: ActivepiecesWorkflow) => void;
  onSelect?: (workflow: ActivepiecesWorkflow) => void;
}

export const RecentlyGeneratedWorkflows: React.FC<RecentlyGeneratedWorkflowsProps> = ({ 
  workflows, 
  onSave, 
  onSelect 
}) => {
  const [showJSON, setShowJSON] = useState<Set<string>>(new Set());
  const [showMenu, setShowMenu] = useState<Set<string>>(new Set());
  const [savingWorkflow, setSavingWorkflow] = useState<string | null>(null);
  const menuRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      let clickedInside = false;
      
      menuRefs.current.forEach((ref) => {
        if (ref && ref.contains(target)) {
          clickedInside = true;
        }
      });

      if (!clickedInside) {
        setShowMenu(new Set());
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleJSON = (workflowId: string) => {
    const newShowJSON = new Set(showJSON);
    if (newShowJSON.has(workflowId)) {
      newShowJSON.delete(workflowId);
    } else {
      newShowJSON.add(workflowId);
    }
    setShowJSON(newShowJSON);
    setShowMenu(new Set());
  };

  const toggleMenu = (workflowId: string) => {
    const newShowMenu = new Set(showMenu);
    if (newShowMenu.has(workflowId)) {
      newShowMenu.delete(workflowId);
    } else {
      newShowMenu.add(workflowId);
    }
    setShowMenu(newShowMenu);
  };

  const handleDownload = (workflow: any) => {
    downloadWorkflow(workflow, workflow.template?.displayName || workflow.displayName || 'workflow');
    setShowMenu(new Set());
  };

  const handleSave = async (workflow: any) => {
    if (onSave) {
      setSavingWorkflow(workflow.template?.displayName || workflow.displayName || 'workflow');
      try {
        await onSave(workflow);
        // Success feedback is handled by the parent component
      } catch (error) {
        console.error('Failed to save workflow:', error);
        // You could add a toast notification here
      } finally {
        setSavingWorkflow(null);
      }
    }
    setShowMenu(new Set());
  };

  const handleSelect = (workflow: any) => {
    if (onSelect) {
      onSelect(workflow);
    }
    setShowMenu(new Set());
  };

  // Guard against undefined workflows
  if (!workflows || workflows.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
          <Play className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Recently Generated</h2>
          <p className="text-gray-400">Your latest workflow generations</p>
        </div>
      </div>

      {workflows.map((workflow, index) => {
        // Handle both old and new workflow structures
        const displayName = workflow.template?.displayName || workflow.displayName || 'Untitled Workflow';
        const triggerType = workflow.template?.trigger?.settings?.pieceName || workflow.trigger?.type || 'Unknown';
        const actionsCount = workflow.template?.trigger?.nextAction ? 'Has actions' : (workflow.actions?.length || 0);
        
        return (
          <div key={`${displayName}-${index}`} className="bg-black rounded-2xl shadow-xl border border-neutral-800 overflow-hidden">
            <div className="p-4 bg-neutral-950 border-b border-neutral-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{displayName}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {typeof actionsCount === 'number' ? `${actionsCount} nodes` : actionsCount} • Recently Generated
                  </p>
                </div>
                <div className="relative" ref={(el) => {
                  if (el) menuRefs.current.set(`${displayName}-${index}`, el);
                }}>
                  <button
                    onClick={() => toggleMenu(`${displayName}-${index}`)}
                    className="p-2 rounded-lg hover:bg-neutral-800 transition-colors duration-200"
                    disabled={savingWorkflow === displayName}
                  >
                    <MoreVertical className="w-5 h-5 text-gray-300" />
                  </button>
                  
                  {showMenu.has(`${displayName}-${index}`) && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-neutral-900 border border-neutral-700 rounded-lg shadow-lg z-10">
                      <div className="py-1">
                        <button
                          onClick={() => handleSelect(workflow)}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-neutral-800 transition-colors duration-200"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                        <button
                          onClick={() => toggleJSON(`${displayName}-${index}`)}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-neutral-800 transition-colors duration-200"
                        >
                          <Code className="w-4 h-4" />
                          {showJSON.has(`${displayName}-${index}`) ? 'Hide' : 'Show'} JSON
                        </button>
                        <button
                          onClick={() => handleDownload(workflow)}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-neutral-800 transition-colors duration-200"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                        <button
                          onClick={() => handleSave(workflow)}
                          disabled={savingWorkflow === displayName}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-green-400 hover:bg-neutral-800 transition-colors duration-200 disabled:opacity-50"
                        >
                          <Upload className="w-4 h-4" />
                          {savingWorkflow === displayName ? 'Saving...' : 'Save Template'}
                        </button>
                        <button
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-blue-400 hover:bg-neutral-800 transition-colors duration-200"
                        >
                          <Play className="w-4 h-4" />
                          Try Activepieces
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 flex-1">
              {showJSON.has(`${displayName}-${index}`) ? (
                <div className="bg-gray-900 rounded-lg p-3 overflow-auto max-h-64">
                  <pre className="text-xs text-green-400 font-mono">
                    {JSON.stringify(workflow, null, 2)}
                  </pre>
                </div>
              ) : (
                <WorkflowDiagram workflow={workflow} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const WorkflowDiagram: React.FC<{ workflow: any }> = ({ workflow }) => {
  // Handle both old and new workflow structures
  let allNodes: any[] = [];
  
  if (workflow.template) {
    // New structure with template
    const trigger = workflow.template.trigger;
    allNodes = [trigger];
    
    // Add actions from nextAction chain
    let currentAction = trigger.nextAction;
    while (currentAction) {
      allNodes.push(currentAction);
      currentAction = currentAction.nextAction;
    }
  } else {
    // Old structure with trigger and actions array
    allNodes = [workflow.trigger, ...(workflow.actions || [])];
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-gray-300 mb-3">Workflow Flow:</div>
      <div className="space-y-2">
        {allNodes.map((node, index) => (
          <div key={node.name || node.id || index} className="flex items-center">
            <div className="flex-1">
              <div className="bg-neutral-950 rounded-lg p-3 border border-neutral-800">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{node.displayName || node.name}</h4>
                    <p className="text-xs text-gray-400">
                      {node.settings?.pieceName || node.type || 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {index < allNodes.length - 1 && (
              <div className="flex items-center justify-center w-6">
                <div className="w-px h-6 bg-neutral-800"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}; 