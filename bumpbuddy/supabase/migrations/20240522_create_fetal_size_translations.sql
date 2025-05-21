-- Create fetal size comparison translations table with JSON structure
CREATE TABLE IF NOT EXISTS public.fetal_size_translations (
  week INTEGER REFERENCES public.fetal_size_comparisons(week) ON DELETE CASCADE,
  language TEXT NOT NULL,
  translations JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (week, language)
);

-- Add comment to explain the structure
COMMENT ON TABLE public.fetal_size_translations IS 'Stores translations for fetal size comparisons in multiple languages';
COMMENT ON COLUMN public.fetal_size_translations.translations IS 'JSONB object containing translations for all text fields (name, description)';

-- Set up RLS policies
ALTER TABLE public.fetal_size_translations ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (since this is reference data)
CREATE POLICY "Allow public read access to fetal_size_translations" 
ON public.fetal_size_translations
FOR SELECT 
USING (true);

-- Create policy for authenticated users to manage translations (for admin purposes)
CREATE POLICY "Allow authenticated users to manage fetal_size_translations" 
ON public.fetal_size_translations
FOR ALL 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Create trigger for updated_at (reusing existing handle_updated_at function)
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.fetal_size_translations
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Migrate existing data from English as the default language
INSERT INTO public.fetal_size_translations (week, language, translations)
SELECT 
  week,
  'en',
  json_build_object(
    'name', fruit_name,
    'description', description
  )::jsonb
FROM public.fetal_size_comparisons
ON CONFLICT (week, language) DO NOTHING; 