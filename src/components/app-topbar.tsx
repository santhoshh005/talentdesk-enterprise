import { Bell, Search, HelpCircle, Command as CommandIcon } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

export function AppTopbar({ onOpenPalette }: { onOpenPalette: () => void }) {
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
      <div className="ml-auto flex items-center gap-1.5">
        <Button variant="ghost" size="icon" className="size-9 md:hidden" onClick={onOpenPalette} aria-label="Search">
          <Search className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" className="size-9" aria-label="Help">
          <HelpCircle className="size-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative size-9" aria-label="Notifications">
              <Bell className="size-4" />
              <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-primary" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              <Badge variant="secondary" className="rounded-full text-[10px]">3 new</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {[
              ["Priya Menon accepted your interview invite", "2m ago"],
              ["New application: Senior Backend Engineer", "18m ago"],
              ["Weekly hiring report is ready", "1h ago"],
            ].map(([t, when]) => (
              <DropdownMenuItem key={t} className="flex-col items-start gap-0.5 py-2.5">
                <span className="text-sm font-medium text-foreground">{t}</span>
                <span className="text-xs text-muted-foreground">{when}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Separator orientation="vertical" className="mx-1 h-5" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-md p-1 pl-1.5 hover:bg-secondary transition-colors" aria-label="Account menu">
              <Avatar className="size-7">
                <AvatarFallback className="bg-primary text-primary-foreground text-[11px] font-medium">AR</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">Alex Rivera</span>
              <span className="text-xs font-normal text-muted-foreground">alex@acmecorp.com</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Keyboard shortcuts</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}