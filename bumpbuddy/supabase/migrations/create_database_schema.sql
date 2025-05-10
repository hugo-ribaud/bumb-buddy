-- BumpBuddy Database Schema
-- This file defines the complete database schema for the BumpBuddy application

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- Schema: Auth and users
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    due_date DATE,
    pregnancy_week INTEGER,
    birth_date DATE,
    avatar_url TEXT,
    notification_preferences JSONB DEFAULT '{"appointments": true, "weeklyUpdates": true, "foodSafety": true}',
    app_settings JSONB DEFAULT '{"theme": "light", "units": "metric", "language": "en"}'
);

-- Add RLS to users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view only their own data" 
    ON public.users
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update only their own data" 
    ON public.users
    FOR UPDATE
    USING (auth.uid() = id);

-- Food safety database
CREATE TYPE safety_rating AS ENUM ('safe', 'caution', 'avoid');

CREATE TABLE IF NOT EXISTS public.food_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.foods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.food_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    safety_rating safety_rating NOT NULL,
    description TEXT,
    alternatives TEXT,
    nutritional_info JSONB,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add search index for food names
CREATE INDEX foods_name_trgm_idx ON public.foods USING GIN (name gin_trgm_ops);

-- Add RLS to food tables
ALTER TABLE public.food_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Food categories are viewable by all authenticated users" 
    ON public.food_categories
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Foods are viewable by all authenticated users" 
    ON public.foods
    FOR SELECT
    TO authenticated
    USING (true);

-- Health tracking
CREATE TABLE IF NOT EXISTS public.symptoms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    symptom_type TEXT NOT NULL,
    severity INTEGER CHECK (severity BETWEEN 1 AND 10),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    time TIME WITHOUT TIME ZONE DEFAULT CURRENT_TIME,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.kick_counts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    count INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.contractions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    intensity INTEGER CHECK (intensity BETWEEN 1 AND 10),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.weight_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    weight NUMERIC(5,2) NOT NULL, -- in kilograms
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add RLS to health tracking tables
ALTER TABLE public.symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kick_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for health tracking (same pattern for all)
CREATE POLICY "Users can only view their own symptoms" 
    ON public.symptoms
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own symptoms" 
    ON public.symptoms
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own symptoms" 
    ON public.symptoms
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own symptoms" 
    ON public.symptoms
    FOR DELETE
    USING (auth.uid() = user_id);

-- Apply same RLS pattern to other health tables
-- Kick counts
CREATE POLICY "Users can only view their own kick counts" 
    ON public.kick_counts
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own kick counts" 
    ON public.kick_counts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own kick counts" 
    ON public.kick_counts
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own kick counts" 
    ON public.kick_counts
    FOR DELETE
    USING (auth.uid() = user_id);

-- Contractions
CREATE POLICY "Users can only view their own contractions" 
    ON public.contractions
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own contractions" 
    ON public.contractions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own contractions" 
    ON public.contractions
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own contractions" 
    ON public.contractions
    FOR DELETE
    USING (auth.uid() = user_id);

-- Weight logs
CREATE POLICY "Users can only view their own weight logs" 
    ON public.weight_logs
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own weight logs" 
    ON public.weight_logs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own weight logs" 
    ON public.weight_logs
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own weight logs" 
    ON public.weight_logs
    FOR DELETE
    USING (auth.uid() = user_id);

-- Appointments and Reminders
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    reminder BOOLEAN DEFAULT TRUE,
    reminder_time INTEGER DEFAULT 30, -- minutes before
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add RLS to appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view their own appointments" 
    ON public.appointments
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own appointments" 
    ON public.appointments
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own appointments" 
    ON public.appointments
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own appointments" 
    ON public.appointments
    FOR DELETE
    USING (auth.uid() = user_id);

-- Pregnancy Journey and Timeline
CREATE TABLE IF NOT EXISTS public.pregnancy_weeks (
    week INTEGER PRIMARY KEY CHECK (week BETWEEN 1 AND 42),
    fetal_development TEXT NOT NULL,
    maternal_changes TEXT NOT NULL,
    tips TEXT,
    nutrition_advice TEXT,
    common_symptoms TEXT,
    medical_checkups TEXT,
    image_url TEXT
);

-- Add RLS to pregnancy_weeks
ALTER TABLE public.pregnancy_weeks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pregnancy weeks are viewable by all authenticated users" 
    ON public.pregnancy_weeks
    FOR SELECT
    TO authenticated
    USING (true);

-- User-specific pregnancy journal
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    mood TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    pregnancy_week INTEGER,
    images JSONB, -- Array of image URLs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add RLS to journal_entries
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view their own journal entries" 
    ON public.journal_entries
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own journal entries" 
    ON public.journal_entries
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own journal entries" 
    ON public.journal_entries
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own journal entries" 
    ON public.journal_entries
    FOR DELETE
    USING (auth.uid() = user_id);

-- Add Realtime pub/sub for all tables that need it
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.symptoms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.kick_counts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contractions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.journal_entries;

-- Create triggers to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to all tables with updated_at column
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
          AND table_schema = 'public'
    LOOP
        EXECUTE format('
            CREATE TRIGGER update_updated_at_trigger
            BEFORE UPDATE ON public.%I
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        ', t);
    END LOOP;
END;
$$;

-- Optional: Seed data for pregnancy weeks (first 3 weeks as example)
INSERT INTO public.pregnancy_weeks (week, fetal_development, maternal_changes, tips, nutrition_advice, common_symptoms, medical_checkups, image_url)
VALUES
(1, 'Fertilization occurs. The fertilized egg (zygote) begins dividing rapidly as it travels down the fallopian tube to the uterus.', 
   'You may not feel any different yet. Your period may not be due for another week or two.', 
   'Start taking prenatal vitamins with folic acid if you haven''t already.', 
   'Focus on a balanced diet with plenty of fruits, vegetables, whole grains, and lean proteins.', 
   'None specific to pregnancy yet.', 
   'None needed yet.', 
   'https://example.com/week1.jpg'),

(2, 'The rapidly dividing ball of cells (now called a blastocyst) implants into the uterine lining.', 
   'Implantation may cause light spotting. Hormone levels begin to change.', 
   'Avoid alcohol, smoking, and limit caffeine.', 
   'Continue prenatal vitamins and a balanced diet.', 
   'Some women experience implantation cramping or spotting.', 
   'Take a home pregnancy test if your period is late.', 
   'https://example.com/week2.jpg'),

(3, 'The embryo begins to form, and the placenta begins to develop.', 
   'Pregnancy hormones increase. You may start experiencing early pregnancy symptoms.', 
   'Get plenty of rest as your body works hard in early development.', 
   'Focus on foods rich in folate like leafy greens, citrus fruits, and beans.', 
   'Possible fatigue, breast tenderness, and nausea.', 
   'Schedule your first prenatal appointment if you have a positive pregnancy test.', 
   'https://example.com/week3.jpg');

-- Output success message
DO $$ 
BEGIN
    RAISE NOTICE 'Complete database schema has been created successfully';
END $$; 