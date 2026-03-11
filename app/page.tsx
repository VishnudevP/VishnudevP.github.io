export const dynamic = "force-dynamic";

import { createServerClient } from "@/lib/supabase";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { CareerLog } from "@/components/sections/CareerLog";
import { StatsPanel } from "@/components/sections/StatsPanel";
import { ProjectLoadout } from "@/components/sections/ProjectLoadout";
import { Contact } from "@/components/sections/Contact";
import type {
  About as AboutType,
  Experience,
  Activity,
  Education,
  Project,
} from "@/lib/types";

async function getData() {
  const supabase = createServerClient();

  const [aboutRes, experiencesRes, activitiesRes, educationRes, projectsRes] =
    await Promise.all([
      supabase.from("about").select("*").single(),
      supabase.from("experiences").select("*").order("order"),
      supabase.from("activities").select("*").order("order"),
      supabase.from("education").select("*").order("order"),
      supabase.from("projects").select("*").order("order"),
    ]);

  return {
    about: (aboutRes.data as AboutType | null) ?? null,
    experiences: (experiencesRes.data as Experience[]) ?? [],
    activities: (activitiesRes.data as Activity[]) ?? [],
    education: (educationRes.data as Education[]) ?? [],
    projects: (projectsRes.data as Project[]) ?? [],
  };
}

export default async function Home() {
  const { about, experiences, activities, education, projects } =
    await getData();

  return (
    <main>
      <Navbar />
      <Hero about={about} />
      <StatsPanel />
      <About
        about={about}
        experiences={experiences}
        activities={activities}
        education={education}
      />
      <CareerLog experiences={experiences} />
      <ProjectLoadout projects={projects} />
      <Contact />
    </main>
  );
}
