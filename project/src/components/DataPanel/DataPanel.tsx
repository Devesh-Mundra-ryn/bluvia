import React, { useState } from 'react';
import { useMetalData } from '../../context/MetalDataContext';
import MetalCard from './MetalCard';
import { UserCircle as LoaderCircle, MapPin, AlertTriangle, Database, Brain, ChevronDown, ChevronUp, Droplets } from 'lucide-react';

const DataPanel: React.FC = () => {
  const { metalData, isLoading, error, selectedLocation } = useMetalData();
  const [stormWaterEnabled, setStormWaterEnabled] = useState(false);
  const [showStormWaterDetails, setShowStormWaterDetails] = useState(false);

  const getRiskLevel = (averageScore: number) => {
    if (averageScore <= 51) return { level: 'Low Risk', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/20' };
    if (averageScore <= 80) return { level: 'Moderate Risk', color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-100 dark:bg-yellow-900/20' };
    return { level: 'High Risk', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/20' };
  };

  if (error) {
    return (
      <div className="p-6 text-center dark:bg-gray-900">
        <AlertTriangle size={48} className="mx-auto text-danger-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Error Loading Data</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <button 
          className="button-primary dark:bg-primary-600 dark:hover:bg-primary-700"
          onClick={() => {
            if (selectedLocation) {
              window.location.reload();
            }
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 h-full flex flex-col items-center justify-center dark:bg-gray-900">
        <LoaderCircle size={48} className="animate-spin text-primary-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Analyzing Water Composition</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Processing data for the selected location...
        </p>
      </div>
    );
  }

  if (!metalData) {
    return null;
  }

  const riskInfo = metalData.riskScores ? getRiskLevel(metalData.riskScores.Average) : null;

  return (
    <div className="p-6 fade-in dark:bg-gray-900">
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <MapPin size={18} className="text-primary-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Selected Location
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Latitude: {metalData.location.lat.toFixed(4)}°, 
          Longitude: {metalData.location.lng.toFixed(4)}°
        </p>
        <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
          Analysis completed: {new Date(metalData.timestamp).toLocaleString()}
        </p>
      </div>

      {/* Data Source Indicator */}
      <div className="mb-4">
        <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
          {metalData.dataSource === 'baseline' ? (
            <>
              <Database size={16} className="text-primary-500 dark:text-primary-400" />
              <span className="text-sm font-medium text-primary-600 dark:text-primary-300">Baseline Data</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">(Known site within 3 miles)</span>
            </>
          ) : (
            <>
              <Brain size={16} className="text-primary-500 dark:text-primary-400" />
              <span className="text-sm font-medium text-primary-600 dark:text-primary-300">AI-Predicted</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">(Machine learning prediction)</span>
            </>
          )}
        </div>
      </div>

      {/* Risk Level Display */}
      {riskInfo && (
        <div className="mb-4">
          <div className={`flex items-center gap-2 p-3 rounded-lg ${riskInfo.bgColor}`}>
            <AlertTriangle size={16} className={riskInfo.color} />
            <span className={`text-sm font-semibold ${riskInfo.color}`}>
              {riskInfo.level}
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              (Risk Score: {metalData.riskScores?.Average.toFixed(1)}/100)
            </span>
          </div>
        </div>
      )}

      {/* Storm Water Section */}
      <div className="mb-6">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Droplets size={18} className="text-primary-500 dark:text-primary-400" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Storm Water
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {stormWaterEnabled ? 'Enabled' : 'Disabled'}
              </span>
              <button
                onClick={() => setStormWaterEnabled(!stormWaterEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  stormWaterEnabled ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    stormWaterEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
          
          <button
            onClick={() => setShowStormWaterDetails(!showStormWaterDetails)}
            className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            <span>More information</span>
            {showStormWaterDetails ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>
          
          {showStormWaterDetails && (
            <div className="mt-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 fade-in">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Storm water runoff can significantly affect metal concentrations in groundwater sources. When enabled, this feature adjusts predictions based on:
              </p>
              <ul className="text-xs text-gray-500 dark:text-gray-500 space-y-1 ml-4">
                <li>• Seasonal precipitation patterns</li>
                <li>• Surface water infiltration rates</li>
                <li>• Urban runoff contamination</li>
                <li>• Industrial discharge pathways</li>
              </ul>
              {stormWaterEnabled && (
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border-l-4 border-blue-400">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Storm water adjustments are now applied to the metal concentration predictions shown below.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Predicted Metal Concentrations */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
          Predicted Metal Concentrations
        </h3>
        
        {metalData.metals.map((metal, index) => (
          <div key={metal.name} className="slide-in" style={{ animationDelay: `${index * 100}ms` }}>
            <MetalCard metal={metal} />
          </div>
        ))}
      </div>
      
      <div className="mt-8 border-t dark:border-gray-800 pt-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">About This Data</h4>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Results are based on {metalData.dataSource === 'baseline' ? 'validated baseline measurements from known monitoring sites' : 'a predictive model using geological data from the Arizona Department of Environmental Quality'}. Concentrations are estimated and may vary from actual water conditions. For more accurate results, water testing is recommended.
        </p>
      </div>
    </div>
  );
};

export default DataPanel;
