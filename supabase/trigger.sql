-- Create the database trigger to call the Edge Function
-- Run this in your Supabase SQL editor after deploying the Edge Function

-- Create a function that calls the Edge Function
CREATE OR REPLACE FUNCTION notify_telegram()
RETURNS TRIGGER AS $$
DECLARE
  payload JSON;
  user_data JSON;
BEGIN
  -- Get user data for the entry
  SELECT to_json(u.*) INTO user_data
  FROM users u
  WHERE u.id = NEW.user_id;
  
  -- Create payload with entry and user data
  payload := json_build_object(
    'record', json_build_object(
      'id', NEW.id,
      'user_id', NEW.user_id,
      'entry_type', NEW.entry_type,
      'selfie_url', NEW.selfie_url,
      'notes', NEW.notes,
      'timestamp', NEW.timestamp,
      'users', user_data
    )
  );
  
  -- Call the Edge Function
  PERFORM net.http_post(
    url := 'https://your-project-ref.supabase.co/functions/v1/notify-telegram',
    headers := json_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || 'your-service-role-key'
    ),
    body := payload::text
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS on_entry_created ON entries;
CREATE TRIGGER on_entry_created
  AFTER INSERT ON entries
  FOR EACH ROW
  EXECUTE FUNCTION notify_telegram();

-- Note: Replace 'your-project-ref' and 'your-service-role-key' with your actual values
