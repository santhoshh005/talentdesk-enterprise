import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Filter, Search, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_app/candidate-match")({
  head: () => ({
    meta: [
      { title: "Candidate Match — TalentOS" },
      { name: "description", content: "Rank candidates against a role using AI matching." },
    ],
  }),
  component: MatchPage,
});

const rows = [
  { name: "Sofia Alvarez", role: "Head of Data", skills: ["Snowflake","dbt","Leadership"], exp: "13y", loc: "London", edu: "PhD", salary: "$220k", score: 95 },
  { name: "Priya Menon", role: "Sr Product Designer", skills: ["Figma","DS"], exp: "8y", loc: "Berlin", edu: "MSc", salary: "€110k", score: 92 },
  { name: "Marcus Chen", role: "Staff Backend", skills: ["Go","Kafka"], exp: "11y", loc: "NYC", edu: "BSc", salary: "$210k", score: 88 },
  { name: "Tomás Ribeiro", role: "DevOps", skills: ["K8s","Terraform"], exp: "9y", loc: "Lisbon", edu: "BSc", salary: "€90k", score: 87 },
  { name: "Liam O'Sullivan", role: "iOS Engineer", skills: ["Swift"], exp: "7y", loc: "Dublin", edu: "BSc", salary: "€95k", score: 84 },
  { name: "David Park", role: "Eng Manager", skills: ["Leadership","Node"], exp: "10y", loc: "Remote", edu: "MSc", salary: "$205k", score: 81 },
];

function MatchPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Candidate matching"
        description="AI-ranked candidates for a specific role. Filter, sort and shortlist."
        actions={<Button size="sm" className="gap-1.5"><Sparkles className="size-4" /> Re-run match</Button>}
      />
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search candidates…" className="pl-8" />
        </div>
        {[
          ["Role", ["Sr Product Designer","Staff Backend","Head of Data"]],
          ["Status", ["Any","Available","Passive"]],
          ["Location", ["Any","Remote","US","EU"]],
          ["Experience", ["Any","0-3y","3-7y","7y+"]],
        ].map(([label, items]) => (
          <Select key={label as string}>
            <SelectTrigger className="w-[160px] h-9"><SelectValue placeholder={label as string} /></SelectTrigger>
            <SelectContent>{(items as string[]).map((i)=><SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
          </Select>
        ))}
        <Button variant="outline" size="sm" className="gap-1.5 h-9"><Filter className="size-4" /> More</Button>
      </div>
      <Card className="shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Candidate</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Education</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead className="text-right">Match score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.name}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-7"><AvatarFallback className="bg-secondary text-[10px]">{r.name.split(" ").map(n=>n[0]).join("")}</AvatarFallback></Avatar>
                      <div>
                        <div className="text-sm font-medium">{r.name}</div>
                        <div className="text-xs text-muted-foreground">{r.role}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">{r.skills.map(s=><Badge key={s} variant="secondary" className="rounded-full px-2 py-0 text-[10px]">{s}</Badge>)}</div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.exp}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.loc}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.edu}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.salary}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-2">
                      <div className="h-1 w-16 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full bg-primary" style={{ width: `${r.score}%` }} />
                      </div>
                      <span className="text-sm font-medium tabular-nums">{r.score}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}