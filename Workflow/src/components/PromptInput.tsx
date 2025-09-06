import React, { useState } from 'react';
import { Send, Wand2, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { useWorkflowStore } from '../store/workflow';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

export const PromptInput: React.FC<PromptInputProps> = ({ onSubmit, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [activeExample, setActiveExample] = useState<number | null>(null);
  const clearError = useWorkflowStore(s => s.clearError);

  const examplePrompts = [
    "When a new email comes to my Gmail, categorize the email using ChatGPT, and if it's a customer query, forward it to my support email automatically.",
    "When someone submits a contact form on my website, create a lead in Salesforce and send a notification to our sales Slack channel.",
    "Every day at 9 AM, check for high-priority support tickets and send a summary to the management team via email."
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt);
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newPrompt = e.target.value;
    setPrompt(newPrompt);
    // Clear error when user starts typing
    if (newPrompt.trim()) {
      clearError();
    }
  };

  const useExample = (example: string, index: number) => {
    setPrompt(example);
    setActiveExample(index);
    clearError(); // Clear error when using example
    setTimeout(() => setActiveExample(null), 1000);
  };

  return (
    <div className="w-full">
      <div className="bg-black rounded-2xl shadow-xl p-6 border border-neutral-800 h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <Wand2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Workflow Generator</h2>
            <p className="text-sm text-gray-400">Describe your automation</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
              Describe your workflow automation
            </label>
            <div className="relative">
              <textarea
                id="prompt"
                value={prompt}
                onChange={handlePromptChange}
                placeholder="Example: When a new email comes to my Gmail, categorize it using ChatGPT..."
                className="w-full min-h-24 px-3 py-2 border border-neutral-700 bg-neutral-950 text-white placeholder:text-neutral-500 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none transition-all duration-200"
                disabled={isLoading}
              />
              <div className="absolute bottom-2 right-2 flex gap-2">
                <span className="text-xs text-neutral-500">
                  {prompt.length}/1000
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={!prompt.trim() || isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Generate
            </button>

            <button
              type="button"
              onClick={() => {
                setPrompt('');
                clearError();
              }}
              className="px-3 py-2 text-gray-300 hover:text-white transition-colors duration-200"
            >
              Clear
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-neutral-800">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Try these examples:</h3>
          <div className="space-y-2">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                onClick={() => useExample(example, index)}
                className={clsx(
                  "text-left p-3 rounded-lg border transition-all duration-200 text-xs",
                  activeExample === index 
                    ? "border-blue-800 bg-neutral-900" 
                    : "border-neutral-800 bg-neutral-950 hover:border-neutral-700"
                )}
              >
                <p className="text-gray-300">{example}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};