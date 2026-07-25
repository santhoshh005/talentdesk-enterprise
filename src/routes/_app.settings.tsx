import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — TalentOS" },
      { name: "description", content: "Workspace, security and integrations." },
    ],
  }),
  component: SettingsLayout,
});

type NavEntry = { to: string; label: string; exact?: boolean };
const nav: NavEntry[] = [
  { to: "/settings", label: "Profile", exact: true },
  { to: "/settings/organization", label: "Organization" },
  { to: "/settings/billing", label: "Billing" },
  { to: "/settings/notifications", label: "Notifications" },
  { to: "/settings/integrations", label: "Integrations" },
  { to: "/settings/security", label: "Security" },
  { to: "/settings/api-keys", label: "API keys" },
  { to: "/settings/roles", label: "Roles" },
  { to: "/settings/audit-logs", label: "Audit logs" },
];

function SettingsLayout() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" description="Manage your workspace, security and integrations." />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
        <nav className="flex flex-col gap-0.5" aria-label="Settings">
          {nav.map((n) => {
            const active = n.exact ? pathname === n.to : pathname === n.to || pathname.startsWith(n.to + "/");
            return (
              <Link
                key={n.to}
                to={n.to as "/settings"}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  active ? "bg-secondary font-medium text-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="min-w-0"><Outlet /></div>
      </div>
    </div>
  );
}