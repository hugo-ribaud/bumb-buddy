-- Add external service fields to appointments table for integration with Doctolib
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS external_id TEXT,
ADD COLUMN IF NOT EXISTS external_service TEXT,
ADD COLUMN IF NOT EXISTS external_url TEXT,
ADD COLUMN IF NOT EXISTS doctor_name TEXT,
ADD COLUMN IF NOT EXISTS specialty TEXT;

-- Add index for faster lookup by external ID
CREATE INDEX IF NOT EXISTS idx_appointments_external_id ON public.appointments(external_id);

-- Comment on the table to explain the new columns
COMMENT ON COLUMN public.appointments.external_id IS 'ID from external appointment service (e.g., Doctolib)';
COMMENT ON COLUMN public.appointments.external_service IS 'Name of external service (e.g., "doctolib")';
COMMENT ON COLUMN public.appointments.external_url IS 'URL to appointment in external service';
COMMENT ON COLUMN public.appointments.doctor_name IS 'Name of the healthcare provider';
COMMENT ON COLUMN public.appointments.specialty IS 'Medical specialty of the healthcare provider'; 