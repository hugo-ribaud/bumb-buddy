-- Add exercise tracking table
CREATE TABLE IF NOT EXISTS public.exercise_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    time TIME WITHOUT TIME ZONE DEFAULT CURRENT_TIME,
    exercise_type TEXT NOT NULL, -- e.g., 'walking', 'yoga', 'swimming', etc.
    duration INTEGER NOT NULL, -- in minutes
    intensity INTEGER CHECK (intensity >= 1 AND intensity <= 5), -- Scale of 1-5
    modified_positions BOOLEAN DEFAULT FALSE, -- whether exercise positions were modified for pregnancy
    heart_rate INTEGER, -- in bpm (optional)
    felt_contractions BOOLEAN DEFAULT FALSE,
    felt_discomfort BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add RLS to exercise logs
ALTER TABLE public.exercise_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for exercise logs
CREATE POLICY "Users can only view their own exercise logs" 
    ON public.exercise_logs
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own exercise logs" 
    ON public.exercise_logs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own exercise logs" 
    ON public.exercise_logs
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own exercise logs" 
    ON public.exercise_logs
    FOR DELETE
    USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_exercise_logs_updated_at
BEFORE UPDATE ON public.exercise_logs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 