import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Box, Calendar, Link as LinkIcon, MessageSquare, Video, Briefcase } from "lucide-react";

export const Route = createFileRoute("/_app/settings/integrations")({
  component: IntegrationsSettings,
});

const integrations = [
  { name: "Slack", description: "Receive notifications and update candidate statuses from Slack.", icon: MessageSquare },
  { name: "Google Calendar", description: "Schedule interviews and sync availability automatically.", icon: Calendar },
  { name: "LinkedIn Recruiter", description: "Import candidates directly from LinkedIn profiles.", icon: LinkIcon },
  { name: "Microsoft Teams", description: "Schedule and conduct video interviews via Teams.", icon: Box },
  { name: "Zoom", description: "Generate Zoom meeting links for candidate interviews.", icon: Video },
  { name: "Greenhouse", description: "Sync job postings and candidate data.", icon: Briefcase },
];

function IntegrationsSettings() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {integrations.map((integration) => (
        <Card key={integration.name} className="shadow-xs flex flex-col h-full">
          <CardContent className="p-5 flex flex-col h-full">
            <div className="flex items-start gap-4 mb-4">
              <div className="grid size-10 shrink-0 place-items-center rounded-md bg-secondary text-foreground">
                <integration.icon className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{integration.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{integration.description}</p>
              </div>
            </div>
            <div className="mt-auto pt-4 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => toast("Coming soon")}>
                Connect
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
