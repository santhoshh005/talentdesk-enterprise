import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({
    meta: [{ title: "User Profile — TalentOS" }],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("Hiring Manager");

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const userInitials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U";
  const orgName = user?.organization?.name || "TalentOS Enterprise";

  const handleSave = () => {
    toast.success("Profile details updated");
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <PageHeader title="User Profile" description="View and manage your personal account details." />

      <Card className="shadow-xs">
        <CardHeader className="pb-3">
          <div>
            <CardTitle className="text-base font-semibold">Account Information</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Your personal account details</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4 border-b border-border pb-5">
            <Avatar className="size-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">{userInitials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-base font-semibold text-foreground">{firstName} {lastName}</div>
              <div className="text-sm text-muted-foreground">{email}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{orgName}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>First name</Label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Last name</Label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Work email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Job title</Label>
              <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button size="sm" onClick={handleSave}>Save changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
