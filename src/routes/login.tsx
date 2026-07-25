import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — TalentOS" },
      { name: "description", content: "Sign in to your TalentOS workspace." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your TalentOS workspace."
      footer={<>Don't have an account? <Link to="/signup" className="font-medium text-primary hover:underline">Create one</Link></>}
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setLoading(true);
          setTimeout(() => navigate({ to: "/dashboard" }), 400);
        }}
      >
        <div className="space-y-1.5"><Label htmlFor="email">Work email</Label><Input id="email" type="email" placeholder="you@company.com" required autoComplete="email" /></div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">Forgot?</Link>
          </div>
          <Input id="password" type="password" required autoComplete="current-password" />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox /> Keep me signed in
        </label>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</Button>
        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center"><span className="bg-background px-2 text-xs text-muted-foreground">or</span></div>
        </div>
        <Button type="button" variant="outline" className="w-full">Continue with SSO</Button>
      </form>
    </AuthShell>
  );
}