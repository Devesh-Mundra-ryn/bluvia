
import { useCallback, useRef } from 'react';
import { ARIZONA_BOUNDS, ARIZONA_CENTER } from '../components/Map/mapConfig';

export const useMapSetup = () => {
  const mapRef = useRef<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    
    const style = document.createElement('style');
    style.textContent = `
      .gmnoprint a, .gmnoprint span, .gm-style-cc {
        display: none;
      }
      .gmnoprint div {
        background: none !important;
      }
      .gm-style-iw-a, .gm-style-iw-t {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }, []);

  const onBoundsChanged = useCallback(() => {
    if (!mapRef.current) return;

    const center = mapRef.current.getCenter();
    if (!center) return;

    const lat = center.lat();
    const lng = center.lng();

    if (lat < ARIZONA_BOUNDS.south || lat > ARIZONA_BOUNDS.north ||
        lng < ARIZONA_BOUNDS.west || lng > ARIZONA_BOUNDS.east) {
      mapRef.current.panTo(ARIZONA_CENTER);
    }
  }, []);

  return { onLoad, onBoundsChanged };
};
