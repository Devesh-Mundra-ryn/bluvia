
export interface LatLng {
  lat: number;
  lng: number;
}

export interface Metal {
  name: string;
  concentration: number;
  unit: string;
  level: 'low' | 'moderate' | 'high';
  error?: number;
}

export interface RiskScores {
  Fe: number;
  Cr: number;
  Mn: number;
  Mo: number;
  In: number;
  Average: number;
}

export interface MetalData {
  metals: Metal[];
  location: LatLng;
  timestamp: string;
  riskScores?: RiskScores;
  dataSource?: 'baseline' | 'ai-predicted';
}

export interface SearchResult {
  name: string;
  location: LatLng;
  type: 'city' | 'zipcode';
}
