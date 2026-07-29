import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  Target,
  PenSquare,
  User,
  Sparkles,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";

type NavItem = { title: string; url: string; icon: React.ComponentType<{ className?: string }> };

const primary: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Jobs", url: "/jobs", icon: Briefcase },
  { title: "Candidates", url: "/candidates", icon: Users },
];

const aiTools: NavItem[] = [
  { title: "Resume Analyzer", url: "/resume-analyzer", icon: FileText },
  { title: "Candidate Match", url: "/candidate-match", icon: Target },
  { title: "JD Generator", url: "/jd-generator", icon: PenSquare },
];

function NavGroup({
  label,
  items,
  currentPath,
}: {
  label: string;
  items: NavItem[];
  currentPath: string;
}) {
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active = currentPath === item.url || currentPath.startsWith(item.url + "/");
            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  className="h-9 gap-2.5 rounded-md text-[13.5px] font-medium data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-primary"
                >
                  <Link to={item.url} onClick={() => setOpenMobile(false)}>
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const { user } = useAuth();
  const { setOpenMobile } = useSidebar();

  const orgName = user?.organization?.name || "TalentOS Enterprise";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-3">
        <div className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left">
          <div className="grid size-8 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground shadow-xs">
            <Sparkles className="size-4" strokeWidth={2.25} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold text-sidebar-foreground tracking-tight">
              TalentOS
            </div>
            <div className="truncate text-[11px] text-muted-foreground font-medium">{orgName}</div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-0.5 px-1.5">
        <NavGroup label="Overview" items={primary} currentPath={currentPath} />
        <NavGroup label="AI Tools" items={aiTools} currentPath={currentPath} />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-1.5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={currentPath.startsWith("/profile")}
              className="h-9 rounded-md text-[13.5px] font-medium"
            >
              <Link to="/profile" onClick={() => setOpenMobile(false)}>
                <User className="size-4" />
                <span>Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
