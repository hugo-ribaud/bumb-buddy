-- Add mood tracking table
CREATE TABLE IF NOT EXISTS public.mood_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    time TIME WITHOUT TIME ZONE DEFAULT CURRENT_TIME,
    mood_rating INTEGER NOT NULL CHECK (mood_rating >= 1 AND mood_rating <= 5),
    mood_type TEXT NOT NULL,
    triggers TEXT[],
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add RLS to mood logs
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for mood logs
CREATE POLICY "Users can only view their own mood logs" 
    ON public.mood_logs
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own mood logs" 
    ON public.mood_logs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own mood logs" 
    ON public.mood_logs
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own mood logs" 
    ON public.mood_logs
    FOR DELETE
    USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_mood_logs_updated_at
BEFORE UPDATE ON public.mood_logs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add realtime pub/sub
ALTER PUBLICATION supabase_realtime ADD TABLE public.mood_logs;

-- Output success message
DO $$ 
BEGIN
    RAISE NOTICE 'Mood logs table has been created successfully';
END $$; 