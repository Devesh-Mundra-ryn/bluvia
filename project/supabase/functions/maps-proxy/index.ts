
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Maps proxy request received:', req.method, req.url);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!GOOGLE_MAPS_API_KEY) {
      console.error('Google Maps API key not configured');
      throw new Error('Google Maps API key not configured');
    }

    const { searchParams } = new URL(req.url);
    const endpoint = searchParams.get('endpoint') || 'js';
    
    console.log('Proxy endpoint requested:', endpoint);
    
    let targetURL: string;
    
    switch (endpoint) {
      case 'js':
        // For loading the Maps JavaScript API
        const libraries = searchParams.get('libraries') || '';
        const callback = searchParams.get('callback') || '';
        targetURL = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
        if (libraries) targetURL += `&libraries=${libraries}`;
        if (callback) targetURL += `&callback=${callback}`;
        break;
        
      case 'geocode':
        // For geocoding requests
        const address = searchParams.get('address');
        if (!address) {
          throw new Error('Address parameter required for geocoding');
        }
        targetURL = `https://maps.googleapis.com/maps/api/geocode/json?key=${GOOGLE_MAPS_API_KEY}&address=${encodeURIComponent(address)}`;
        break;
        
      case 'places':
        // For places API requests
        const query = searchParams.get('query');
        if (!query) {
          throw new Error('Query parameter required for places');
        }
        targetURL = `https://maps.googleapis.com/maps/api/place/textsearch/json?key=${GOOGLE_MAPS_API_KEY}&query=${encodeURIComponent(query)}`;
        break;
        
      default:
        throw new Error('Invalid endpoint specified');
    }

    console.log(`Proxying request to: ${targetURL}`);

    const response = await fetch(targetURL);
    
    if (!response.ok) {
      console.error('Google Maps API error:', response.status, response.statusText);
      throw new Error(`Google Maps API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.text();
    console.log('Successfully fetched data from Google Maps API');

    // For JavaScript API, we need to handle the response differently
    if (endpoint === 'js') {
      return new Response(data, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/javascript',
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        },
      });
    }

    // For JSON responses (geocoding, places)
    return new Response(data, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    });

  } catch (error) {
    console.error('Error in maps-proxy function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
