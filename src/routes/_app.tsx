import { useState } from "react";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";
import { CommandPalette, useCommandPalette } from "@/components/command-palette";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { open, setOpen } = useCommandPalette();
  const [defaultOpen] = useState(true);
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <AppTopbar onOpenPalette={() => setOpen(true)} />
        <main className="flex-1">
          <div className="mx-auto w-full max-w-[1400px] px-6 py-6 lg:px-8 lg:py-8">
            <Outlet />
          </div>
        </main>
        <CommandPalette open={open} onOpenChange={setOpen} />
      </SidebarInset>
    </SidebarProvider>
  );
}