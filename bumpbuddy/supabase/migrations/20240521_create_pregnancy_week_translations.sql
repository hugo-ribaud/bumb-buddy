-- Create pregnancy week translations table with JSON structure
CREATE TABLE IF NOT EXISTS public.pregnancy_week_translations (
  week INTEGER REFERENCES public.pregnancy_weeks(week) ON DELETE CASCADE,
  language TEXT NOT NULL,
  translations JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (week, language)
);

-- Add comment to explain the structure
COMMENT ON TABLE public.pregnancy_week_translations IS 'Stores translations for pregnancy weeks content in multiple languages';
COMMENT ON COLUMN public.pregnancy_week_translations.translations IS 'JSONB object containing translations for all text fields (fetal_development, maternal_changes, tips, nutrition_advice, common_symptoms, medical_checkups)';

-- Set up RLS policies
ALTER TABLE public.pregnancy_week_translations ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (since this is reference data)
CREATE POLICY "Allow public read access to pregnancy_week_translations" 
ON public.pregnancy_week_translations
FOR SELECT 
USING (true);

-- Create policy for authenticated users to manage translations (for admin purposes)
CREATE POLICY "Allow authenticated users to manage pregnancy_week_translations" 
ON public.pregnancy_week_translations
FOR ALL 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.pregnancy_week_translations
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Migrate existing data from English as the default language
INSERT INTO public.pregnancy_week_translations (week, language, translations)
SELECT 
  week,
  'en',
  json_build_object(
    'fetal_development', fetal_development,
    'maternal_changes', maternal_changes,
    'tips', tips,
    'nutrition_advice', nutrition_advice,
    'common_symptoms', common_symptoms,
    'medical_checkups', medical_checkups
  )::jsonb
FROM public.pregnancy_weeks
ON CONFLICT (week, language) DO NOTHING; 