"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut, Plus, Pencil, Trash2, Save, X,
  User, Briefcase, Zap, GraduationCap, Trophy, FolderKanban,
} from "lucide-react";
import type {
  About, Experience, Activity, Education, Hackathon, Project,
} from "@/lib/types";

type Tab = "about" | "experiences" | "activities" | "education" | "hackathons" | "projects";

// ---- small reusable form field ----
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] uppercase tracking-[0.2em] text-white/40">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-[#e7dfc6]/40 transition-colors";
const textareaCls = inputCls + " resize-none";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("about");

  // Data states
  const [about, setAbout] = useState<About | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Edit states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Record<string, unknown>>({});
  const [addingNew, setAddingNew] = useState(false);
  const [newData, setNewData] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const fetchData = useCallback(async () => {
    const endpoints: Record<Tab, string> = {
      about: "/api/about",
      experiences: "/api/experiences",
      activities: "/api/activities",
      education: "/api/education",
      hackathons: "/api/hackathons",
      projects: "/api/projects",
    };
    const res = await fetch(endpoints[activeTab]);
    const data = await res.json();
    if (activeTab === "about") setAbout(data);
    else if (activeTab === "experiences") setExperiences(data);
    else if (activeTab === "activities") setActivities(data);
    else if (activeTab === "education") setEducation(data);
    else if (activeTab === "hackathons") setHackathons(data);
    else if (activeTab === "projects") setProjects(data);
  }, [activeTab]);

  useEffect(() => {
    setEditingId(null);
    setAddingNew(false);
    fetchData();
  }, [activeTab, fetchData]);

  const notify = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin");
  };

  // ---- About save ----
  const saveAbout = async () => {
    setSaving(true);
    await fetch("/api/about", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editingData) });
    setSaving(false);
    setEditingId(null);
    fetchData();
    notify("About updated!");
  };

  // ---- Generic CRUD ----
  const startEdit = (item: Record<string, unknown>) => {
    setEditingId(item.id as string);
    setEditingData({ ...item });
    setAddingNew(false);
  };

  const cancelEdit = () => { setEditingId(null); setEditingData({}); };

  const saveEdit = async (table: string) => {
    setSaving(true);
    await fetch(`/api/${table}/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingData),
    });
    setSaving(false);
    setEditingId(null);
    fetchData();
    notify("Saved!");
  };

  const deleteItem = async (table: string, id: string) => {
    if (!confirm("Delete this entry?")) return;
    await fetch(`/api/${table}/${id}`, { method: "DELETE" });
    fetchData();
    notify("Deleted.");
  };

  const saveNew = async (table: string) => {
    setSaving(true);
    await fetch(`/api/${table}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newData),
    });
    setSaving(false);
    setAddingNew(false);
    setNewData({});
    fetchData();
    notify("Created!");
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "about", label: "About", icon: <User className="h-4 w-4" /> },
    { key: "experiences", label: "Experiences", icon: <Briefcase className="h-4 w-4" /> },
    { key: "activities", label: "Activities", icon: <Zap className="h-4 w-4" /> },
    { key: "education", label: "Education", icon: <GraduationCap className="h-4 w-4" /> },
    { key: "hackathons", label: "Hackathons", icon: <Trophy className="h-4 w-4" /> },
    { key: "projects", label: "Projects", icon: <FolderKanban className="h-4 w-4" /> },
  ];

  // ---- Inline edit form builders ----
  const ExperienceForm = ({ data, setData }: { data: Record<string, unknown>; setData: (d: Record<string, unknown>) => void }) => (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Company"><input className={inputCls} value={(data.company as string) ?? ""} onChange={e => setData({ ...data, company: e.target.value })} /></Field>
      <Field label="Title"><input className={inputCls} value={(data.title as string) ?? ""} onChange={e => setData({ ...data, title: e.target.value })} /></Field>
      <Field label="Start Date"><input className={inputCls} value={(data.start_date as string) ?? ""} onChange={e => setData({ ...data, start_date: e.target.value })} placeholder="May 2025" /></Field>
      <Field label="End Date"><input className={inputCls} value={(data.end_date as string) ?? ""} onChange={e => setData({ ...data, end_date: e.target.value })} placeholder="August 2025" /></Field>
      <div className="sm:col-span-2">
        <Field label="Description (one bullet per line)">
          <textarea className={textareaCls} rows={4} value={((data.description as string[]) ?? []).join("\n")} onChange={e => setData({ ...data, description: e.target.value.split("\n") })} />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Skills (comma separated)">
          <input className={inputCls} value={((data.skills as string[]) ?? []).join(", ")} onChange={e => setData({ ...data, skills: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Result Tags (comma separated, e.g. SHIPPED,OPTIMIZED)">
          <input className={inputCls} value={((data.result_tags as string[]) ?? []).join(", ")} onChange={e => setData({ ...data, result_tags: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} />
        </Field>
      </div>
      <Field label="Order"><input type="number" className={inputCls} value={(data.order as number) ?? 0} onChange={e => setData({ ...data, order: parseInt(e.target.value) })} /></Field>
    </div>
  );

  const ActivityForm = ({ data, setData }: { data: Record<string, unknown>; setData: (d: Record<string, unknown>) => void }) => (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Title"><input className={inputCls} value={(data.title as string) ?? ""} onChange={e => setData({ ...data, title: e.target.value })} /></Field>
      <Field label="Role"><input className={inputCls} value={(data.role as string) ?? ""} onChange={e => setData({ ...data, role: e.target.value })} /></Field>
      <Field label="Start Date"><input className={inputCls} value={(data.start_date as string) ?? ""} onChange={e => setData({ ...data, start_date: e.target.value })} /></Field>
      <Field label="End Date"><input className={inputCls} value={(data.end_date as string) ?? ""} onChange={e => setData({ ...data, end_date: e.target.value })} /></Field>
      <div className="sm:col-span-2">
        <Field label="Description">
          <textarea className={textareaCls} rows={3} value={(data.description as string) ?? ""} onChange={e => setData({ ...data, description: e.target.value })} />
        </Field>
      </div>
      <Field label="Award (optional)"><input className={inputCls} value={(data.award as string) ?? ""} onChange={e => setData({ ...data, award: e.target.value || null })} /></Field>
      <Field label="Order"><input type="number" className={inputCls} value={(data.order as number) ?? 0} onChange={e => setData({ ...data, order: parseInt(e.target.value) })} /></Field>
    </div>
  );

  const EducationForm = ({ data, setData }: { data: Record<string, unknown>; setData: (d: Record<string, unknown>) => void }) => (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Field label="Institution"><input className={inputCls} value={(data.institution as string) ?? ""} onChange={e => setData({ ...data, institution: e.target.value })} /></Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Degree"><input className={inputCls} value={(data.degree as string) ?? ""} onChange={e => setData({ ...data, degree: e.target.value })} /></Field>
      </div>
      <Field label="Start Date"><input className={inputCls} value={(data.start_date as string) ?? ""} onChange={e => setData({ ...data, start_date: e.target.value })} /></Field>
      <Field label="End Date"><input className={inputCls} value={(data.end_date as string) ?? ""} onChange={e => setData({ ...data, end_date: e.target.value })} /></Field>
      <Field label="Order"><input type="number" className={inputCls} value={(data.order as number) ?? 0} onChange={e => setData({ ...data, order: parseInt(e.target.value) })} /></Field>
    </div>
  );

  const HackathonForm = ({ data, setData }: { data: Record<string, unknown>; setData: (d: Record<string, unknown>) => void }) => (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Event Name"><input className={inputCls} value={(data.event_name as string) ?? ""} onChange={e => setData({ ...data, event_name: e.target.value })} /></Field>
      <Field label="Project Name"><input className={inputCls} value={(data.project_name as string) ?? ""} onChange={e => setData({ ...data, project_name: e.target.value })} /></Field>
      <Field label="Award"><input className={inputCls} value={(data.award as string) ?? ""} onChange={e => setData({ ...data, award: e.target.value })} /></Field>
      <Field label="Participated Only?">
        <select className={inputCls} value={(data.participated_only as boolean) ? "true" : "false"} onChange={e => setData({ ...data, participated_only: e.target.value === "true" })}>
          <option value="false">No (won award)</option>
          <option value="true">Yes (participated only)</option>
        </select>
      </Field>
      <Field label="Order"><input type="number" className={inputCls} value={(data.order as number) ?? 0} onChange={e => setData({ ...data, order: parseInt(e.target.value) })} /></Field>
    </div>
  );

  const ProjectForm = ({ data, setData }: { data: Record<string, unknown>; setData: (d: Record<string, unknown>) => void }) => (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Title"><input className={inputCls} value={(data.title as string) ?? ""} onChange={e => setData({ ...data, title: e.target.value })} /></Field>
      <Field label="Category">
        <select className={inputCls} value={(data.category as string) ?? ""} onChange={e => setData({ ...data, category: e.target.value })}>
          <option value="web application">Web Application</option>
          <option value="hackathon">Hackathon</option>
          <option value="personal project">Personal Project</option>
          <option value="ongoing">Ongoing</option>
        </select>
      </Field>
      <Field label="Date"><input className={inputCls} value={(data.date as string) ?? ""} onChange={e => setData({ ...data, date: e.target.value })} placeholder="March 2021" /></Field>
      <Field label="Order"><input type="number" className={inputCls} value={(data.order as number) ?? 0} onChange={e => setData({ ...data, order: parseInt(e.target.value) })} /></Field>
      <div className="sm:col-span-2">
        <Field label="Brief">
          <textarea className={textareaCls} rows={3} value={(data.brief as string) ?? ""} onChange={e => setData({ ...data, brief: e.target.value })} />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Tools (comma separated)">
          <input className={inputCls} value={((data.tools as string[]) ?? []).join(", ")} onChange={e => setData({ ...data, tools: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} />
        </Field>
      </div>
      <Field label="Website URL"><input className={inputCls} value={(data.website_url as string) ?? ""} onChange={e => setData({ ...data, website_url: e.target.value || null })} placeholder="https://..." /></Field>
      <Field label="Repo URL"><input className={inputCls} value={(data.repo_url as string) ?? ""} onChange={e => setData({ ...data, repo_url: e.target.value || null })} placeholder="https://github.com/..." /></Field>
      <div className="sm:col-span-2">
        <Field label="Thumbnail URL">
          <input className={inputCls} value={(data.thumbnail_url as string) ?? ""} onChange={e => setData({ ...data, thumbnail_url: e.target.value || null })} placeholder="https://...supabase.co/storage/..." />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Screenshot URLs (one per line)">
          <textarea className={textareaCls} rows={3} value={((data.screenshot_urls as string[]) ?? []).join("\n")} onChange={e => setData({ ...data, screenshot_urls: e.target.value.split("\n").map(s => s.trim()).filter(Boolean) })} />
        </Field>
      </div>
    </div>
  );

  const renderForm = (data: Record<string, unknown>, setData: (d: Record<string, unknown>) => void) => {
    if (activeTab === "experiences") return <ExperienceForm data={data} setData={setData} />;
    if (activeTab === "activities") return <ActivityForm data={data} setData={setData} />;
    if (activeTab === "education") return <EducationForm data={data} setData={setData} />;
    if (activeTab === "hackathons") return <HackathonForm data={data} setData={setData} />;
    if (activeTab === "projects") return <ProjectForm data={data} setData={setData} />;
    return null;
  };

  const currentList = (): Array<Record<string, unknown>> => {
    if (activeTab === "experiences") return experiences as unknown as Array<Record<string, unknown>>;
    if (activeTab === "activities") return activities as unknown as Array<Record<string, unknown>>;
    if (activeTab === "education") return education as unknown as Array<Record<string, unknown>>;
    if (activeTab === "hackathons") return hackathons as unknown as Array<Record<string, unknown>>;
    if (activeTab === "projects") return projects as unknown as Array<Record<string, unknown>>;
    return [];
  };

  const getItemTitle = (item: Record<string, unknown>) => {
    if (activeTab === "experiences") return `${item.company} — ${item.title}`;
    if (activeTab === "activities") return item.title as string;
    if (activeTab === "education") return item.institution as string;
    if (activeTab === "hackathons") return `${item.event_name} (${item.project_name})`;
    if (activeTab === "projects") return item.title as string;
    return "";
  };

  return (
    <div className="min-h-screen bg-[#0d1016] font-sans text-white">
      {/* Background grid */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:40px_40px] opacity-50" />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#121722]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <div className="font-display text-xl font-black uppercase tracking-widest text-white">
              VP <span className="text-[#f0e8d0]">//</span> Admin
            </div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/30">Control Panel</div>
          </div>
          <div className="flex items-center gap-3">
            {message && (
              <span className="rounded-full border border-[#e7dfc6]/30 bg-[#e7dfc6]/10 px-3 py-1 text-[11px] text-[#f0e8d0]">
                {message}
              </span>
            )}
            <a href="/" target="_blank" className="text-[11px] uppercase tracking-[0.2em] text-white/40 hover:text-white/70">
              View Site ↗
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-white/60 transition-colors hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Tab nav */}
        <div className="mb-8 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition-all duration-200 ${
                activeTab === tab.key
                  ? "border border-[#e7dfc6]/30 bg-[#e7dfc6]/10 text-[#f0e8d0]"
                  : "border border-white/10 bg-white/[0.03] text-white/50 hover:text-white/80"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* About tab */}
        {activeTab === "about" && about && (
          <div className="rounded-[28px] border border-white/10 bg-[#121722] p-7">
            <div className="mb-5 flex items-center justify-between">
              <div className="font-display text-xl font-black uppercase text-white">Site Info</div>
              {editingId !== "about" ? (
                <button
                  onClick={() => { setEditingId("about"); setEditingData({ ...about }); }}
                  className="flex items-center gap-2 rounded-2xl border border-[#e7dfc6]/30 bg-[#e7dfc6]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#f0e8d0]"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={saveAbout} disabled={saving} className="flex items-center gap-2 rounded-2xl border border-[#e7dfc6]/30 bg-[#e7dfc6]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#f0e8d0] disabled:opacity-60">
                    <Save className="h-3.5 w-3.5" /> {saving ? "Saving..." : "Save"}
                  </button>
                  <button onClick={cancelEdit} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/60">
                    <X className="h-3.5 w-3.5" /> Cancel
                  </button>
                </div>
              )}
            </div>

            {editingId === "about" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name"><input className={inputCls} value={(editingData.name as string) ?? ""} onChange={e => setEditingData({ ...editingData, name: e.target.value })} /></Field>
                <Field label="Tagline"><input className={inputCls} value={(editingData.tagline as string) ?? ""} onChange={e => setEditingData({ ...editingData, tagline: e.target.value })} /></Field>
                <div className="sm:col-span-2">
                  <Field label="Bio">
                    <textarea className={textareaCls} rows={3} value={(editingData.bio as string) ?? ""} onChange={e => setEditingData({ ...editingData, bio: e.target.value })} />
                  </Field>
                </div>
                <Field label="Location"><input className={inputCls} value={(editingData.location as string) ?? ""} onChange={e => setEditingData({ ...editingData, location: e.target.value })} /></Field>
                <Field label="Status"><input className={inputCls} value={(editingData.status as string) ?? ""} onChange={e => setEditingData({ ...editingData, status: e.target.value })} /></Field>
                <Field label="Resume URL"><input className={inputCls} value={(editingData.resume_url as string) ?? ""} onChange={e => setEditingData({ ...editingData, resume_url: e.target.value })} /></Field>
                <Field label="GitHub URL"><input className={inputCls} value={(editingData.social_github as string) ?? ""} onChange={e => setEditingData({ ...editingData, social_github: e.target.value })} /></Field>
                <Field label="LinkedIn URL"><input className={inputCls} value={(editingData.social_linkedin as string) ?? ""} onChange={e => setEditingData({ ...editingData, social_linkedin: e.target.value })} /></Field>
                <Field label="DevPost URL"><input className={inputCls} value={(editingData.social_devpost as string) ?? ""} onChange={e => setEditingData({ ...editingData, social_devpost: e.target.value })} /></Field>
                <Field label="Instagram URL"><input className={inputCls} value={(editingData.social_instagram as string) ?? ""} onChange={e => setEditingData({ ...editingData, social_instagram: e.target.value })} /></Field>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(about).filter(([k]) => k !== "id").map(([key, val]) => (
                  <div key={key} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-white/30">{key}</div>
                    <div className="mt-1 truncate text-sm text-white/80">{String(val ?? "—")}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* List tabs */}
        {activeTab !== "about" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div className="font-display text-xl font-black uppercase text-white">
                {tabs.find(t => t.key === activeTab)?.label}
              </div>
              {!addingNew && (
                <button
                  onClick={() => { setAddingNew(true); setNewData({ order: currentList().length }); setEditingId(null); }}
                  className="flex items-center gap-2 rounded-2xl border border-[#e7dfc6]/30 bg-[#e7dfc6]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#f0e8d0]"
                >
                  <Plus className="h-3.5 w-3.5" /> Add New
                </button>
              )}
            </div>

            {/* Add new form */}
            {addingNew && (
              <div className="mb-5 rounded-[24px] border border-[#e7dfc6]/20 bg-[#121722] p-6">
                <div className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-[#f0e8d0]">New Entry</div>
                {renderForm(newData, setNewData)}
                <div className="mt-5 flex gap-2">
                  <button onClick={() => saveNew(activeTab)} disabled={saving} className="flex items-center gap-2 rounded-2xl border border-[#e7dfc6]/30 bg-[#e7dfc6]/10 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-[#f0e8d0] disabled:opacity-60">
                    <Save className="h-3.5 w-3.5" /> {saving ? "Saving..." : "Create"}
                  </button>
                  <button onClick={() => { setAddingNew(false); setNewData({}); }} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs text-white/60">
                    <X className="h-3.5 w-3.5" /> Cancel
                  </button>
                </div>
              </div>
            )}

            {/* List */}
            <div className="space-y-3">
              {currentList().map((item) => (
                <div
                  key={item.id as string}
                  className="rounded-[24px] border border-white/10 bg-[#121722] p-5"
                >
                  {editingId === item.id ? (
                    <>
                      {renderForm(editingData, setEditingData)}
                      <div className="mt-4 flex gap-2">
                        <button onClick={() => saveEdit(activeTab)} disabled={saving} className="flex items-center gap-2 rounded-2xl border border-[#e7dfc6]/30 bg-[#e7dfc6]/10 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-[#f0e8d0] disabled:opacity-60">
                          <Save className="h-3.5 w-3.5" /> {saving ? "Saving..." : "Save"}
                        </button>
                        <button onClick={cancelEdit} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs text-white/60">
                          <X className="h-3.5 w-3.5" /> Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-semibold text-white">{getItemTitle(item)}</div>
                        <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-white/30">
                          Order: {item.order as number}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-none">
                        <button
                          onClick={() => startEdit(item)}
                          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/60 transition-colors hover:text-white"
                        >
                          <Pencil className="h-3 w-3" /> Edit
                        </button>
                        <button
                          onClick={() => deleteItem(activeTab, item.id as string)}
                          className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-400 transition-colors hover:bg-red-500/20"
                        >
                          <Trash2 className="h-3 w-3" /> Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
