import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your workspace — TalentOS" },
      { name: "description", content: "Start hiring smarter with TalentOS." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  return (
    <AuthShell
      title="Create your workspace"
      subtitle="Start your 14-day free trial. No credit card required."
      footer={<>Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link></>}
    >
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); navigate({ to: "/dashboard" }); }}>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>First name</Label><Input required autoComplete="given-name" /></div>
          <div className="space-y-1.5"><Label>Last name</Label><Input required autoComplete="family-name" /></div>
        </div>
        <div className="space-y-1.5"><Label>Work email</Label><Input type="email" required autoComplete="email" /></div>
        <div className="space-y-1.5"><Label>Company</Label><Input required /></div>
        <div className="space-y-1.5"><Label>Password</Label><Input type="password" required autoComplete="new-password" /></div>
        <Button type="submit" className="w-full">Create workspace</Button>
        <p className="text-xs text-muted-foreground">By continuing you agree to our Terms and Privacy Policy.</p>
      </form>
    </AuthShell>
  );
}