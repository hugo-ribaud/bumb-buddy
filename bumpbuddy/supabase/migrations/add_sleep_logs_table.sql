-- Add sleep tracking table
CREATE TABLE IF NOT EXISTS public.sleep_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    time TIME WITHOUT TIME ZONE DEFAULT CURRENT_TIME,
    duration INTEGER NOT NULL, -- sleep duration in minutes
    sleep_quality INTEGER NOT NULL CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
    sleep_type TEXT, -- e.g., 'night', 'nap'
    disruptions TEXT[], -- reasons for sleep disruption if any
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add RLS to sleep logs
ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for sleep logs
CREATE POLICY "Users can only view their own sleep logs" 
    ON public.sleep_logs
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own sleep logs" 
    ON public.sleep_logs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own sleep logs" 
    ON public.sleep_logs
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own sleep logs" 
    ON public.sleep_logs
    FOR DELETE
    USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_sleep_logs_updated_at
BEFORE UPDATE ON public.sleep_logs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add realtime pub/sub
ALTER PUBLICATION supabase_realtime ADD TABLE public.sleep_logs;

-- Output success message
DO $$ 
BEGIN
    RAISE NOTICE 'Sleep logs table has been created successfully';
END $$; 