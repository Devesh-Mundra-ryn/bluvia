
-- Create storage bucket for CSV uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('csv-uploads', 'csv-uploads', false);

-- Create RLS policies for the csv-uploads bucket
CREATE POLICY "Authenticated users can upload CSV files" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'csv-uploads' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view their own CSV uploads" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'csv-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create a table to store parsed CSV data (example: water analysis data)
CREATE TABLE public.csv_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  filename TEXT NOT NULL,
  location TEXT,
  sample_date DATE,
  ph_level DECIMAL,
  iron_ppm DECIMAL,
  chromium_ppm DECIMAL,
  manganese_ppm DECIMAL,
  molybdenum_ppm DECIMAL,
  indium_ppm DECIMAL,
  tantalum_ppm DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on csv_data table
ALTER TABLE public.csv_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for csv_data
CREATE POLICY "Users can view their own CSV data" 
ON public.csv_data FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own CSV data" 
ON public.csv_data FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own CSV data" 
ON public.csv_data FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own CSV data" 
ON public.csv_data FOR DELETE 
USING (auth.uid() = user_id);
