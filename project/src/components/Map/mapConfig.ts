
export const ARIZONA_BOUNDS = {
  north: 37.5043,
  south: 30.8322,
  east: -108.5452,
  west: -115.3126
};

export const STRICT_ARIZONA_BOUNDS = {
  north: 37.0043,
  south: 31.3322,
  east: -109.0452,
  west: -114.8126
};

export const ARIZONA_CENTER = {
  lat: 34.1683,
  lng: -111.9311
};

export const DEFAULT_ZOOM = 7;

export const isWithinArizona = (lat: number, lng: number): boolean => {
  return lat >= STRICT_ARIZONA_BOUNDS.south && 
         lat <= STRICT_ARIZONA_BOUNDS.north &&
         lng >= STRICT_ARIZONA_BOUNDS.west && 
         lng <= STRICT_ARIZONA_BOUNDS.east;
};
