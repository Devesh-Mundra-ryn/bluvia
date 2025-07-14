
import { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { ARIZONA_BOUNDS, ARIZONA_CENTER, DEFAULT_ZOOM } from '../components/Map/mapConfig';
import { mapStyles } from '../components/Map/mapStyles';

export const useMapOptions = () => {
  const { isDark } = useTheme();

  const mapOptions = useMemo((): google.maps.MapOptions => ({
    center: ARIZONA_CENTER,
    zoom: DEFAULT_ZOOM,
    minZoom: 6,
    maxZoom: 18,
    restriction: {
      latLngBounds: ARIZONA_BOUNDS,
      strictBounds: false
    },
    disableDefaultUI: true,
    zoomControl: true,
    gestureHandling: "greedy",
    disableDoubleClickZoom: true,
    styles: isDark ? mapStyles.dark : mapStyles.default,
    clickableIcons: false,
  }), [isDark]);

  return mapOptions;
};
