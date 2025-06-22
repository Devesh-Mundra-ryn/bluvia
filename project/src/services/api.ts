import { LatLng, MetalData } from '../types';

// Calls your FastAPI backend for metal data at a specific location
export const fetchMetalData = async (location: LatLng): Promise<MetalData> => {
  const apiUrl = import.meta.env.VITE_API_URL; // Make sure .env has VITE_API_URL

  const response = await fetch(`${apiUrl}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(location),
  });

  if (!response.ok) {
    throw new Error(`Backend error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};
