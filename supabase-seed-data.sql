-- Example seed data for admin user
-- This creates a test admin user for development/testing purposes

-- Insert a test admin user (you'll need to replace the UUID with an actual user ID from auth.users)
-- First, create the user through Supabase Auth, then run this to set their profile

-- Example: After creating a user with email 'admin@example.com' and password 'password123'
-- You can get their UUID from the auth.users table and insert their profile:

-- INSERT INTO profiles (id, full_name, role)
-- VALUES (
--   'your-admin-user-uuid-here', 
--   'Admin User', 
--   'admin'
-- );

-- For testing purposes, you can also create a guard user:
-- INSERT INTO profiles (id, full_name, role)
-- VALUES (
--   'your-guard-user-uuid-here', 
--   'Guard User', 
--   'guard'
-- );

-- Demo credentials for testing:
-- Admin: admin@example.com / password123
-- Guard: guard@example.com / password123

-- Note: You need to create these users through the Supabase Auth interface first,
-- then update their profiles using the UUIDs from auth.users table.
