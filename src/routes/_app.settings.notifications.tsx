import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings/notifications")({
  component: NotificationSettings,
});

function NotificationSettings() {
  const handleToggle = (name: string) => (checked: boolean) => {
    toast.success(`${name} notifications ${checked ? "enabled" : "disabled"}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Delivery Methods</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email notifications</Label>
              <p className="text-xs text-muted-foreground">Receive updates via email.</p>
            </div>
            <Switch defaultChecked onCheckedChange={handleToggle("Email")} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push notifications</Label>
              <p className="text-xs text-muted-foreground">Receive updates via browser push.</p>
            </div>
            <Switch onCheckedChange={handleToggle("Push")} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>In-app notifications</Label>
              <p className="text-xs text-muted-foreground">Receive updates within the application.</p>
            </div>
            <Switch defaultChecked onCheckedChange={handleToggle("In-app")} />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Notification Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weekly digest</Label>
              <p className="text-xs text-muted-foreground">A summary of your workspace activity.</p>
            </div>
            <Switch defaultChecked onCheckedChange={handleToggle("Weekly digest")} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Candidate stage changes</Label>
              <p className="text-xs text-muted-foreground">When a candidate is moved in the pipeline.</p>
            </div>
            <Switch defaultChecked onCheckedChange={handleToggle("Candidate stage changes")} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Interview reminders</Label>
              <p className="text-xs text-muted-foreground">Reminders before scheduled interviews.</p>
            </div>
            <Switch defaultChecked onCheckedChange={handleToggle("Interview reminders")} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>New applications</Label>
              <p className="text-xs text-muted-foreground">When a new candidate applies to a job.</p>
            </div>
            <Switch defaultChecked onCheckedChange={handleToggle("New applications")} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
