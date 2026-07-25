import { createFileRoute } from "@tanstack/react-router";
import { useOrganization, useUpdateOrgSettings } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/_app/settings/organization")({
  component: OrganizationSettings,
});

function OrganizationSettings() {
  const { data: org, isLoading } = useOrganization();
  const updateSettings = useUpdateOrgSettings();
  
  const [aiProvider, setAiProvider] = useState("openai");
  const [careerTheme, setCareerTheme] = useState("light");

  useEffect(() => {
    if (org?.settings) {
      if (org.settings.aiProvider) setAiProvider(org.settings.aiProvider);
      if (org.settings.careerPageTheme) setCareerTheme(org.settings.careerPageTheme);
    }
  }, [org]);

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync({
        aiProvider,
        careerPageTheme: careerTheme,
      });
      toast.success("Organization settings updated");
    } catch (error) {
      toast.error("Failed to update settings");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Organization Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-muted-foreground">Organization Name</Label>
            <div className="font-medium mt-1">{org?.name}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Departments</Label>
              <ul className="mt-1 list-disc pl-4 text-sm">
                {org?.departments?.map((d: any) => (
                  <li key={d.id || d.name || d}>{d.name || d}</li>
                )) || <li>None</li>}
              </ul>
            </div>
            <div>
              <Label className="text-muted-foreground">Locations</Label>
              <ul className="mt-1 list-disc pl-4 text-sm">
                {org?.locations?.map((l: any) => (
                  <li key={l.id || l.city || l}>{l.city ? `${l.city}, ${l.country}` : l}</li>
                )) || <li>None</li>}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label>AI Provider Preference</Label>
            <Select value={aiProvider} onValueChange={setAiProvider}>
              <SelectTrigger className="w-[300px]"><SelectValue placeholder="Select provider" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
                <SelectItem value="gemini">Google Gemini</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1.5">
            <Label>Career Page Theme</Label>
            <Select value={careerTheme} onValueChange={setCareerTheme}>
              <SelectTrigger className="w-[300px]"><SelectValue placeholder="Select theme" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <Button size="sm" onClick={handleSave} disabled={updateSettings.isPending}>
              {updateSettings.isPending ? "Saving..." : "Save preferences"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
