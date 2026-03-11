/**
 * Seed script — run once after creating Supabase tables.
 * Usage: npx tsx scripts/seed.ts
 *
 * Required env vars (in .env.local or shell):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

async function seed() {
  console.log("🌱 Seeding database...\n");

  // ---- About ----
  console.log("Seeding about...");
  const { error: aboutError } = await supabase.from("about").upsert({
    id: 1,
    name: "Vishnudev Poil",
    tagline: "Full-Stack Engineer",
    bio: "Self-taught developer based in Ontario, Canada. Obsessed with building systems that scale. I enjoy anime, outdoor activities, English literature, biology, and TV series.",
    location: "Ontario, Canada",
    status: "Available",
    resume_url: "/Vishnudev_s_Resume_Website.pdf",
    social_devpost: "https://devpost.com/VishnudevP",
    social_github: "https://github.com/VishnudevP",
    social_instagram: "https://www.instagram.com/vishnudev_poil/",
    social_linkedin: "https://www.linkedin.com/in/vishnudev-poil/",
  });
  if (aboutError) console.error("About error:", aboutError);
  else console.log("✓ About");

  // ---- Experiences ----
  console.log("\nSeeding experiences...");
  const { error: expError } = await supabase.from("experiences").upsert([
    {
      title: "Full-Stack Developer Intern",
      company: "Ground News",
      start_date: "May 2025",
      end_date: "August 2025",
      description: [
        "Built backend infrastructure for a news aggregation platform serving 50K+ subscribers",
        "Optimized Elasticsearch queries and Redis caching layers reducing latency by 40%",
        "Resolved critical MySQL bottleneck affecting 50K+ subscriber reads",
        "Built bias-scoring module processing 1,000+ stories daily with automated ingestion pipelines",
      ],
      skills: ["TypeScript", "Node.js", "Redis", "Elasticsearch", "MySQL", "CircleCI"],
      result_tags: ["SHIPPED", "OPTIMIZED"],
      order: 1,
    },
    {
      title: "Software Engineering Intern",
      company: "Magnify Digital",
      start_date: "September 2024",
      end_date: "March 2025",
      description: [
        "Built marketing analytics platform features serving 10K+ weekly visitors",
        "Developed Next.js frontend and Node.js APIs for campaign performance dashboards",
        "Built GraphQL ingestion pipelines for multi-source marketing data",
        "Wrote Cypress E2E tests and set up GitHub Actions CI workflows",
      ],
      skills: ["Next.js", "TypeScript", "Node.js", "GraphQL", "Cypress", "GitHub Actions"],
      result_tags: ["SHIPPED", "BUILT"],
      order: 2,
    },
    {
      title: "Software Engineering Intern",
      company: "ShyftLabs",
      start_date: "May 2024",
      end_date: "August 2024",
      description: [
        "Built ad tech dashboard handling 50K+ daily impressions with React/Next.js",
        "Developed Kotlin and Spring Boot microservices for data processing pipeline",
        "Created Node.js and GraphQL REST APIs for dashboard data layer",
        "Built data visualization components with real-time impression tracking",
      ],
      skills: ["React", "Next.js", "Kotlin", "Spring Boot", "Node.js", "GraphQL", "Data Visualization"],
      result_tags: ["BUILT", "SHIPPED"],
      order: 3,
    },
    {
      title: "Full-Stack Developer Intern",
      company: "WENU",
      start_date: "June 2023",
      end_date: "September 2023",
      description: [
        "Integrated Stripe API for PCI-compliant payment processing",
        "Built full-stack features with React.js, PHP, and SQL backend",
        "Set up Cypress testing suite and Sentry error monitoring",
        "Worked in Agile sprints with cross-functional product team",
      ],
      skills: ["React.js", "Stripe API", "PHP", "SQL", "Cypress", "Sentry", "Agile"],
      result_tags: ["SHIPPED", "PATCHED"],
      order: 4,
    },
    {
      title: "Software Engineer Intern",
      company: "Sashido",
      start_date: "August 2021",
      end_date: "November 2021",
      description: [
        "Conducted system testing and delivered structured feedback reports",
        "Built sample application using Google's Teachable Machine ML platform",
        "Created technical tutorial blog posts for developer community",
      ],
      skills: ["Python", "React.js", "Technical Documentation", "Google Teachable Machine"],
      result_tags: ["BUILT"],
      order: 5,
    },
  ]);
  if (expError) console.error("Experiences error:", expError);
  else console.log("✓ Experiences (5)");

  // ---- Activities ----
  console.log("\nSeeding activities...");
  const { error: actError } = await supabase.from("activities").upsert([
    {
      title: "Crowdsupply",
      role: "Full Stack Developer",
      start_date: "March 2020",
      end_date: "April 2021",
      description: "Crowdsourcing platform for real-time grocery stock levels and store queue data during COVID-19. Website: crowdsupply.ca",
      award: null,
      order: 1,
    },
    {
      title: "GTA Hacks",
      role: "Event Organizer",
      start_date: "November 2020",
      end_date: "February 2021",
      description: "Organized a hackathon for high school students across the Greater Toronto Area, sponsored by Google.",
      award: null,
      order: 2,
    },
    {
      title: "Neighbour Network",
      role: "Full Stack Developer / Lead Designer",
      start_date: "January 2021",
      end_date: "January 2021",
      description: "Web app connecting elderly and disabled community members with neighbours for grocery and medication assistance.",
      award: "Blastoff Award — Postman API Hacks 2021",
      order: 3,
    },
    {
      title: "Universal",
      role: "Front-End Developer",
      start_date: "November 2020",
      end_date: "November 2020",
      description: "Personal data transfer platform with third-party request system, two-factor authentication, and unique user codes (UCI).",
      award: "People's Choice — Enactus Windsor Hacks 2020 | Second Overall — Hacks and Crafts 2020",
      order: 4,
    },
    {
      title: "Scare-O-Rator",
      role: "Full Stack Developer / Designer",
      start_date: "October 2020",
      end_date: "October 2020",
      description: "Halloween costume scary-ness scorer using a neural network. Users upload images and receive a confidence-based scare score.",
      award: null,
      order: 5,
    },
    {
      title: "Math-Comm",
      role: "Full Stack Developer / Designer",
      start_date: "October 2020",
      end_date: "October 2020",
      description: "Math forum focused on safe collaborative learning, emphasizing problem-solving approaches over just answers.",
      award: null,
      order: 6,
    },
    {
      title: "Opti-Bot",
      role: "Full Stack Developer / Designer",
      start_date: "August 2020",
      end_date: "August 2020",
      description: "Custom robot creation and battle simulation game using real-world material properties for realistic simulation.",
      award: "Best UI/UX — iZOOM Arena 2020",
      order: 7,
    },
    {
      title: "Colexo",
      role: "Front-End Developer / Designer",
      start_date: "August 2020",
      end_date: "August 2020",
      description: "Collaborative planet modification website with dynamic phases based on water, flora, albedo, and oxygen variables.",
      award: "First Overall — To the Moon and Hack 2020",
      order: 8,
    },
  ]);
  if (actError) console.error("Activities error:", actError);
  else console.log("✓ Activities (8)");

  // ---- Education ----
  console.log("\nSeeding education...");
  const { error: eduError } = await supabase.from("education").upsert([
    {
      institution: "University of Waterloo",
      degree: "Bachelor of Applied Science (BASc), Management Engineering",
      start_date: "September 2022",
      end_date: "Present",
      order: 1,
    },
    {
      institution: "Port Credit Secondary School",
      degree: "High School Diploma",
      start_date: "September 2018",
      end_date: "June 2022",
      order: 2,
    },
  ]);
  if (eduError) console.error("Education error:", eduError);
  else console.log("✓ Education (2)");

  // ---- Hackathons ----
  console.log("\nSeeding hackathons...");
  const { error: hackError } = await supabase.from("hackathons").upsert([
    { event_name: "The Postman API Hack 2021", award: "Blastoff Award", project_name: "Neighbour Network", participated_only: false, order: 1 },
    { event_name: "Hacks and Crafts 2020", award: "Second Overall", project_name: "Universal", participated_only: false, order: 2 },
    { event_name: "Enactus Windsor Hacks 2020", award: "People's Choice Award", project_name: "Universal", participated_only: false, order: 3 },
    { event_name: "iZOOM Arena 2020", award: "Best UI/UX Award", project_name: "Opti-Bot", participated_only: false, order: 4 },
    { event_name: "To the Moon and Hack 2020", award: "First Overall", project_name: "Colexo", participated_only: false, order: 5 },
    { event_name: "Hackrithmitic", award: "Participated", project_name: "Math-Comm", participated_only: true, order: 6 },
  ]);
  if (hackError) console.error("Hackathons error:", hackError);
  else console.log("✓ Hackathons (6)");

  // ---- Projects ----
  console.log("\nSeeding projects...");
  const { error: projError } = await supabase.from("projects").upsert([
    {
      title: "Crowdsupply",
      category: "web application",
      date: "March 2020",
      brief: "Crowdsourcing platform for real-time grocery stock levels and store queue data during COVID-19. Helped thousands find grocery stock in real time.",
      tools: ["HTML", "CSS", "JavaScript"],
      website_url: "http://crowdsupply.ca/",
      repo_url: null,
      thumbnail_url: null,
      screenshot_urls: [],
      order: 1,
    },
    {
      title: "Beacon",
      category: "web application",
      date: "March 2021",
      brief: "Crowdsupply 2.0 — fully open, crowdsourced store data platform showing real-time line lengths and stock availability free for all users.",
      tools: ["React.js", "CSS", "Node.js"],
      website_url: null,
      repo_url: null,
      thumbnail_url: null,
      screenshot_urls: [],
      order: 2,
    },
    {
      title: "Colexo",
      category: "hackathon",
      date: "August 2020",
      brief: "Collaborative planet modification website where users dynamically alter planetary phases based on water levels, flora, albedo, and oxygen variables. First Overall at To the Moon and Hack 2020.",
      tools: ["HTML", "CSS", "JavaScript"],
      website_url: "http://colexo.space/",
      repo_url: null,
      thumbnail_url: null,
      screenshot_urls: [],
      order: 3,
    },
    {
      title: "Universal",
      category: "hackathon",
      date: "November 2020",
      brief: "Personal data transfer platform with third-party request system, two-factor authentication, and unique user codes (UCI). Won People's Choice at Enactus Windsor Hacks 2020.",
      tools: ["HTML", "CSS", "JavaScript"],
      website_url: null,
      repo_url: "https://github.com/harshithl1777/Universal-Main",
      thumbnail_url: null,
      screenshot_urls: [],
      order: 4,
    },
  ]);
  if (projError) console.error("Projects error:", projError);
  else console.log("✓ Projects (4)");

  console.log("\n✅ Seed complete!");
  console.log("\nNote: Update thumbnail_url and screenshot_urls for projects after uploading images to Supabase Storage.");
}

seed().catch(console.error);
