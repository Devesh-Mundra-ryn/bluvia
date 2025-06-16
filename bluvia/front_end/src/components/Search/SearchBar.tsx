import React, { useState, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useMetalData } from '../../context/MetalDataContext';
import { useTheme } from '../../context/ThemeContext';
import { Autocomplete } from '@react-google-maps/api';

const ARIZONA_BOUNDS = {
  north: 37.0043,
  south: 31.3322,
  east: -109.0452,
  west: -114.8126
};

interface SearchBarProps {
  isLoaded: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ isLoaded }) => {
  const [searchInput, setSearchInput] = useState('');
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const { setSelectedLocation } = useMetalData();
  const { isDark } = useTheme();
  
  const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
    setAutocomplete(autocomplete);
    
    // Set search bounds to Arizona
    const bounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(ARIZONA_BOUNDS.south, ARIZONA_BOUNDS.west),
      new google.maps.LatLng(ARIZONA_BOUNDS.north, ARIZONA_BOUNDS.east)
    );
    
    autocomplete.setBounds(bounds);
    autocomplete.setOptions({
      componentRestrictions: { country: 'us' },
      strictBounds: true,
      types: ['geocode', 'establishment']
    });
  };

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        
        // Verify the location is within Arizona
        if (lat >= ARIZONA_BOUNDS.south && lat <= ARIZONA_BOUNDS.north &&
            lng >= ARIZONA_BOUNDS.west && lng <= ARIZONA_BOUNDS.east) {
          setSelectedLocation({ lat, lng });
          setSearchInput(place.formatted_address || '');
        } else {
          setSearchInput('');
        }
      }
    }
  };
  
  const clearSearch = () => {
    setSearchInput('');
  };
  
  if (!isLoaded) return null;
  
  return (
    <div className="relative w-full max-w-md mx-auto" ref={searchRef}>
      <div className="relative">
        <Autocomplete
          onLoad={onLoad}
          onPlaceChanged={onPlaceChanged}
        >
          <input
            type="text"
            placeholder="Search locations in Arizona..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className={`w-full px-4 py-2 pl-10 pr-10 border rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-200 ${
              isDark 
                ? 'text-gray-100 bg-gray-800/90 border-gray-600 placeholder-gray-400 backdrop-blur-sm' 
                : 'text-gray-700 bg-white/90 border-gray-300 placeholder-gray-500 backdrop-blur-sm'
            }`}
          />
        </Autocomplete>
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
          isDark ? 'text-gray-400' : 'text-gray-400'
        }`} size={18} />
        {searchInput && (
          <button 
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
              isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'
            }`}
            onClick={clearSearch}
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;