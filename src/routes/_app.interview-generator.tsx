import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Download, Pencil, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_app/interview-generator")({
  head: () => ({
    meta: [
      { title: "Interview Generator — TalentOS" },
      { name: "description", content: "Generate structured interview kits by category and difficulty." },
    ],
  }),
  component: InterviewGen,
});

const questions = {
  behavioral: [
    "Tell me about a time you had to influence without authority.",
    "Describe a project where you had to change direction based on feedback.",
    "Give an example of a disagreement with a peer and how you resolved it.",
  ],
  technical: [
    "Walk through the architecture of a system you designed end-to-end.",
    "How would you migrate a monolith to services without downtime?",
    "Explain a non-trivial data model you've built and its trade-offs.",
  ],
  situational: [
    "A shipped feature is causing a 15% drop in conversion — what do you do first?",
    "You've missed a deadline. How do you communicate this to stakeholders?",
    "Two engineers disagree on architecture. How do you unblock them?",
  ],
};

function InterviewGen() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Interview Generator"
        description="Generate role-specific, structured interview kits."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5"><Download className="size-4" /> Export PDF</Button>
            <Button size="sm" className="gap-1.5"><Sparkles className="size-4" /> Regenerate</Button>
          </>
        }
      />
      <Card className="shadow-xs">
        <CardContent className="grid grid-cols-1 gap-4 p-5 md:grid-cols-4">
          <div className="space-y-1.5"><Label>Role</Label><Input defaultValue="Senior Product Designer" /></div>
          <div className="space-y-1.5"><Label>Seniority</Label>
            <Select defaultValue="sr"><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="jr">Junior</SelectItem><SelectItem value="mid">Mid</SelectItem><SelectItem value="sr">Senior</SelectItem><SelectItem value="staff">Staff</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Difficulty</Label>
            <Select defaultValue="hard"><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="easy">Easy</SelectItem><SelectItem value="med">Medium</SelectItem><SelectItem value="hard">Hard</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Duration</Label>
            <Select defaultValue="45"><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="30">30 min</SelectItem><SelectItem value="45">45 min</SelectItem><SelectItem value="60">60 min</SelectItem></SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-xs">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Question bank</CardTitle></CardHeader>
        <CardContent>
          <Tabs defaultValue="behavioral">
            <TabsList>
              <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
              <TabsTrigger value="situational">Situational</TabsTrigger>
            </TabsList>
            {(["behavioral","technical","situational"] as const).map((k) => (
              <TabsContent key={k} value={k} className="mt-4 space-y-2">
                {questions[k].map((q, i) => (
                  <div key={i} className="group flex items-start gap-3 rounded-md border border-border p-3 transition hover:border-primary/30">
                    <Badge variant="secondary" className="mt-0.5 rounded-full">{i+1}</Badge>
                    <p className="flex-1 text-sm">{q}</p>
                    <Button variant="ghost" size="icon" className="size-8 opacity-0 group-hover:opacity-100"><Pencil className="size-4" /></Button>
                  </div>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}