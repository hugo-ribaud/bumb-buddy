-- Enable Supabase Realtime

-- Drop existing publication if it exists
DROP PUBLICATION IF EXISTS supabase_realtime;

-- Create or recreate the publication
CREATE PUBLICATION supabase_realtime;

-- Add tables to the publication
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE food_categories;
ALTER PUBLICATION supabase_realtime ADD TABLE foods;

-- Create appropriate policies for Realtime
CREATE POLICY "Allow authenticated users to receive realtime updates" 
ON "realtime"."messages"
FOR SELECT
TO authenticated
USING (true);

-- Additional table-specific policies (adjust as needed for your schema)
CREATE POLICY "Allow users to see only their own data in realtime" 
ON "public"."users"
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Food categories are viewable by all authenticated users
CREATE POLICY "Food categories are viewable by all authenticated users in realtime" 
ON "public"."food_categories"
FOR SELECT
TO authenticated
USING (true);

-- Foods are viewable by all authenticated users
CREATE POLICY "Foods are viewable by all authenticated users in realtime" 
ON "public"."foods"
FOR SELECT
TO authenticated
USING (true);

-- Output success message (will be visible in database logs)
DO $$ 
BEGIN
    RAISE NOTICE 'Supabase Realtime has been enabled for users, food_categories, and foods tables';
END $$; 