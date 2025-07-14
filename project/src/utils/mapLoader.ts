
interface MapLoaderConfig {
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

class SecureMapLoader {
  private static instance: SecureMapLoader;
  private loadPromise: Promise<void> | null = null;

  static getInstance(): SecureMapLoader {
    if (!SecureMapLoader.instance) {
      SecureMapLoader.instance = new SecureMapLoader();
    }
    return SecureMapLoader.instance;
  }

  async loadGoogleMaps(config: MapLoaderConfig = {}): Promise<void> {
    // Return existing promise if already loading
    if (this.loadPromise) {
      console.log('Maps loading already in progress, returning existing promise');
      return this.loadPromise;
    }

    // Return immediately if already loaded
    if (this.isGoogleMapsLoaded()) {
      console.log('Google Maps already loaded, calling onLoad callback');
      config.onLoad?.();
      return Promise.resolve();
    }

    console.log('Starting new Google Maps load process');
    this.loadPromise = new Promise((resolve, reject) => {
      try {
        // Clean up any existing script or callback
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"], script[src*="maps-proxy"]');
        if (existingScript) {
          existingScript.remove();
        }

        if ((window as any).initGoogleMapSecure) {
          delete (window as any).initGoogleMapSecure;
        }

        // Create script element that uses our Edge Function proxy
        const script = document.createElement('script');
        
        const supabaseUrl = 'https://ttdcqbqekkcsezfymjif.supabase.co';
        const proxyUrl = `${supabaseUrl}/functions/v1/maps-proxy?endpoint=js&libraries=places&callback=initGoogleMapSecure`;
        
        console.log('Loading Google Maps via proxy:', proxyUrl);
        
        script.src = proxyUrl;
        script.async = true;
        script.defer = true;

        // Set up global callback
        (window as any).initGoogleMapSecure = () => {
          console.log('Google Maps loaded successfully via proxy');
          this.loadPromise = null; // Reset promise for future loads
          config.onLoad?.();
          resolve();
        };

        // Handle script errors
        script.onerror = (event) => {
          console.error('Script loading error:', event);
          const error = new Error('Failed to load Google Maps via proxy');
          this.loadPromise = null;
          config.onError?.(error);
          reject(error);
        };

        // Set timeout for loading
        const timeout = setTimeout(() => {
          if (!this.isGoogleMapsLoaded()) {
            const error = new Error('Google Maps loading timeout via proxy');
            console.error('Google Maps loading timeout');
            this.loadPromise = null;
            config.onError?.(error);
            reject(error);
          }
        }, 20000);

        // Clear timeout when loaded
        const originalCallback = (window as any).initGoogleMapSecure;
        (window as any).initGoogleMapSecure = () => {
          clearTimeout(timeout);
          originalCallback();
        };

        // Add script to document
        document.head.appendChild(script);
        
      } catch (error) {
        console.error('Error setting up Google Maps loader:', error);
        this.loadPromise = null;
        const loadError = error instanceof Error ? error : new Error('Unknown error loading Google Maps');
        config.onError?.(loadError);
        reject(loadError);
      }
    });

    return this.loadPromise;
  }

  isGoogleMapsLoaded(): boolean {
    return !!(window as any).google?.maps?.places;
  }

  // Method to reset the loader state if needed
  reset(): void {
    this.loadPromise = null;
  }
}

export const secureMapLoader = SecureMapLoader.getInstance();
