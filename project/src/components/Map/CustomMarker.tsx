import React from 'react';
import { Marker } from '@react-google-maps/api';
import { LatLng } from '../../types';

interface CustomMarkerProps {
  position: LatLng;
}

const CustomMarker: React.FC<CustomMarkerProps> = ({ position }) => {
  return (
    <Marker
      position={position}
      // Remove onClick handler to prevent InfoWindow from showing
      clickable={false} // Disable click interaction on marker
    />
  );
};

export default CustomMarker;