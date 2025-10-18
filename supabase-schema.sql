-- AHE SmartGate Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (visitors and unpaid residents)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  user_type TEXT CHECK (user_type IN ('visitor', 'resident_unpaid')) NOT NULL,
  house_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Entries table (all entry records)
CREATE TABLE entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  entry_type TEXT CHECK (entry_type IN ('normal', 'forced_by_guard')) NOT NULL,
  selfie_url TEXT,
  notes TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Guards table
CREATE TABLE guards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admins table
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_id TEXT,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE guards ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on your security needs)
CREATE POLICY "Allow public read access to users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to users" ON users FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to entries" ON entries FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to entries" ON entries FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to guards" ON guards FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to guards" ON guards FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to admins" ON admins FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to admins" ON admins FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_entries_timestamp ON entries(timestamp DESC);
CREATE INDEX idx_entries_user_id ON entries(user_id);
CREATE INDEX idx_users_user_type ON users(user_type);

-- Insert sample data (optional)
INSERT INTO guards (name) VALUES ('Guard 1'), ('Guard 2');
INSERT INTO admins (name, telegram_id) VALUES ('Admin 1', '123456789');
