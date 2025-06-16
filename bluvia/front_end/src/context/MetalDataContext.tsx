import React, { createContext, useState, useContext, ReactNode } from 'react';
import { fetchMetalData } from '../services/api';
import { MetalData, LatLng } from '../types';

interface MetalDataContextType {
  selectedLocation: LatLng | null;
  setSelectedLocation: (location: LatLng | null) => void;
  metalData: MetalData | null;
  isLoading: boolean;
  error: string | null;
}

const MetalDataContext = createContext<MetalDataContextType | undefined>(undefined);

export const useMetalData = () => {
  const context = useContext(MetalDataContext);
  if (context === undefined) {
    throw new Error('useMetalData must be used within a MetalDataProvider');
  }
  return context;
};

export const MetalDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedLocation, setSelectedLocation] = useState<LatLng | null>(null);
  const [metalData, setMetalData] = useState<MetalData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (selectedLocation) {
      setIsLoading(true);
      setError(null);
      
      fetchMetalData(selectedLocation)
        .then(data => {
          setMetalData(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Error fetching metal data:', err);
          setError('Failed to fetch data. Please try again.');
          setIsLoading(false);
        });
    } else {
      setMetalData(null);
    }
  }, [selectedLocation]);

  return (
    <MetalDataContext.Provider
      value={{
        selectedLocation,
        setSelectedLocation,
        metalData,
        isLoading,
        error
      }}
    >
      {children}
    </MetalDataContext.Provider>
  );
};