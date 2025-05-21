-- Create the fetal_size_comparisons table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.fetal_size_comparisons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  week INTEGER NOT NULL,
  name TEXT NOT NULL,
  size_mm NUMERIC,
  size_in NUMERIC,
  weight_g NUMERIC,
  weight_oz NUMERIC,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT unique_week UNIQUE (week)
);

-- Create update trigger to maintain updated_at
CREATE OR REPLACE FUNCTION update_fetal_size_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_fetal_size_timestamp
BEFORE UPDATE ON public.fetal_size_comparisons
FOR EACH ROW
EXECUTE FUNCTION update_fetal_size_timestamp();

-- Create RLS policies
ALTER TABLE public.fetal_size_comparisons ENABLE ROW LEVEL SECURITY;

-- Anyone can read
CREATE POLICY "Allow public read access to fetal_size_comparisons"
ON public.fetal_size_comparisons
FOR SELECT
TO authenticated, anon
USING (true);

-- Only admins can write
CREATE POLICY "Allow admin insert/update access to fetal_size_comparisons"
ON public.fetal_size_comparisons
FOR ALL
TO authenticated
USING (auth.uid() IN (SELECT auth.uid() FROM public.users WHERE is_admin = true));

-- Add table to Realtime
BEGIN;
  -- Check if supabase_realtime publication exists
  DO $$ 
  BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
      -- Add table to existing publication
      ALTER PUBLICATION supabase_realtime ADD TABLE public.fetal_size_comparisons;
    ELSE
      -- Create publication if it doesn't exist
      CREATE PUBLICATION supabase_realtime FOR TABLE public.fetal_size_comparisons;
    END IF;
  END $$;
COMMIT; 