import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings/")({
  component: ProfileSettings,
});

function ProfileSettings() {
  const { user } = useAuth();
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("Head of Talent");

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const userInitials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U";

  const handleSave = () => {
    toast.success("Profile updated");
  };

  const handleCancel = () => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
      setJobTitle("Head of Talent");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="shadow-xs">
        <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Profile</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar className="size-14"><AvatarFallback className="bg-primary text-primary-foreground">{userInitials}</AvatarFallback></Avatar>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Upload</Button>
              <Button variant="ghost" size="sm">Remove</Button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5"><Label>First name</Label><Input value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Last name</Label><Input value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Job title</Label><Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} /></div>
          </div>
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button variant="outline" size="sm" onClick={handleCancel}>Cancel</Button>
            <Button size="sm" onClick={handleSave}>Save changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}