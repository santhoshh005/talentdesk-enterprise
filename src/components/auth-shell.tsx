import type { ReactNode } from "react";
import { Sparkles, CheckCircle2, Zap, Target, Bot } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-dvh grid grid-cols-1 lg:grid-cols-12 bg-background">
      {/* Form Section */}
      <div className="lg:col-span-5 flex flex-col justify-between px-6 py-10 sm:px-12 xl:px-16 z-10 border-r border-border/50">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/25 transition-transform group-hover:scale-105">
              <Sparkles className="size-5" strokeWidth={2.25} />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-foreground">TalentOS</span>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                Enterprise
              </span>
            </div>
          </Link>
        </div>

        <div className="mx-auto w-full max-w-sm my-auto py-8">
          <div className="space-y-1.5 mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">{subtitle}</p>
          </div>

          <div className="space-y-4">{children}</div>

          {footer ? (
            <div className="mt-8 text-center text-sm text-muted-foreground">{footer}</div>
          ) : null}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-4">
          <span>© {new Date().getFullYear()} TalentOS, Inc.</span>
          <span className="flex items-center gap-1.5 text-success font-medium">
            <span className="size-2 rounded-full bg-success animate-pulse" /> All Systems
            Operational
          </span>
        </div>
      </div>

      {/* Hero Visual Section */}
      <div className="hidden lg:col-span-7 lg:flex relative overflow-hidden bg-slate-950 text-white flex-col justify-between p-12">
        {/* Background Glowing Gradients */}
        <div className="absolute -top-32 -right-32 size-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute top-1/2 -left-20 size-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-20 right-1/4 size-96 rounded-full bg-purple-500/20 blur-3xl" />

        {/* Top Header Tag */}
        <div className="relative z-10 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200 backdrop-blur-md">
            <Sparkles className="size-3.5 text-primary" /> AI-Powered Talent Intelligence
          </span>
        </div>

        {/* Center Interactive Feature Showcase */}
        <div className="relative z-10 my-auto max-w-lg space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
              Streamline hiring with instant AI resume analysis & candidate matching.
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Automate resume evaluations, job description generation, and candidate scoring in a
              single unified workspace.
            </p>
          </div>

          {/* Floating Feature Cards */}
          <div className="grid grid-cols-1 gap-3">
            {[
              {
                icon: Zap,
                title: "Instant Resume Parser",
                desc: "0ms extraction of skills, experience, and executive AI summaries",
                badge: "0ms Speed",
              },
              {
                icon: Target,
                title: "AI Candidate Matching",
                desc: "Rank candidates accurately against your open positions",
                badge: "98% Accuracy",
              },
              {
                icon: Bot,
                title: "Automated Interview Kits",
                desc: "Generate tailored interview questions & evaluation rubrics in seconds",
                badge: "Automated",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group relative flex items-start gap-3.5 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-all hover:border-primary/40 hover:bg-white/10 shadow-lg shadow-black/20"
              >
                <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/20 text-primary border border-primary/30">
                  <f.icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">{f.title}</span>
                    <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-medium text-primary-foreground border border-primary/30">
                      {f.badge}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-6 pt-2 border-t border-white/10">
            <div>
              <div className="text-xl font-bold text-white">3.4x</div>
              <div className="text-[11px] text-slate-400">Faster Time-to-Hire</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <div className="text-xl font-bold text-white">100%</div>
              <div className="text-[11px] text-slate-400">Free Enterprise Workspace</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <div className="text-xl font-bold text-white">0ms</div>
              <div className="text-[11px] text-slate-400">Instant AI Parsing</div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400">
          <span>TalentOS Enterprise Suite</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="size-3 text-success" /> Secure & Encryption Protected
          </span>
        </div>
      </div>
    </div>
  );
}
