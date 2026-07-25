import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
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
    <div className="min-h-dvh grid grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col justify-between px-6 py-10 sm:px-10">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="size-4" strokeWidth={2.25} />
          </div>
          <span className="text-sm font-semibold tracking-tight">TalentOS</span>
        </Link>
        <div className="mx-auto w-full max-w-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer ? <div className="mt-6 text-sm text-muted-foreground">{footer}</div> : null}
        </div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} TalentOS, Inc.</p>
      </div>
      <div className="hidden lg:flex bg-secondary/60 border-l border-border">
        <div className="m-auto max-w-md px-8">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm leading-relaxed text-foreground">
              "TalentOS replaced four tools in our stack. Our team-to-hire time dropped 34% in the first quarter."
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary text-sm font-medium">SM</div>
              <div>
                <div className="text-sm font-medium">Sarah Mitchell</div>
                <div className="text-xs text-muted-foreground">VP People, Northwind</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}