export interface LatLng {
  lat: number;
  lng: number;
}

export interface MetalResult {
  name: string;
  concentration: number;
  unit: string;
  level: 'low' | 'moderate' | 'high';
  error: number;
}

export interface MetalData {
  metals: MetalResult[];
  location: LatLng;
  timestamp: string;
}

export interface SearchResult {
  name: string;
  location: LatLng;
  type: 'city' | 'zipcode';
}

// Add other types as needed for your API responses
export interface UploadResponse {
  success: boolean;
  fileId: string;
  results?: any;
  error?: string;
}

export interface InfoContent {
  sections: Array<{
    title: string;
    content: string;
    lastUpdated: string;
  }>;
}