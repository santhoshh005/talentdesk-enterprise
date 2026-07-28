import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  Target,
  PenSquare,
  MessageSquareText,
  User,
  Plus,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

type Item = { label: string; to: string; icon: React.ComponentType<{ className?: string }> };

const navItems: Item[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Jobs", to: "/jobs", icon: Briefcase },
  { label: "Candidates", to: "/candidates", icon: Users },
  { label: "Resume Analyzer", to: "/resume-analyzer", icon: FileText },
  { label: "Candidate Match", to: "/candidate-match", icon: Target },
  { label: "JD Generator", to: "/jd-generator", icon: PenSquare },
  { label: "Interview Generator", to: "/interview-generator", icon: MessageSquareText },
  { label: "Profile", to: "/profile", icon: User },
];

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const go = (to: string) => {
    onOpenChange(false);
    navigate({ to });
  };
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search candidates, jobs, actions…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Quick actions">
          <CommandItem onSelect={() => go("/jobs")}>
            <Plus className="size-4" />
            <span>Create new job</span>
            <CommandShortcut>N</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go("/candidates")}>
            <Plus className="size-4" />
            <span>Add candidate</span>
          </CommandItem>
          <CommandItem onSelect={() => go("/resume-analyzer")}>
            <FileText className="size-4" />
            <span>Analyze resume</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigation">
          {navItems.map((i) => (
            <CommandItem key={i.to} onSelect={() => go(i.to)}>
              <i.icon className="size-4" />
              <span>{i.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return { open, setOpen };
}
