-- Run this in the Supabase SQL editor to create all tables

-- About (single row)
CREATE TABLE IF NOT EXISTS about (
  id INTEGER PRIMARY KEY DEFAULT 1,
  name TEXT NOT NULL,
  tagline TEXT,
  bio TEXT,
  location TEXT,
  status TEXT DEFAULT 'Available',
  resume_url TEXT,
  social_devpost TEXT,
  social_github TEXT,
  social_instagram TEXT,
  social_linkedin TEXT
);

-- Experiences (work history)
CREATE TABLE IF NOT EXISTS experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  description TEXT[] DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  result_tags TEXT[] DEFAULT '{}',
  "order" INTEGER NOT NULL DEFAULT 0
);

-- Activities (hackathons/projects in about tab)
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  role TEXT,
  start_date TEXT,
  end_date TEXT,
  description TEXT,
  award TEXT,
  "order" INTEGER NOT NULL DEFAULT 0
);

-- Education
CREATE TABLE IF NOT EXISTS education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution TEXT NOT NULL,
  degree TEXT,
  start_date TEXT,
  end_date TEXT,
  "order" INTEGER NOT NULL DEFAULT 0
);

-- Hackathons section
CREATE TABLE IF NOT EXISTS hackathons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  award TEXT,
  project_name TEXT,
  participated_only BOOLEAN DEFAULT FALSE,
  "order" INTEGER NOT NULL DEFAULT 0
);

-- Projects (portfolio)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'web application',
  date TEXT,
  brief TEXT,
  tools TEXT[] DEFAULT '{}',
  website_url TEXT,
  repo_url TEXT,
  thumbnail_url TEXT,
  screenshot_urls TEXT[] DEFAULT '{}',
  "order" INTEGER NOT NULL DEFAULT 0
);

-- Enable RLS (Row Level Security)
ALTER TABLE about ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Allow public read on all tables
CREATE POLICY "Public read about" ON about FOR SELECT USING (true);
CREATE POLICY "Public read experiences" ON experiences FOR SELECT USING (true);
CREATE POLICY "Public read activities" ON activities FOR SELECT USING (true);
CREATE POLICY "Public read education" ON education FOR SELECT USING (true);
CREATE POLICY "Public read hackathons" ON hackathons FOR SELECT USING (true);
CREATE POLICY "Public read projects" ON projects FOR SELECT USING (true);

-- Supabase Storage bucket for project images
-- Run in Storage section of Supabase dashboard:
-- Create bucket named "project-images" with public access enabled
