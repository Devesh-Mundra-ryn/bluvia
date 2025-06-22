import React from 'react';
import { useMetalData } from '../../context/MetalDataContext';
import MetalCard from './MetalCard';
import { UserCircle as LoaderCircle, MapPin, AlertTriangle } from 'lucide-react';

const DataPanel: React.FC = () => {
  const { metalData, isLoading, error, selectedLocation } = useMetalData();

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
          Results are based on a predictive model using geological data from the Arizona Department of Environmental Quality. Concentrations are estimated and may vary from actual water conditions. For more accurate results, water testing is recommended.
        </p>
      </div>
    </div>
  );
};

export default DataPanel;