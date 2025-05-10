-- Enable Supabase Realtime

-- Drop existing publication if it exists
DROP PUBLICATION IF EXISTS supabase_realtime;

-- Create or recreate the publication
CREATE PUBLICATION supabase_realtime;

-- Add the 'users' table to the publication
ALTER PUBLICATION supabase_realtime ADD TABLE users;

-- Create appropriate policies for Realtime
CREATE POLICY "Allow authenticated users to receive realtime updates" 
ON "realtime"."messages"
FOR SELECT
TO authenticated
USING (true);

-- Note: The above policy assumes you have the 'realtime' schema with a 'messages' table.
-- If your Supabase instance does not have this, you might need to adjust the policy.

-- Additional table-specific policies (adjust as needed for your schema)
CREATE POLICY "Allow users to see only their own data in realtime" 
ON "public"."users"
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Output success message (will be visible in database logs)
DO $$ 
BEGIN
    RAISE NOTICE 'Supabase Realtime has been enabled for users table';
END $$; 