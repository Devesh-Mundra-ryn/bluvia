
import React, { useState } from 'react';
import Header from './Header';
import LazySecureMap from '../Map/LazySecureMap';
import DataPanel from '../DataPanel/DataPanel';
import SearchBar from '../Search/SearchBar';
import InfoTab from '../Tabs/InfoTab';
import ContactTab from '../Tabs/ContactTab';
import UploadTab from '../Tabs/UploadTab';
import { MapPin } from 'lucide-react';
import { useMetalData } from '../../context/MetalDataContext';
import { useNavigation } from '../../context/NavigationContext';
import { secureMapLoader } from '../../utils/mapLoader';

const AppLayout: React.FC = () => {
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const { metalData, isLoading } = useMetalData();
  const { activeTab } = useNavigation();

  React.useEffect(() => {
    if (metalData && window.innerWidth < 768) {
      setIsMobileExpanded(true);
    }
  }, [metalData]);

  // Check if maps are loaded
  React.useEffect(() => {
    const checkMapStatus = () => {
      setIsMapLoaded(secureMapLoader.isGoogleMapsLoaded());
    };

    // Check initially
    checkMapStatus();

    // Set up interval to check map loading status
    const interval = setInterval(checkMapStatus, 500);

    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'upload':
        return <UploadTab />;
      case 'info':
        return <InfoTab />;
      case 'contact':
        return <ContactTab />;
      default:
        return (
          <div className="relative h-[calc(100vh-4rem)] flex flex-col md:flex-row">
            <div className={`relative flex-1 transition-all duration-300 ${
              isMobileExpanded ? 'h-[30%] md:h-auto' : 'h-[70%] md:h-auto'
            }`}>
              {isMapLoaded && (
                <div className="absolute top-4 left-0 right-0 z-[1000] px-4 max-w-md mx-auto">
                  <SearchBar isLoaded={isMapLoaded} />
                </div>
              )}
              <div className="h-full">
                <LazySecureMap />
              </div>
            </div>
            
            <div className={`
              md:w-[400px] bg-white dark:bg-gray-900 md:h-full overflow-y-auto shadow-lg transition-all duration-300
              ${isMobileExpanded ? 'h-[70%]' : 'h-[30%]'}
            `}>
              <div 
                className="md:hidden h-6 border-t-2 border-gray-200 dark:border-gray-800 flex items-center justify-center cursor-pointer"
                onClick={() => setIsMobileExpanded(!isMobileExpanded)}
              >
                <div className="w-16 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
              </div>
              
              {!metalData && !isLoading ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <MapPin size={48} className="text-primary-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Select a Region</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Click anywhere in Arizona to analyze water concentrations in that area.
                  </p>
                </div>
              ) : (
                <DataPanel />
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1 overflow-hidden pt-16">
        {renderContent()}
      </main>
    </div>
  );
};

export default AppLayout;
