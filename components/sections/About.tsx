"use client";

import { useState } from "react";
import { Github, Linkedin, ExternalLink, Download, Instagram, Briefcase, GraduationCap, Zap } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/cn";
import type { About, Experience, Activity, Education } from "@/lib/types";

interface AboutProps {
  about: About | null;
  experiences: Experience[];
  activities: Activity[];
  education: Education[];
}

type Tab = "timeline" | "activities" | "education";

export function About({ about, experiences, activities, education }: AboutProps) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>("timeline");

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "timeline", label: "Career", icon: <Briefcase className="h-3.5 w-3.5" /> },
    { key: "activities", label: "Activities", icon: <Zap className="h-3.5 w-3.5" /> },
    { key: "education", label: "Education", icon: <GraduationCap className="h-3.5 w-3.5" /> },
  ];

  const specialties = ["TypeScript", "Node.js", "React", "Next.js", "Postgres", "Redis", "Elasticsearch", "GraphQL"];

  return (
    <section id="about" className={cn("relative py-24", theme.page)}>
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHeader
          label="Agent Profile"
          title="About Me"
          subtitle="Self-taught builder with a passion for systems that scale."
        />

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Dossier card */}
          <div className="lg:col-span-4">
            <div className={cn("relative rounded-[28px] overflow-hidden", theme.shell, theme.glow)}>
              <div className={cn("absolute inset-x-0 top-0 h-px bg-gradient-to-r", theme.line)} />

              {/* Profile image */}
              <div className="relative h-48 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/profile-pic.png"
                  alt={about?.name ?? "Vishnudev"}
                  className="h-full w-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className={cn("absolute bottom-3 left-4 text-[10px] uppercase tracking-[0.3em]", theme.accentText)}>
                  ● {about?.status ?? "Available"}
                </div>
              </div>

              <div className="p-5 space-y-3">
                {[
                  { label: "Designation", value: about?.name ?? "Vishnudev Poil" },
                  { label: "Role", value: "Full-Stack Engineer" },
                  { label: "Location", value: about?.location ?? "Ontario, Canada" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between gap-3 text-sm">
                    <span className="text-[11px] uppercase tracking-[0.2em] text-white/40">{label}</span>
                    <span className="text-right text-white/80">{value}</span>
                  </div>
                ))}

                <div className={cn("my-2 h-px", "bg-white/10")} />

                <div>
                  <div className="mb-2 text-[11px] uppercase tracking-[0.2em] text-white/40">Specialties</div>
                  <div className="flex flex-wrap gap-1.5">
                    {specialties.map((s) => (
                      <span key={s} className={cn("rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.15em]", theme.soft)}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {about?.bio && (
                  <>
                    <div className={cn("my-2 h-px", "bg-white/10")} />
                    <div>
                      <div className="mb-2 text-[11px] uppercase tracking-[0.2em] text-white/40">Playstyle</div>
                      <p className="text-sm leading-7 text-white/65">{about.bio}</p>
                    </div>
                  </>
                )}

                <div className={cn("my-2 h-px", "bg-white/10")} />

                {/* Social links */}
                <div className="flex items-center gap-3">
                  {about?.social_github && (
                    <a href={about.social_github} target="_blank" rel="noopener noreferrer"
                      className="text-white/50 transition-colors hover:text-white">
                      <Github className="h-4 w-4" />
                    </a>
                  )}
                  {about?.social_linkedin && (
                    <a href={about.social_linkedin} target="_blank" rel="noopener noreferrer"
                      className="text-white/50 transition-colors hover:text-white">
                      <Linkedin className="h-4 w-4" />
                    </a>
                  )}
                  {about?.social_instagram && (
                    <a href={about.social_instagram} target="_blank" rel="noopener noreferrer"
                      className="text-white/50 transition-colors hover:text-white">
                      <Instagram className="h-4 w-4" />
                    </a>
                  )}
                  {about?.social_devpost && (
                    <a href={about.social_devpost} target="_blank" rel="noopener noreferrer"
                      className="text-white/50 transition-colors hover:text-white">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>

                {/* Resume button */}
                {about?.resume_url && (
                  <a
                    href={about.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-200",
                      theme.button
                    )}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download Resume
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Tab content */}
          <div className="lg:col-span-8">
            {/* Tab nav */}
            <div className={cn("mb-6 flex gap-2 rounded-2xl p-1.5", theme.soft)}>
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition-all duration-200",
                    activeTab === tab.key
                      ? theme.accentSoft
                      : "text-white/50 hover:text-white/80"
                  )}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Timeline tab */}
            {activeTab === "timeline" && (
              <div className="space-y-4">
                {experiences.map((exp) => (
                  <div
                    key={exp.id}
                    className={cn(
                      "relative rounded-[22px] border-l-4 p-5 transition-all duration-200",
                      theme.panel,
                      theme.borderAccent
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="font-display text-lg font-bold uppercase text-white">{exp.company}</div>
                        <div className={cn("text-sm font-medium", theme.accentText)}>{exp.title}</div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {exp.result_tags?.map((tag) => (
                          <span key={tag} className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em]", theme.accentSoft)}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-white/40">
                      {exp.start_date} — {exp.end_date}
                    </div>
                    <ul className="mt-3 space-y-1.5">
                      {exp.description?.map((bullet, i) => (
                        <li key={i} className="flex gap-2 text-sm text-white/65">
                          <span className={cn("mt-2 h-1 w-1 flex-none rounded-full", theme.accentText.replace("text-", "bg-"))} />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {exp.skills?.map((skill) => (
                        <span key={skill} className={cn("rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.15em]", theme.soft)}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Activities tab */}
            {activeTab === "activities" && (
              <div className="space-y-4">
                {activities.map((act) => (
                  <div
                    key={act.id}
                    className={cn(
                      "relative rounded-[22px] border-l-4 p-5",
                      theme.panel,
                      theme.borderAccent
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="font-display text-lg font-bold uppercase text-white">{act.title}</div>
                        <div className={cn("text-sm font-medium", theme.accentText)}>{act.role}</div>
                      </div>
                      {act.award && (
                        <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em]", theme.accentSoft)}>
                          🏅 {act.award}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-white/40">
                      {act.start_date}{act.end_date && act.end_date !== act.start_date ? ` — ${act.end_date}` : ""}
                    </div>
                    {act.description && (
                      <p className="mt-2 text-sm leading-7 text-white/65">{act.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Education tab */}
            {activeTab === "education" && (
              <div className="space-y-4">
                {education.map((edu) => (
                  <div
                    key={edu.id}
                    className={cn(
                      "relative rounded-[22px] border-l-4 p-5",
                      theme.panel,
                      theme.borderAccent
                    )}
                  >
                    <div className="font-display text-lg font-bold uppercase text-white">{edu.institution}</div>
                    <div className={cn("mt-1 text-sm font-medium", theme.accentText)}>{edu.degree}</div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-white/40">
                      {edu.start_date} — {edu.end_date}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
