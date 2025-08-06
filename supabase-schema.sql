-- Create users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  address_details TEXT NOT NULL,
  mobile TEXT NOT NULL,
  available_for_tasks BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  address_details TEXT NOT NULL,
  time TEXT NOT NULL,
  reward INTEGER NOT NULL,
  upi_id TEXT,
  poster_id UUID REFERENCES users(id) ON DELETE CASCADE,
  runner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('available', 'in_progress', 'completed', 'paid')) DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_poster_id ON tasks(poster_id);
CREATE INDEX idx_tasks_runner_id ON tasks(runner_id);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_tasks_location ON tasks(latitude, longitude);
CREATE INDEX idx_users_location ON users(latitude, longitude);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (true);

-- Create policies for tasks table
CREATE POLICY "Anyone can view available tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "Users can create tasks" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update tasks they posted or accepted" ON tasks FOR UPDATE USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Email Auth in Supabase Auth
-- This should be configured in the Supabase dashboard under Authentication > Settings

-- Create notifications table for email notifications
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('task_assigned', 'task_completed', 'task_cancelled', 'payment_confirmed')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  sent_via_email BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_task_id ON notifications(task_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Enable RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications 
  FOR SELECT USING (auth.uid()::text = (SELECT id::text FROM users WHERE users.id = notifications.user_id));

CREATE POLICY "System can insert notifications" ON notifications 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON notifications 
  FOR UPDATE USING (auth.uid()::text = (SELECT id::text FROM users WHERE users.id = notifications.user_id));

-- Update RLS policies for authenticated users
DROP POLICY "Users can view all users" ON users;
DROP POLICY "Users can insert their own profile" ON users;
DROP POLICY "Users can update their own profile" ON users;
DROP POLICY "Anyone can view available tasks" ON tasks;
DROP POLICY "Users can create tasks" ON tasks;
DROP POLICY "Users can update tasks they posted or accepted" ON tasks;

-- Create auth-based policies
CREATE POLICY "Authenticated users can view all users" ON users 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert their own profile" ON users 
  FOR INSERT WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" ON users 
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Authenticated users can view tasks" ON tasks 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create tasks" ON tasks 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid()::text = poster_id::text);

CREATE POLICY "Users can update tasks they posted or accepted" ON tasks 
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND 
    (auth.uid()::text = poster_id::text OR auth.uid()::text = runner_id::text)
  );