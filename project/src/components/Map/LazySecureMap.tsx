
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, MousePointer, Shield } from 'lucide-react';
import { detectHuman } from '../../utils/humanDetection';
import { secureMapLoader } from '../../utils/mapLoader';
import { sessionManager } from '../../utils/sessionManager';
import Map from './Map';

interface LazySecureMapProps {
  className?: string;
}

type LoadState = 'idle' | 'detecting' | 'loading' | 'loaded' | 'error' | 'blocked';

const LazySecureMap: React.FC<LazySecureMapProps> = ({ className = '' }) => {
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const initializationStarted = useRef(false);

  // Check session and initialize accordingly
  useEffect(() => {
    if (initializationStarted.current) return;
    initializationStarted.current = true;

    const initializeMap = async () => {
      // Check if user is already verified in this session
      if (sessionManager.isVerified()) {
        console.log('User already verified in session, skipping security check');
        
        // Check if maps are already loaded
        if (sessionManager.isMapsLoaded() && secureMapLoader.isGoogleMapsLoaded()) {
          console.log('Maps already loaded in session');
          setMapLoaded(true);
          setLoadState('loaded');
          setupIntersectionObserver();
          return;
        }
        
        // Maps not loaded yet, but user is verified, so load immediately
        setupIntersectionObserver();
        return;
      }

      // First time visit - run security check
      console.log('First visit - running security verification');
      await runSecurityCheck();
    };

    initializeMap();

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const runSecurityCheck = async () => {
    setLoadState('detecting');
    
    try {
      const isHuman = await detectHuman({
        minInteractionTime: 1500,
        requiredInteractions: 1
      });
      
      console.log('Human detection result:', isHuman);
      
      if (!isHuman) {
        setLoadState('blocked');
        setError('Automated access detected. Please interact with the page to load the map.');
        return;
      }
      
      // Store verification in session
      sessionManager.setVerified();
      console.log('User verified and stored in session');
      
      // Set up intersection observer for lazy loading
      setupIntersectionObserver();
      setLoadState('idle');
      
    } catch (error) {
      console.error('Human detection failed:', error);
      setLoadState('blocked');
      setError('Unable to verify human interaction. Please try refreshing the page.');
    }
  };

  const setupIntersectionObserver = () => {
    if (mapContainerRef.current && !observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (entry.isIntersecting && loadState !== 'loading' && loadState !== 'loaded') {
            loadGoogleMaps();
          }
        },
        {
          rootMargin: '300px',
          threshold: 0.1
        }
      );
      
      observerRef.current.observe(mapContainerRef.current);
    }
  };

  const loadGoogleMaps = useCallback(async () => {
    if (!sessionManager.isVerified() || loadState === 'loading' || loadState === 'loaded') {
      return;
    }

    // Check if already loaded in this session
    if (sessionManager.isMapsLoaded() && secureMapLoader.isGoogleMapsLoaded()) {
      console.log('Maps already loaded, skipping API call');
      setMapLoaded(true);
      setLoadState('loaded');
      return;
    }

    console.log('Loading Google Maps...');
    setLoadState('loading');
    setError(null);

    try {
      await secureMapLoader.loadGoogleMaps({
        onLoad: () => {
          console.log('Maps loaded successfully');
          sessionManager.setMapsLoaded();
          setMapLoaded(true);
          setLoadState('loaded');
        },
        onError: (error) => {
          console.error('Maps loading error:', error);
          setError(`Failed to load Google Maps: ${error.message}`);
          setLoadState('error');
        }
      });
    } catch (error) {
      console.error('Map loading failed:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setLoadState('error');
    }
  }, [loadState]);

  const handleManualLoad = () => {
    if (sessionManager.isVerified()) {
      loadGoogleMaps();
    } else {
      setError('Please interact with the page first (move mouse, scroll, or press a key)');
    }
  };

  const renderContent = () => {
    switch (loadState) {
      case 'detecting':
        return (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Shield className="w-12 h-12 text-blue-500 mb-4 animate-pulse" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Security Check
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Verifying human interaction to prevent automated access...
            </p>
            <div className="mt-4 flex items-center space-x-2 text-xs text-gray-400">
              <MousePointer className="w-4 h-4" />
              <span>Move mouse, scroll, or press a key</span>
            </div>
          </div>
        );

      case 'blocked':
        return (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 dark:bg-red-900/20">
            <Shield className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
              Access Restricted
            </h3>
            <p className="text-red-500 dark:text-red-400 text-sm mb-4">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              Refresh Page
            </button>
          </div>
        );

      case 'idle':
        return (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <MapPin className="w-12 h-12 text-primary-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Interactive Map
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              Scroll down to this section or click the button below to load the map
            </p>
            <button
              onClick={handleManualLoad}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Load Map
            </button>
          </div>
        );

      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Loading Map
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Securely loading Google Maps...
            </p>
          </div>
        );

      case 'error':
        return (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 dark:bg-red-900/20">
            <MapPin className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
              Map Loading Failed
            </h3>
            <p className="text-red-500 dark:text-red-400 text-sm mb-4">
              {error}
            </p>
            <button
              onClick={loadGoogleMaps}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </div>
        );

      case 'loaded':
        return mapLoaded ? <Map isLoaded={true} /> : null;

      default:
        return null;
    }
  };

  return (
    <div 
      ref={mapContainerRef}
      className={`w-full h-full min-h-[400px] rounded-lg shadow-lg overflow-hidden bg-white dark:bg-gray-800 ${className}`}
      aria-label="Interactive map container"
    >
      {renderContent()}
    </div>
  );
};

export default LazySecureMap;
