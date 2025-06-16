import React, { useCallback, useRef } from 'react';
import { GoogleMap } from '@react-google-maps/api';
import { useMetalData } from '../../context/MetalDataContext';
import { useTheme } from '../../context/ThemeContext';
import CustomMarker from './CustomMarker';

const ARIZONA_BOUNDS = {
  north: 37.5043,
  south: 30.8322,
  east: -108.5452,
  west: -115.3126
};

const STRICT_ARIZONA_BOUNDS = {
  north: 37.0043,
  south: 31.3322,
  east: -109.0452,
  west: -114.8126
};

const ARIZONA_CENTER = {
  lat: 34.1683,
  lng: -111.9311
};

const DEFAULT_ZOOM = 7;

const mapStyles = {
  default: [],
  dark: [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }]
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }]
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#263c3f" }]
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6b9a76" }]
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }]
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }]
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b3" }]
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#746855" }]
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1f2835" }]
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#f3d19c" }]
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#2f3948" }]
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }]
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }]
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#515c6d" }]
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#17263c" }]
    }
  ]
};

interface MapProps {
  isLoaded: boolean;
}

const Map: React.FC<MapProps> = ({ isLoaded }) => {
  const { selectedLocation, setSelectedLocation } = useMetalData();
  const { isDark } = useTheme();
  const mapRef = useRef<google.maps.Map | null>(null);

  const isWithinArizona = (lat: number, lng: number): boolean => {
    return lat >= STRICT_ARIZONA_BOUNDS.south && 
           lat <= STRICT_ARIZONA_BOUNDS.north &&
           lng >= STRICT_ARIZONA_BOUNDS.west && 
           lng <= STRICT_ARIZONA_BOUNDS.east;
  };

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      
      if (isWithinArizona(lat, lng)) {
        setSelectedLocation({ lat, lng });
      }
    }
  }, [setSelectedLocation]);

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

  const mapOptions: google.maps.MapOptions = {
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
  };

  return (
    <div className="h-full w-full">
      <GoogleMap
        mapContainerClassName="h-full w-full rounded-lg shadow-md overflow-hidden"
        options={mapOptions}
        onClick={handleMapClick}
        onLoad={onLoad}
        onBoundsChanged={onBoundsChanged}
      >
        {selectedLocation && (
          <CustomMarker position={selectedLocation} />
        )}
      </GoogleMap>
    </div>
  );
};

export default Map;