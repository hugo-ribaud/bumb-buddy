-- Create a trigger to synchronize auth.users with public.users
-- This ensures that when a user signs up, a corresponding record is created in the public.users table

-- First, create a function that will be called by the trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  system_settings JSONB := '{"theme": "system", "units": "metric", "language": "en"}';
BEGIN
  -- Insert a new row into public.users
  INSERT INTO public.users (id, email, created_at, updated_at, app_settings)
  VALUES (NEW.id, NEW.email, NEW.created_at, NEW.updated_at, system_settings);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user function: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add a function and trigger to handle user updates (email changes)
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update email if it has changed
  IF NEW.email <> OLD.email THEN
    UPDATE public.users 
    SET email = NEW.email, updated_at = NEW.updated_at
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_user_update function: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace the update trigger
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_update();

-- Output success message
DO $$ 
BEGIN
  RAISE NOTICE 'Auth user synchronization triggers have been set up successfully';
END $$; 