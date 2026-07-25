import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Monitor, Smartphone } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_app/settings/security")({
  component: SecuritySettings,
});

function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    toast.success("Password updated successfully");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handle2FAToggle = (checked: boolean) => {
    toast.success(`Two-factor authentication ${checked ? "enabled" : "disabled"}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
            <div className="space-y-1.5">
              <Label htmlFor="current">Current password</Label>
              <Input id="current" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new">New password</Label>
              <Input id="new" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirm new password</Label>
              <Input id="confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            <Button type="submit" size="sm">Update password</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Two-Factor Authentication</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="space-y-0.5 max-w-[80%]">
            <Label className="text-base">Require 2FA</Label>
            <p className="text-sm text-muted-foreground">Add an extra layer of security to your account by requiring a verification code in addition to your password.</p>
          </div>
          <Switch onCheckedChange={handle2FAToggle} />
        </CardContent>
      </Card>

      <Card className="shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Active Sessions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-md bg-secondary text-foreground">
                <Monitor className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Windows • Chrome</p>
                <p className="text-xs text-muted-foreground">New York, USA • Current session</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" disabled>Active</Button>
          </div>
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-md bg-secondary text-foreground">
                <Smartphone className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium">iOS • Safari</p>
                <p className="text-xs text-muted-foreground">New York, USA • Last active 2h ago</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => toast("Session revoked")}>Revoke</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
