import React from 'react';
import { Header } from './components/Header';
import { WorkflowGenerator } from './components/WorkflowGenerator';
import { WorkflowHistory } from './components/WorkflowHistory';
import { FeatureCard } from './components/FeatureCard';
import { BackendTest } from './components/BackendTest';
import { useWorkflowStore } from './store/workflow';
import { useUserStore } from './store/user';
import { OnboardingDialog } from './components/OnboardingDialog';
import { Brain, Zap, Settings, Mail, MessageSquare, Database } from 'lucide-react';

function App() {
  const templates = useWorkflowStore(s => s.templates);
  const loadTemplates = useWorkflowStore(s => s.loadTemplates);
  const deleteTemplate = useWorkflowStore(s => s.deleteTemplate);

  const initUser = useUserStore(s => s.init);
  
  // Initialize user only once on mount
  React.useEffect(() => {
    console.log('[App] useEffect - initUser called');
    initUser();
  }, []); // Empty dependency array - only run once

  // Load templates only once on mount
  React.useEffect(() => {
    console.log('[App] useEffect - loadTemplates called');
    loadTemplates();
  }, []); // Empty dependency array - only run once

  console.log('[App] render - templates count:', templates.length);

  const handleDeleteTemplate = async (id: string) => {
    try {
      await deleteTemplate(id);
      console.log('[App] Template deleted successfully:', id);
    } catch (error) {
      console.error('[App] Failed to delete template:', error);
      // You could add a toast notification here
    }
  };

  const features = [
    { icon: Brain, title: 'AI-Powered Parsing', description: 'Advanced natural language processing to understand complex workflow requirements', isHighlighted: true },
    { icon: Zap, title: 'Instant Generation', description: 'Convert prompts to production-ready Activepieces workflows in seconds' },
    { icon: Settings, title: 'Custom Nodes', description: 'Extended Activepieces with custom Gmail Thread reader functionality' },
    { icon: Mail, title: 'Email Automation', description: 'Specialized support for Gmail integration and email workflow automation' },
    { icon: MessageSquare, title: 'ChatGPT Integration', description: 'Built-in OpenAI connections for intelligent content processing' },
    { icon: Database, title: 'Template Library', description: 'Save and reuse successful workflow patterns for future automation' }
  ];

  return (
    <div className="min-h-screen bg-black">
      <BackendTest />
      <OnboardingDialog />
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Transform Ideas into 
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Workflows</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Describe your automation needs in plain English and watch them become powerful Activepieces workflows instantly.
          </p>
        </div>

        <div className="grid gap-8 lg:gap-12">
          {/* Main Workflow Generator - Side by Side */}
          <section>
            <WorkflowGenerator />
          </section>

          {/* Previous Workflows */}
          <section>
            <WorkflowHistory 
              templates={templates}
              onSelectTemplate={(t) => useWorkflowStore.setState({ current: t.workflow })}
              onDeleteTemplate={handleDeleteTemplate}
            />
          </section>

          <section className="mt-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Powerful Features</h2>
              <p className="text-lg text-gray-300">Everything you need to automate complex business processes</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  isHighlighted={feature.isHighlighted}
                />
              ))}
            </div>
          </section>
        </div>

        <footer className="mt-20 pt-8 border-t border-gray-800 text-center">
          <div className="space-y-4">
            <p className="text-gray-400">
              Built for the Activepieces Full Stack Developer Challenge
            </p>
            <div className="flex justify-center gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-blue-400 transition-colors duration-200">Documentation</a>
              <a href="#" className="hover:text-blue-400 transition-colors duration-200">API Reference</a>
              <a href="#" className="hover:text-blue-400 transition-colors duration-200">Support</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;