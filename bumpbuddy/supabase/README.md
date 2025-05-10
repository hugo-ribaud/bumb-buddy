# Supabase Setup for BumpBuddy

This directory contains migration files and instructions for setting up the Supabase backend for BumpBuddy.

## Enable Realtime for Database Changes

To enable Supabase Realtime for your database and support the Realtime features in the app, follow these steps:

1. **Log in to your Supabase dashboard** at [https://app.supabase.com](https://app.supabase.com)
2. **Navigate to your project** and open the **SQL Editor**
3. **Create a new query** and paste the contents of `migrations/enable_realtime.sql`
4. **Run the query** to enable Realtime for the `users` table

### Verifying Realtime is Working

After enabling Realtime:

1. In the Supabase dashboard, go to **Database** > **Replication** > **Publications**
2. Verify that `supabase_realtime` publication exists and includes the `users` table
3. Run the app and check the Profile screen for the "Realtime: Connected" status

## Testing Realtime

To test that Realtime is working correctly:

1. Open two instances of the app (e.g., in a simulator and a real device, or two simulators)
2. Sign in to the same account on both
3. On one device, edit the profile and save changes
4. On the other device, observe that the "Profile updated at..." message appears

Alternatively, you can directly update a user record in the Supabase dashboard:

1. Navigate to **Database** > **Table editor** > **users**
2. Edit a user record and save
3. In the app, observe the Profile screen to see if the Realtime update is received

## Troubleshooting

If Realtime isn't working:

1. Check the console logs for any error messages
2. Verify the PostgreSQL publication is correctly set up
3. Ensure the Realtime policies allow the authenticated user to receive updates
4. Confirm that the Metro config contains the workaround for Expo compatibility:
   ```javascript
   // In metro.config.js
   config.resolver.unstable_enablePackageExports = false;
   ```

## Extending Realtime to Other Tables

To enable Realtime for additional tables:

1. Run SQL to add the table to the `supabase_realtime` publication:

   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE your_table_name;
   ```

2. Add appropriate RLS policies to the table to control access:

   ```sql
   CREATE POLICY "Allow users to see their own data in realtime"
   ON "public"."your_table_name"
   FOR SELECT
   TO authenticated
   USING (auth.uid() = user_id); -- Adjust this condition based on your schema
   ```

3. Create a new method in `realtimeService.ts` to subscribe to the table
