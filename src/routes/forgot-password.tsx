import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset password — TalentOS" },
      { name: "description", content: "Recover access to your TalentOS account." },
    ],
  }),
  component: ForgotPage,
});

function ForgotPage() {
  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={<><Link to="/login" className="font-medium text-primary hover:underline">Back to sign in</Link></>}
    >
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-1.5"><Label>Work email</Label><Input type="email" required autoComplete="email" /></div>
        <Button type="submit" className="w-full">Send reset link</Button>
      </form>
    </AuthShell>
  );
}