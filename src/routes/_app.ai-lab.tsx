import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, Mail, MessageSquare, Mic, ScanSearch, Sparkles, Wand2 } from "lucide-react";

export const Route = createFileRoute("/_app/ai-lab")({
  head: () => ({
    meta: [
      { title: "AI Lab — TalentOS" },
      { name: "description", content: "Experimental AI tools for recruiters. Clearly labeled beta." },
    ],
  }),
  component: AILab,
});

const experiments = [
  { icon: Bot, title: "Screening co-pilot", desc: "Auto-screen inbound applications with configurable criteria." },
  { icon: Mail, title: "Outreach writer", desc: "Personalized cold outreach for passive candidates." },
  { icon: Mic, title: "Interview transcriber", desc: "Transcribe and summarize interviews with action items." },
  { icon: ScanSearch, title: "Bias review", desc: "Flag potentially biased language in JDs and feedback." },
  { icon: MessageSquare, title: "Candidate chatbot", desc: "24/7 FAQ chat for candidates on your careers page." },
  { icon: Wand2, title: "Offer optimizer", desc: "Suggest offer components based on market data." },
];

function AILab() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="AI Lab" description="Experimental tools we're building. Give feedback and help shape what ships." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {experiments.map((e) => (
          <Card key={e.title} className="shadow-xs transition hover:border-primary/30">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="grid size-9 place-items-center rounded-md bg-primary/10 text-primary">
                <e.icon className="size-4" />
              </div>
              <Badge variant="secondary" className="rounded-full bg-warning/10 text-warning text-[10px]">Beta</Badge>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-sm font-semibold">{e.title}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{e.desc}</p>
              <Button variant="ghost" size="sm" className="mt-3 -ml-2 gap-1 text-primary hover:text-primary">
                Try it <ArrowRight className="size-3.5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="shadow-xs bg-secondary/40">
        <CardContent className="flex items-center gap-4 p-5">
          <Sparkles className="size-5 text-primary" />
          <div className="flex-1">
            <div className="text-sm font-semibold">Have an idea for a new tool?</div>
            <div className="text-sm text-muted-foreground">Submit a proposal and our team will review it in the next sprint.</div>
          </div>
          <Button size="sm">Submit idea</Button>
        </CardContent>
      </Card>
    </div>
  );
}