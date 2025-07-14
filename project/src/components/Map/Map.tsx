
import React from 'react';
import { GoogleMap } from '@react-google-maps/api';
import { useMetalData } from '../../context/MetalDataContext';
import { useMapSetup } from '../../hooks/useMapSetup';
import { useMapOptions } from '../../hooks/useMapOptions';
import { useMapInteraction } from '../../hooks/useMapInteraction';
import CustomMarker from './CustomMarker';

interface MapProps {
  isLoaded: boolean;
}

const Map: React.FC<MapProps> = () => {
  const { selectedLocation } = useMetalData();
  const { onLoad, onBoundsChanged } = useMapSetup();
  const mapOptions = useMapOptions();
  const { handleMapClick } = useMapInteraction();

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
