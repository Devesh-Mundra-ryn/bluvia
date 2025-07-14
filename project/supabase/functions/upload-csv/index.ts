
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { parse } from "https://deno.land/std@0.168.0/encoding/csv.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }), 
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify the user's JWT token
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);

    if (authError || !user) {
      console.error('Auth verification failed:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }), 
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'CSV file is required' }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!file.type.includes('csv') && !file.name.endsWith('.csv')) {
      return new Response(
        JSON.stringify({ error: 'Only CSV files are allowed' }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Processing CSV upload for user:', user.id, 'File:', file.name);

    // Store file in Supabase Storage
    const fileBuffer = await file.arrayBuffer();
    const fileName = `${user.id}/${Date.now()}-${file.name}`;
    
    const { error: uploadError } = await supabase.storage
      .from('csv-uploads')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('File upload error:', uploadError.message);
      return new Response(
        JSON.stringify({ error: 'Failed to upload file: ' + uploadError.message }), 
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse CSV content
    const text = new TextDecoder().decode(fileBuffer);
    
    try {
      const records = parse(text, { 
        skipFirstRow: true,
        columns: [
          'location',
          'sample_date',
          'ph_level',
          'iron_ppm',
          'chromium_ppm',
          'manganese_ppm',
          'molybdenum_ppm',
          'indium_ppm',
          'tantalum_ppm'
        ]
      }) as Record<string, string>[];

      console.log('Parsed', records.length, 'records from CSV');

      // Transform and validate data
      const processedRecords = records
        .filter(record => Object.values(record).some(value => value?.trim())) // Filter out empty rows
        .map(record => ({
          user_id: user.id,
          filename: file.name,
          location: record.location?.trim() || null,
          sample_date: record.sample_date ? new Date(record.sample_date).toISOString().split('T')[0] : null,
          ph_level: record.ph_level ? parseFloat(record.ph_level) : null,
          iron_ppm: record.iron_ppm ? parseFloat(record.iron_ppm) : null,
          chromium_ppm: record.chromium_ppm ? parseFloat(record.chromium_ppm) : null,
          manganese_ppm: record.manganese_ppm ? parseFloat(record.manganese_ppm) : null,
          molybdenum_ppm: record.molybdenum_ppm ? parseFloat(record.molybdenum_ppm) : null,
          indium_ppm: record.indium_ppm ? parseFloat(record.indium_ppm) : null,
          tantalum_ppm: record.tantalum_ppm ? parseFloat(record.tantalum_ppm) : null,
        }));

      if (processedRecords.length === 0) {
        return new Response(
          JSON.stringify({ error: 'No valid data found in CSV file' }), 
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Insert into database
      const { error: insertError, count } = await supabase
        .from('csv_data')
        .insert(processedRecords);

      if (insertError) {
        console.error('Database insert error:', insertError.message);
        return new Response(
          JSON.stringify({ error: 'Failed to save data: ' + insertError.message }), 
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      console.log('Successfully inserted', processedRecords.length, 'records');

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Successfully processed ${processedRecords.length} records from CSV`,
          inserted: processedRecords.length,
          filename: file.name
        }), 
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );

    } catch (parseError) {
      console.error('CSV parsing error:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid CSV format: ' + parseError.message }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})
