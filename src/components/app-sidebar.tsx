import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  Target,
  PenSquare,
  MessageSquareText,
  Search,
  FlaskConical,
  BarChart3,
  UsersRound,
  Settings,
  LifeBuoy,
  GitBranch,
  ChevronDown,
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
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NavItem = { title: string; url: string; icon: React.ComponentType<{ className?: string }> };

const primary: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Recruitment", url: "/recruitment", icon: GitBranch },
  { title: "Jobs", url: "/jobs", icon: Briefcase },
  { title: "Candidates", url: "/candidates", icon: Users },
];

const aiTools: NavItem[] = [
  { title: "Resume Analyzer", url: "/resume-analyzer", icon: FileText },
  { title: "Candidate Match", url: "/candidate-match", icon: Target },
  { title: "JD Generator", url: "/jd-generator", icon: PenSquare },
  { title: "Interview Generator", url: "/interview-generator", icon: MessageSquareText },
  { title: "Boolean Search", url: "/boolean-search", icon: Search },
  { title: "AI Lab", url: "/ai-lab", icon: FlaskConical },
];

const workspace: NavItem[] = [
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Team", url: "/team", icon: UsersRound },
];

function NavGroup({ label, items, currentPath }: { label: string; items: NavItem[]; currentPath: string }) {
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
                  <Link to={item.url}>
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

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="group flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left hover:bg-sidebar-accent transition-colors">
            <div className="grid size-8 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="size-4" strokeWidth={2.25} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-sidebar-foreground">TalentOS</div>
              <div className="truncate text-[11px] text-muted-foreground">Acme Corporation</div>
            </div>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
            <DropdownMenuItem>Acme Corporation</DropdownMenuItem>
            <DropdownMenuItem>Northwind Talent</DropdownMenuItem>
            <DropdownMenuItem>Globex HR</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Create workspace</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>

      <SidebarContent className="gap-0.5 px-1.5">
        <NavGroup label="Overview" items={primary} currentPath={currentPath} />
        <NavGroup label="AI Tools" items={aiTools} currentPath={currentPath} />
        <NavGroup label="Workspace" items={workspace} currentPath={currentPath} />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-1.5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={currentPath.startsWith("/settings")} className="h-9 rounded-md text-[13.5px] font-medium">
              <Link to="/settings">
                <Settings className="size-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={currentPath.startsWith("/help")} className="h-9 rounded-md text-[13.5px] font-medium">
              <Link to="/help">
                <LifeBuoy className="size-4" />
                <span>Help & docs</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}