import { Search, Command as CommandIcon, Sun, Moon, User } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function AppTopbar({ onOpenPalette }: { onOpenPalette: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark") || 
        localStorage.getItem("theme") === "dark";
    }
    return false;
  });

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    const root = document.documentElement;
    if (nextDark) {
      root.classList.add("dark");
      root.classList.remove("light");
      localStorage.setItem("theme", "dark");
      toast.success("Switched to Dark mode");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      toast.success("Switched to Light mode");
    }
  };

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  const userInitials = user ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() : "U";
  const fullName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "User";
  const email = user?.email || "";

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <SidebarTrigger className="-ml-1 size-8" />
      <Separator orientation="vertical" className="h-5" />
      <button
        onClick={onOpenPalette}
        className="hidden md:flex h-9 w-[340px] items-center gap-2 rounded-md border border-border bg-secondary/60 px-3 text-left text-sm text-muted-foreground transition hover:bg-secondary"
      >
        <Search className="size-4" />
        <span className="flex-1 truncate">Search or jump to…</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <CommandIcon className="size-3" />K
        </kbd>
      </button>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" className="size-9 md:hidden" onClick={onOpenPalette} aria-label="Search">
          <Search className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-9 rounded-md transition-colors"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={isDark ? "Switch to Light mode" : "Switch to Dark mode"}
        >
          {isDark ? <Sun className="size-4 text-warning" /> : <Moon className="size-4 text-muted-foreground" />}
        </Button>
        <Separator orientation="vertical" className="mx-1 h-5" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-md p-1 pl-1.5 hover:bg-secondary transition-colors cursor-pointer" aria-label="Account menu">
              <Avatar className="size-7">
                <AvatarFallback className="bg-primary text-primary-foreground text-[11px] font-medium">{userInitials}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{fullName}</span>
              <span className="text-xs font-normal text-muted-foreground">{email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate({ to: "/profile" })} className="gap-2">
              <User className="size-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}