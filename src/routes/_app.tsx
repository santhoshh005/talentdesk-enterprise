import { useState, useEffect } from "react";
import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";
import { CommandPalette, useCommandPalette } from "@/components/command-palette";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_app")({
  component: AppLayoutWithGuard,
});

function AppLayoutWithGuard() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isLoading && !isAuthenticated) {
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      if (!token) {
        navigate({ to: "/login" });
      }
    }
  }, [isMounted, isLoading, isAuthenticated, navigate]);

  if (!isMounted || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading TalentOS…</p>
        </div>
      </div>
    );
  }

  return <AppLayout />;
}

function AppLayout() {
  const { open, setOpen } = useCommandPalette();
  const [defaultOpen] = useState(true);
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <AppTopbar onOpenPalette={() => setOpen(true)} />
        <main className="flex-1">
          <div className="mx-auto w-full max-w-[1400px] px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <Outlet />
          </div>
        </main>
        <CommandPalette open={open} onOpenChange={setOpen} />
      </SidebarInset>
    </SidebarProvider>
  );
}
