import { LatLng, MetalData } from '../types';

// Make sure your .env file contains:
// VITE_API_URL=https://<your-bluvia-backend-app>.azurewebsites.net

export const fetchMetalData = async (
  location: LatLng & { userId?: string }
): Promise<MetalData> => {
  const apiUrl = import.meta.env.VITE_API_URL;

  // Defensive: Only send lat & lng if both are numbers
  const payload: any = {
    lat: location.lat,
    lng: location.lng,
  };
  if ('userId' in location && location.userId) {
    payload.userId = location.userId;
  }

  if (
    typeof payload.lat !== 'number' ||
    typeof payload.lng !== 'number'
  ) {
    throw new Error('Latitude and longitude must be numbers');
  }

  const response = await fetch(`${apiUrl}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      `Backend error: ${response.status} ${response.statusText} ${err.detail ? '- ' + err.detail : ''}`
    );
  }

  return response.json();
};
