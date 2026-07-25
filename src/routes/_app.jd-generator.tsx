import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, History, Save, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_app/jd-generator")({
  head: () => ({
    meta: [
      { title: "JD Generator — TalentOS" },
      { name: "description", content: "Draft structured, inclusive job descriptions with AI." },
    ],
  }),
  component: JDGen,
});

const jdText = `Senior Product Designer

About the role
We're hiring a Senior Product Designer to shape the next generation of our platform. You'll partner closely with product and engineering to design end-to-end experiences that feel effortless.

What you'll do
• Lead design for a core product area from discovery to ship
• Contribute to and evolve our design system
• Run research studies and translate insights into design decisions
• Collaborate with engineering on quality of implementation

What we're looking for
• 6+ years designing complex B2B or consumer products
• Fluent in Figma, prototyping, and design systems
• Strong systems thinking and craft
• Experience running lightweight user research

What we offer
• Remote-friendly across EU time zones
• Competitive salary and equity
• Learning budget and top-tier equipment
• 30 days of paid leave
`;

function JDGen() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="JD Generator"
        description="Draft structured, inclusive job descriptions in seconds."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5"><History className="size-4" /> History</Button>
            <Button variant="outline" size="sm" className="gap-1.5"><Save className="size-4" /> Save draft</Button>
            <Button size="sm" className="gap-1.5"><Sparkles className="size-4" /> Generate</Button>
          </>
        }
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 shadow-xs h-fit">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Role details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5"><Label>Job title</Label><Input defaultValue="Senior Product Designer" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Department</Label>
                <Select defaultValue="design"><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="design">Design</SelectItem><SelectItem value="eng">Engineering</SelectItem><SelectItem value="prod">Product</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Level</Label>
                <Select defaultValue="sr"><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="jr">Junior</SelectItem><SelectItem value="mid">Mid</SelectItem><SelectItem value="sr">Senior</SelectItem><SelectItem value="staff">Staff</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5"><Label>Location</Label><Input defaultValue="Remote · EU" /></div>
            <div className="space-y-1.5"><Label>Employment type</Label>
              <Select defaultValue="ft"><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="ft">Full-time</SelectItem><SelectItem value="pt">Part-time</SelectItem><SelectItem value="contract">Contract</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Must-have skills</Label>
              <div className="flex flex-wrap gap-1.5 rounded-md border border-input p-2">
                {["Figma","Design systems","Prototyping","User research"].map(s=><Badge key={s} variant="secondary" className="rounded-full">{s}</Badge>)}
              </div>
            </div>
            <div className="space-y-1.5"><Label>Tone</Label>
              <Select defaultValue="clear"><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="clear">Clear & professional</SelectItem><SelectItem value="friendly">Warm & inclusive</SelectItem><SelectItem value="concise">Concise</SelectItem></SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold">Generated description</CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="gap-1.5"><Copy className="size-4" /> Copy</Button>
              <Button variant="ghost" size="sm" className="gap-1.5"><Download className="size-4" /> Export</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea className="min-h-[520px] resize-none border-border font-normal leading-relaxed" defaultValue={jdText} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}