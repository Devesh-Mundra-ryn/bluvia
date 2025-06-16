import React, { useState } from 'react';
import { Metal } from '../../types';
import { AlertTriangle, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface MetalCardProps {
  metal: Metal;
}

const MetalCard: React.FC<MetalCardProps> = ({ metal }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getColorClasses = (level: string) => {
    switch (level) {
      case 'low':
        return {
          border: 'border-success-500',
          bg: 'bg-success-50 dark:bg-success-900/20',
          text: 'text-success-700 dark:text-success-300'
        };
      case 'moderate':
        return {
          border: 'border-warning-500',
          bg: 'bg-warning-50 dark:bg-warning-900/20',
          text: 'text-warning-700 dark:text-warning-300'
        };
      case 'high':
        return {
          border: 'border-danger-500',
          bg: 'bg-danger-50 dark:bg-danger-900/20',
          text: 'text-danger-700 dark:text-danger-300'
        };
      default:
        return {
          border: 'border-gray-300',
          bg: 'bg-white dark:bg-black',
          text: 'text-gray-700 dark:text-gray-300'
        };
    }
  };

  const colors = getColorClasses(metal.level);

  const LevelIcon = () => {
    switch (metal.level) {
      case 'low':
        return <CheckCircle size={20} className="text-success-500 dark:text-success-400" />;
      case 'moderate':
        return <AlertCircle size={20} className="text-warning-500 dark:text-warning-400" />;
      case 'high':
        return <AlertTriangle size={20} className="text-danger-500 dark:text-danger-400" />;
      default:
        return null;
    }
  };

  const getMetalInfo = (symbol: string) => {
    const info = {
      Fe: {
        range: '100-50,000 ppm',
        high: 'May indicate industrial pollution or natural iron-rich deposits.',
      },
      Cr: {
        range: '1-1,000 ppm',
        high: 'Could suggest industrial contamination, particularly from metal processing.',
      },
      Mn: {
        range: '20-3,000 ppm',
        high: 'Might affect plant growth and indicate industrial activity.',
      },
      Mo: {
        range: '0.1-40 ppm',
        high: 'Could impact livestock if consumed in large quantities.',
      },
      In: {
        range: '0.05-0.5 ppm',
        high: 'Rare in nature, high levels may indicate electronic waste contamination.',
      },
      Ta: {
        range: '0.5-2.5 ppm',
        high: 'Uncommon in soil, elevated levels might suggest mining activity.',
      }
    }[symbol] || { range: 'N/A', high: 'No information available.' };

    return info;
  };

  const metalInfo = getMetalInfo(metal.name);

  return (
    <div 
      className={`metal-card ${colors.bg} border-l-4 ${colors.border} cursor-pointer transition-all duration-200 dark:shadow-gray-900`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200">{metal.name}</h4>
            {metal.error && (
              <span className="text-xs text-gray-500 dark:text-gray-400">±{metal.error}%</span>
            )}
          </div>
          <div className="mt-1 flex items-center">
            <span className="metal-value dark:text-gray-200">{metal.concentration}</span>
            <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">{metal.unit}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LevelIcon />
          <span className={`text-sm font-medium capitalize ${colors.text}`}>
            {metal.level}
          </span>
          {isExpanded ? <ChevronUp size={20} className="dark:text-gray-400" /> : <ChevronDown size={20} className="dark:text-gray-400" />}
        </div>
      </div>
      
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-2">
            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Normal Range</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">{metalInfo.range}</p>
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">High Level Impact</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">{metalInfo.high}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetalCard;