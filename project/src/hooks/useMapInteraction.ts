
import { useCallback } from 'react';
import { useMetalData } from '../context/MetalDataContext';
import { isWithinArizona } from '../components/Map/mapConfig';

export const useMapInteraction = () => {
  const { setSelectedLocation } = useMetalData();

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      
      if (isWithinArizona(lat, lng)) {
        setSelectedLocation({ lat, lng });
      }
    }
  }, [setSelectedLocation]);

  return { handleMapClick };
};
