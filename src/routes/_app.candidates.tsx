import { createFileRoute } from "@tanstack/react-router";
import { Plus, Filter, Download, MoreHorizontal, Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_app/candidates")({
  head: () => ({
    meta: [
      { title: "Candidates — TalentOS" },
      { name: "description", content: "Search, filter and manage every candidate in your talent pool." },
    ],
  }),
  component: CandidatesPage,
});

const rows = [
  { name: "Priya Menon", role: "Senior Product Designer", loc: "Berlin", exp: "8y", skills: ["Figma", "Design Systems"], score: 92, stage: "Interview" },
  { name: "Marcus Chen", role: "Staff Backend Engineer", loc: "New York", exp: "11y", skills: ["Go", "Kafka", "AWS"], score: 88, stage: "Screening" },
  { name: "Sofia Alvarez", role: "Head of Data", loc: "London", exp: "13y", skills: ["Snowflake", "dbt"], score: 95, stage: "Offer" },
  { name: "David Park", role: "Engineering Manager", loc: "Remote", exp: "10y", skills: ["Leadership", "Node"], score: 81, stage: "Interview" },
  { name: "Yara Haddad", role: "PM, Growth", loc: "SF", exp: "6y", skills: ["SQL", "Experimentation"], score: 76, stage: "Applied" },
  { name: "Liam O'Sullivan", role: "iOS Engineer", loc: "Dublin", exp: "7y", skills: ["Swift", "SwiftUI"], score: 84, stage: "Screening" },
  { name: "Nadia Rahimi", role: "Data Scientist", loc: "Toronto", exp: "5y", skills: ["Python", "PyTorch"], score: 79, stage: "Applied" },
  { name: "Tomás Ribeiro", role: "DevOps Engineer", loc: "Lisbon", exp: "9y", skills: ["Kubernetes", "Terraform"], score: 87, stage: "Interview" },
];

const stageColor: Record<string, string> = {
  Applied: "bg-secondary text-secondary-foreground",
  Screening: "bg-warning/10 text-warning",
  Interview: "bg-primary/10 text-primary",
  Offer: "bg-success/10 text-success",
};

function CandidatesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Candidates"
        description="A single view of every candidate across roles and pipelines."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5"><Download className="size-4" /> Export</Button>
            <Button size="sm" className="gap-1.5"><Plus className="size-4" /> Add candidate</Button>
          </>
        }
      />
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name, skill, role…" className="pl-8" />
        </div>
        {[
          { label: "Stage", items: ["All stages", "Applied", "Screening", "Interview", "Offer"] },
          { label: "Location", items: ["Any location", "Remote", "US", "EU"] },
          { label: "Experience", items: ["Any", "0-3y", "3-7y", "7y+"] },
        ].map((f) => (
          <Select key={f.label}>
            <SelectTrigger className="w-[160px] h-9"><SelectValue placeholder={f.label} /></SelectTrigger>
            <SelectContent>{f.items.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
          </Select>
        ))}
        <Button variant="outline" size="sm" className="gap-1.5 h-9"><Filter className="size-4" /> More filters</Button>
      </div>
      <Card className="shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10"><Checkbox aria-label="Select all" /></TableHead>
                <TableHead>Candidate</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead className="text-right">Match</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.name}>
                  <TableCell><Checkbox aria-label={`Select ${r.name}`} /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-7"><AvatarFallback className="bg-secondary text-[10px]">{r.name.split(" ").map((n)=>n[0]).join("")}</AvatarFallback></Avatar>
                      <span className="text-sm font-medium">{r.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.role}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.loc}</TableCell>
                  <TableCell className="text-sm text-muted-foreground tabular-nums">{r.exp}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {r.skills.map((s) => <Badge key={s} variant="secondary" className="rounded-full px-2 py-0 text-[10px] font-normal">{s}</Badge>)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`rounded-full px-2 py-0.5 text-[11px] ${stageColor[r.stage]}`}>{r.stage}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium tabular-nums">{r.score}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="size-8"><MoreHorizontal className="size-4" /></Button>
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