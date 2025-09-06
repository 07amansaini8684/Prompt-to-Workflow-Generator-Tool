import React from 'react';
import { Github, Video } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/src/assets/images/logo.jpeg" alt="Logo" className="w-32 h-32 rounded-lg object-cover" />
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href="https://github.com/yourusername/prompt-workflow-task"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200"
            >
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">Repository</span>
            </a>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">Demo Video</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};