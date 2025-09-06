import React, { useState, useEffect, useRef } from 'react';
import { Download, Upload, Eye, Code, MoreVertical } from 'lucide-react';
import { ActivepiecesWorkflow } from '../types/workflow';
import { downloadWorkflow } from '../services/workflowService';

interface WorkflowPreviewProps {
  workflow: ActivepiecesWorkflow | null;
  onSave?: (workflow: ActivepiecesWorkflow) => void;
}

export const WorkflowPreview: React.FC<WorkflowPreviewProps> = ({ workflow, onSave }) => {
  const [showJSON, setShowJSON] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  if (!workflow) {
    return null;
  }

  const handleDownload = () => {
    downloadWorkflow(workflow, workflow.displayName);
    setShowMenu(false);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(workflow);
    }
    setShowMenu(false);
  };

  const toggleJSON = () => {
    setShowJSON(!showJSON);
    setShowMenu(false);
  };

  return (
    <div className="w-full">
      <div className="bg-black rounded-2xl shadow-xl border border-neutral-800 overflow-hidden h-full">
        <div className="p-4 bg-neutral-950 border-b border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">{workflow.displayName}</h3>
              <p className="text-sm text-gray-400 mt-1">
                {workflow.actions.length + 1} nodes • Ready for Activepieces
              </p>
            </div>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-lg hover:bg-neutral-800 transition-colors duration-200"
              >
                <MoreVertical className="w-5 h-5 text-gray-300" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-neutral-900 border border-neutral-700 rounded-lg shadow-lg z-10">
                  <div className="py-1">
                    <button
                      onClick={toggleJSON}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-neutral-800 transition-colors duration-200"
                    >
                      <Code className="w-4 h-4" />
                      {showJSON ? 'Hide' : 'Show'} JSON
                    </button>
                    <button
                      onClick={handleDownload}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-neutral-800 transition-colors duration-200"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={handleSave}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-green-400 hover:bg-neutral-800 transition-colors duration-200"
                    >
                      <Upload className="w-4 h-4" />
                      Save Template
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 flex-1">
          {showJSON ? (
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
    </div>
  );
};

const WorkflowDiagram: React.FC<{ workflow: ActivepiecesWorkflow }> = ({ workflow }) => {
  const allNodes = [workflow.trigger, ...workflow.actions];

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-gray-300 mb-3">Workflow Flow:</div>
      <div className="space-y-2">
        {allNodes.map((node, index) => (
          <div key={node.id} className="flex items-center">
            <div className="flex-1">
              <div className="bg-neutral-950 rounded-lg p-3 border border-neutral-800">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{node.name}</h4>
                    <p className="text-xs text-gray-400">{node.type}</p>
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