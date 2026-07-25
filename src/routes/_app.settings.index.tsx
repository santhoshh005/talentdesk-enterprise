import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Route = createFileRoute("/_app/settings/")({
  component: ProfileSettings,
});

function ProfileSettings() {
  return (
    <div className="flex flex-col gap-4">
      <Card className="shadow-xs">
        <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Profile</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar className="size-14"><AvatarFallback className="bg-primary text-primary-foreground">AR</AvatarFallback></Avatar>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Upload</Button>
              <Button variant="ghost" size="sm">Remove</Button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5"><Label>First name</Label><Input defaultValue="Alex" /></div>
            <div className="space-y-1.5"><Label>Last name</Label><Input defaultValue="Rivera" /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input defaultValue="alex@acmecorp.com" /></div>
            <div className="space-y-1.5"><Label>Job title</Label><Input defaultValue="Head of Talent" /></div>
          </div>
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button variant="outline" size="sm">Cancel</Button>
            <Button size="sm">Save changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}