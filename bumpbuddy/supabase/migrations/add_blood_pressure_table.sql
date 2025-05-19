-- Add blood pressure tracking table
CREATE TABLE IF NOT EXISTS public.blood_pressure_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    time TIME WITHOUT TIME ZONE DEFAULT CURRENT_TIME,
    systolic INTEGER NOT NULL CHECK (systolic > 0 AND systolic <= 300),
    diastolic INTEGER NOT NULL CHECK (diastolic > 0 AND diastolic <= 200),
    pulse INTEGER CHECK (pulse IS NULL OR (pulse > 0 AND pulse <= 250)),
    position TEXT CHECK (position IS NULL OR position IN ('sitting', 'standing', 'lying')),
    arm TEXT CHECK (arm IS NULL OR arm IN ('left', 'right')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add RLS to blood pressure logs
ALTER TABLE public.blood_pressure_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for blood pressure logs
CREATE POLICY "Users can only view their own blood pressure logs" 
    ON public.blood_pressure_logs
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own blood pressure logs" 
    ON public.blood_pressure_logs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own blood pressure logs" 
    ON public.blood_pressure_logs
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own blood pressure logs" 
    ON public.blood_pressure_logs
    FOR DELETE
    USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_blood_pressure_logs_updated_at
BEFORE UPDATE ON public.blood_pressure_logs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add realtime pub/sub
ALTER PUBLICATION supabase_realtime ADD TABLE public.blood_pressure_logs;

-- Output success message
DO $$ 
BEGIN
    RAISE NOTICE 'Blood pressure logs table has been created successfully';
END $$; 