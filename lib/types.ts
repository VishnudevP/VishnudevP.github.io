export interface About {
  id: number;
  name: string;
  tagline: string;
  bio: string;
  location: string;
  status: string;
  resume_url: string;
  social_devpost: string;
  social_github: string;
  social_instagram: string;
  social_linkedin: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  start_date: string;
  end_date: string;
  description: string[];
  skills: string[];
  result_tags: string[];
  order: number;
}

export interface Activity {
  id: string;
  title: string;
  role: string;
  start_date: string;
  end_date: string;
  description: string;
  award: string | null;
  order: number;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  start_date: string;
  end_date: string;
  order: number;
}

export interface Hackathon {
  id: string;
  event_name: string;
  award: string;
  project_name: string;
  participated_only: boolean;
  order: number;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  date: string;
  brief: string;
  tools: string[];
  website_url: string | null;
  repo_url: string | null;
  thumbnail_url: string | null;
  screenshot_urls: string[];
  order: number;
}
