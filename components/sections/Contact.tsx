"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/cn";

export function Contact() {
  const { theme } = useTheme();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("https://formspree.io/f/mjvjvyod", {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setStatus("sent");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="contact" className={cn("relative py-24", theme.page)}>
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-px bg-gradient-to-r",
          theme.line
        )}
      />

      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHeader
          label="Queue Up"
          title="Ready for the Next Mission?"
          subtitle="Let's build something together."
        />

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Left column */}
          <div className={cn("rounded-[28px] p-8", theme.shell)}>
            <div className={cn("mb-2 text-[11px] uppercase tracking-[0.3em]", theme.accentText)}>
              Direct line
            </div>
            <h3 className="font-display text-2xl font-black uppercase text-white">
              Get In Touch
            </h3>
            <p className="mt-3 text-sm leading-7 text-white/60">
              Whether you have a role, a project, or just want to connect — drop a message and I'll get back to you.
            </p>

            <div className="mt-6 space-y-3">
              {[
                { label: "Location", value: "Ontario, Canada" },
                { label: "Availability", value: "Open to opportunities" },
                { label: "Response", value: "Within 24 hours" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between border-b border-white/[0.06] pb-3 text-sm">
                  <span className="text-[11px] uppercase tracking-[0.2em] text-white/40">{label}</span>
                  <span className={cn("font-medium", theme.accentText)}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-[0.25em] text-white/40">Name</label>
                <input
                  name="name"
                  required
                  className={cn(
                    "w-full rounded-2xl border-0 border-b bg-transparent py-3 text-sm text-white placeholder-white/25 outline-none transition-all duration-200 focus:border-b-2",
                    "border-white/10 focus:border-current",
                    theme.accentText
                  )}
                  placeholder="Vishnudev Poil"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-[0.25em] text-white/40">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  className={cn(
                    "w-full rounded-2xl border-0 border-b bg-transparent py-3 text-sm text-white placeholder-white/25 outline-none transition-all duration-200 focus:border-b-2",
                    "border-white/10 focus:border-current",
                    theme.accentText
                  )}
                  placeholder="hello@example.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-[0.25em] text-white/40">Subject</label>
              <input
                name="subject"
                required
                className={cn(
                  "w-full rounded-2xl border-0 border-b bg-transparent py-3 text-sm text-white placeholder-white/25 outline-none transition-all duration-200 focus:border-b-2",
                  "border-white/10 focus:border-current",
                  theme.accentText
                )}
                placeholder="Let's work together"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-[0.25em] text-white/40">Message</label>
              <textarea
                name="message"
                required
                rows={5}
                className={cn(
                  "w-full resize-none rounded-2xl border bg-transparent p-4 text-sm text-white placeholder-white/25 outline-none transition-all duration-200 focus:border-2",
                  theme.soft,
                  "focus:border-current",
                  theme.accentText
                )}
                placeholder="Tell me about your project or opportunity..."
              />
            </div>

            <button
              type="submit"
              disabled={status === "sending" || status === "sent"}
              className={cn(
                "clip-corner-sm flex w-full items-center justify-center gap-2 rounded-none py-4 text-xs font-black uppercase tracking-[0.25em] transition-all duration-200 disabled:opacity-60",
                theme.button
              )}
            >
              {status === "sending" ? (
                "Sending..."
              ) : status === "sent" ? (
                "Message Sent ✓"
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Send Message
                </>
              )}
            </button>

            {status === "error" && (
              <p className="text-center text-xs text-red-400">
                Something went wrong. Try again or email me directly.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
