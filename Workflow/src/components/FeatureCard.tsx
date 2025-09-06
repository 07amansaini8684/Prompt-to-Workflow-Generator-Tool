import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  isHighlighted?: boolean;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  isHighlighted = false 
}) => {
  return (
    <div className={`p-6 rounded-xl border transition-all duration-200 hover:shadow-md ${
      isHighlighted 
        ? 'bg-neutral-900 border-blue-900' 
        : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
    }`}>
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
        isHighlighted
          ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
          : 'bg-neutral-800'
      }`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
    </div>
  );
};