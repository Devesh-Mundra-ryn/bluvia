import { LatLng, MetalData, SearchResult } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchMetalData = async (location: LatLng): Promise<MetalData> => {
  await delay(1500);
  
  const generateRandomConcentration = (base: number, variance: number) => {
    return +(base + (Math.random() * variance * 2 - variance)).toFixed(2);
  };

  const getLevel = (value: number, lowThreshold: number, highThreshold: number) => {
    if (value <= lowThreshold) return 'low';
    if (value <= highThreshold) return 'moderate';
    return 'high';
  };

  const latFactor = Math.sin(location.lat / 10) * 0.5 + 0.5;
  const lngFactor = Math.cos(location.lng / 15) * 0.5 + 0.5;
  const locationFactor = (latFactor + lngFactor) / 2;

  const metals = [
    {
      name: 'Fe',
      concentration: generateRandomConcentration(25000 * locationFactor, 5000),
      unit: 'ppm',
      level: 'moderate' as const,
      error: +(Math.random() * 2 + 2).toFixed(1) // Random error between 2-4%
    },
    {
      name: 'Cr',
      concentration: generateRandomConcentration(500 * locationFactor, 100),
      unit: 'ppm',
      level: 'low' as const,
      error: +(Math.random() * 2 + 2).toFixed(1)
    },
    {
      name: 'Mn',
      concentration: generateRandomConcentration(1500 * locationFactor, 300),
      unit: 'ppm',
      level: 'high' as const,
      error: +(Math.random() * 2 + 2).toFixed(1)
    },
    {
      name: 'Mo',
      concentration: generateRandomConcentration(20 * locationFactor, 5),
      unit: 'ppm',
      level: 'low' as const,
      error: +(Math.random() * 2 + 2).toFixed(1)
    },
    {
      name: 'In',
      concentration: generateRandomConcentration(0.25 * locationFactor, 0.1),
      unit: 'ppm',
      level: 'moderate' as const,
      error: +(Math.random() * 2 + 2).toFixed(1)
    },
    {
      name: 'Ta',
      concentration: generateRandomConcentration(1.5 * locationFactor, 0.5),
      unit: 'ppm',
      level: 'high' as const,
      error: +(Math.random() * 2 + 2).toFixed(1)
    }
  ];

  // Update levels based on actual concentrations
  metals[0].level = getLevel(metals[0].concentration, 20000, 35000);  // Fe
  metals[1].level = getLevel(metals[1].concentration, 300, 700);      // Cr
  metals[2].level = getLevel(metals[2].concentration, 1000, 2000);    // Mn
  metals[3].level = getLevel(metals[3].concentration, 15, 25);        // Mo
  metals[4].level = getLevel(metals[4].concentration, 0.2, 0.3);      // In
  metals[5].level = getLevel(metals[5].concentration, 1.0, 2.0);      // Ta

  return {
    metals,
    location,
    timestamp: new Date().toISOString()
  };
};

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