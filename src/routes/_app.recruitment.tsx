import { createFileRoute } from "@tanstack/react-router";
import { Plus, Filter } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Route = createFileRoute("/_app/recruitment")({
  head: () => ({
    meta: [
      { title: "Recruitment — TalentOS" },
      { name: "description", content: "Kanban pipeline of active candidates by stage." },
    ],
  }),
  component: RecruitmentPage,
});

const columns = [
  { name: "Applied", count: 42, items: [
    { name: "Yara Haddad", role: "PM, Growth", score: 76 },
    { name: "Nadia Rahimi", role: "Data Scientist", score: 79 },
    { name: "Kenji Watanabe", role: "Frontend Engineer", score: 71 },
  ]},
  { name: "Screening", count: 18, items: [
    { name: "Marcus Chen", role: "Staff Backend Engineer", score: 88 },
    { name: "Liam O'Sullivan", role: "iOS Engineer", score: 84 },
  ]},
  { name: "Interview", count: 12, items: [
    { name: "Priya Menon", role: "Sr Product Designer", score: 92 },
    { name: "David Park", role: "Engineering Manager", score: 81 },
    { name: "Tomás Ribeiro", role: "DevOps Engineer", score: 87 },
  ]},
  { name: "Offer", count: 4, items: [{ name: "Sofia Alvarez", role: "Head of Data", score: 95 }]},
  { name: "Hired", count: 3, items: [{ name: "Ana Costa", role: "Recruiter", score: 90 }]},
];

function RecruitmentPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Recruitment pipeline"
        description="Drag candidates across stages, or click a card to open their profile."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5"><Filter className="size-4" /> Filter</Button>
            <Button size="sm" className="gap-1.5"><Plus className="size-4" /> Add candidate</Button>
          </>
        }
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {columns.map((col) => (
          <div key={col.name} className="flex flex-col gap-2 rounded-lg bg-secondary/50 p-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{col.name}</span>
                <Badge variant="secondary" className="rounded-full bg-background px-1.5 text-[10px]">{col.count}</Badge>
              </div>
              <Button variant="ghost" size="icon" className="size-6"><Plus className="size-3.5" /></Button>
            </div>
            <div className="flex flex-col gap-2">
              {col.items.map((c) => (
                <Card key={c.name} className="shadow-xs cursor-pointer transition hover:border-primary/40">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="size-7"><AvatarFallback className="bg-background text-[10px]">{c.name.split(" ").map((n)=>n[0]).join("")}</AvatarFallback></Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{c.name}</div>
                        <div className="truncate text-xs text-muted-foreground">{c.role}</div>
                      </div>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Match</span>
                      <span className="font-medium tabular-nums text-foreground">{c.score}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}