import { LatLng, MetalData, SearchResult } from '../types';

// Azure deployment URL or local dev URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const fetchMetalData = async (location: LatLng): Promise<MetalData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lat: location.lat,
        lng: location.lng,
        userId: 'anonymous' // Add actual user ID if authenticated
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching metal data:', error);
    throw error;
  }
};

export const uploadFile = async (file: File, metadata?: { description?: string, location?: string }): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData,
      // Headers are automatically set by browser for FormData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const searchLocations = async (query: string): Promise<SearchResult[]> => {
  try {
    // This would need to be implemented in your FastAPI back-end
    const response = await fetch(`${API_BASE_URL}/api/locations?query=${encodeURIComponent(query)}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching locations:', error);
    throw error;
  }
};

// Add other API functions as needed for your endpoints
export const getInfoContent = async () => {
  const response = await fetch(`${API_BASE_URL}/api/content/info`);
  return await response.json();
};

export const submitContact = async (data: { name: string; email: string; message: string }) => {
  const response = await fetch(`${API_BASE_URL}/api/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return await response.json();
};