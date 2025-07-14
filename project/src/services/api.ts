import { LatLng, MetalData, SearchResult, RiskScores } from '../types';
import { supabase } from '../integrations/supabase/client';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchMetalData = async (location: LatLng): Promise<MetalData> => {
  await delay(500); // Small delay for better UX
  
  try {
    console.log('Calling predict-metals function with:', location);
    
    const { data, error } = await supabase.functions.invoke('predict-metals', {
      body: { lat: location.lat, lon: location.lng }
    });

    if (error) {
      console.error('Error calling predict-metals function:', error);
      throw new Error('Failed to get predictions from backend');
    }

    console.log('Received prediction data:', data);

    // Transform the backend response to match our frontend structure
    const metals = data.metals.map((metal: any) => ({
      name: metal.name,
      concentration: metal.ppm,
      unit: 'ppm',
      level: getLevel(metal.name, metal.ppm),
      error: metal.error
    }));

    // Determine data source based on whether this is from a known site
    const dataSource = determineDataSource(location);

    return {
      metals,
      location,
      timestamp: new Date().toISOString(),
      riskScores: data.risk_scores as RiskScores,
      dataSource
    };
  } catch (error) {
    console.error('Error fetching metal data:', error);
    throw error;
  }
};

function determineDataSource(location: LatLng): 'baseline' | 'ai-predicted' {
  // Known sites from the backend
  const knownSites = [
    { lat: 33.403, lng: -112.118 },
    { lat: 33.470, lng: -112.166 },
    { lat: 33.506, lng: -112.065 },
    { lat: 33.390, lng: -112.126 },
    { lat: 33.460, lng: -111.944 },
    { lat: 33.381, lng: -112.307 }
  ];

  // Check if location is within 3 miles (4.82 km) of any known site
  for (const site of knownSites) {
    const distance = calculateDistance(location.lat, location.lng, site.lat, site.lng);
    if (distance <= 4.82) {
      return 'baseline';
    }
  }
  
  return 'ai-predicted';
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function getLevel(metalName: string, concentration: number): 'low' | 'moderate' | 'high' {
  const thresholds: { [key: string]: { low: number; high: number } } = {
    Fe: { low: 20000, high: 35000 },
    Cr: { low: 300, high: 700 },
    Mn: { low: 1000, high: 2000 },
    Mo: { low: 15, high: 25 },
    In: { low: 0.2, high: 0.3 },
    Ta: { low: 1.0, high: 2.0 }
  };

  const threshold = thresholds[metalName];
  if (!threshold) return 'moderate';

  if (concentration <= threshold.low) return 'low';
  if (concentration <= threshold.high) return 'moderate';
  return 'high';
}

const arizonaLocations: SearchResult[] = [
  { name: 'Phoenix', location: { lat: 33.4484, lng: -112.0740 }, type: 'city' },
  { name: 'Tucson', location: { lat: 32.2226, lng: -110.9747 }, type: 'city' },
  { name: 'Mesa', location: { lat: 33.4152, lng: -111.8315 }, type: 'city' },
  { name: 'Chandler', location: { lat: 33.3062, lng: -111.8413 }, type: 'city' },
  { name: 'Scottsdale', location: { lat: 33.4942, lng: -111.9261 }, type: 'city' },
  { name: 'Glendale', location: { lat: 33.5387, lng: -112.1860 }, type: 'city' },
  { name: 'Tempe', location: { lat: 33.4255, lng: -111.9400 }, type: 'city' },
  { name: 'Flagstaff', location: { lat: 35.1983, lng: -111.6513 }, type: 'city' },
  { name: 'Yuma', location: { lat: 32.6927, lng: -114.6277 }, type: 'city' },
  { name: '85001', location: { lat: 33.4484, lng: -112.0740 }, type: 'zipcode' },
  { name: '85716', location: { lat: 32.2400, lng: -110.9400 }, type: 'zipcode' },
  { name: '85201', location: { lat: 33.4255, lng: -111.8315 }, type: 'zipcode' },
  { name: '85224', location: { lat: 33.3062, lng: -111.8413 }, type: 'zipcode' },
  { name: '85251', location: { lat: 33.4942, lng: -111.9261 }, type: 'zipcode' },
  { name: '85301', location: { lat: 33.5387, lng: -112.1860 }, type: 'zipcode' },
  { name: '85281', location: { lat: 33.4255, lng: -111.9400 }, type: 'zipcode' },
  { name: '86001', location: { lat: 35.1983, lng: -111.6513 }, type: 'zipcode' },
  { name: '85364', location: { lat: 32.6927, lng: -114.6277 }, type: 'zipcode' },
];

export const searchLocations = async (query: string): Promise<SearchResult[]> => {
  await delay(300);
  
  if (!query.trim()) return [];
  
  const lowerQuery = query.toLowerCase().trim();
  
  return arizonaLocations.filter(location => 
    location.name.toLowerCase().includes(lowerQuery)
  );
};
