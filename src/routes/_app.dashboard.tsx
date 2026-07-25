import { createFileRoute } from "@tanstack/react-router";
import { Plus, Download, Briefcase, UserPlus, CalendarClock, TrendingUp, ArrowUpRight, ArrowDownRight, MoreHorizontal, FileText, Target, PenSquare } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip as ReTooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — TalentOS" },
      { name: "description", content: "Hiring overview, pipeline, and recent activity." },
    ],
  }),
  component: Dashboard,
});

const stats = [
  { label: "Open positions", value: "34", delta: "+4", trend: "up", hint: "vs last week" },
  { label: "Applications today", value: "127", delta: "+18%", trend: "up", hint: "vs yesterday" },
  { label: "In pipeline", value: "1,284", delta: "+62", trend: "up", hint: "this month" },
  { label: "Upcoming interviews", value: "18", delta: "-2", trend: "down", hint: "next 7 days" },
];

const chartData = [
  { d: "Mon", applied: 42, hired: 3 },
  { d: "Tue", applied: 58, hired: 4 },
  { d: "Wed", applied: 71, hired: 5 },
  { d: "Thu", applied: 64, hired: 6 },
  { d: "Fri", applied: 89, hired: 8 },
  { d: "Sat", applied: 34, hired: 2 },
  { d: "Sun", applied: 27, hired: 1 },
];

const pipeline = [
  { stage: "Applied", count: 482, pct: 100 },
  { stage: "Screening", count: 214, pct: 44 },
  { stage: "Interview", count: 96, pct: 20 },
  { stage: "Offer", count: 28, pct: 6 },
  { stage: "Hired", count: 12, pct: 2 },
];

const candidates = [
  { name: "Priya Menon", role: "Senior Product Designer", stage: "Interview", score: 92, updated: "2h ago" },
  { name: "Marcus Chen", role: "Staff Backend Engineer", stage: "Screening", score: 88, updated: "4h ago" },
  { name: "Sofia Alvarez", role: "Head of Data", stage: "Offer", score: 95, updated: "yesterday" },
  { name: "David Park", role: "Engineering Manager", stage: "Interview", score: 81, updated: "yesterday" },
  { name: "Yara Haddad", role: "Product Manager, Growth", stage: "Applied", score: 76, updated: "2d ago" },
];

const activity = [
  { who: "Alex Rivera", what: "moved Priya Menon to Interview", when: "2m ago" },
  { who: "Jordan Lee", what: "created job Senior Backend Engineer", when: "1h ago" },
  { who: "Maya Chen", what: "sent offer to Sofia Alvarez", when: "3h ago" },
  { who: "TalentOS AI", what: "generated interview kit for PM role", when: "5h ago" },
  { who: "Sam Wu", what: "left feedback on David Park", when: "yesterday" },
];

function StageBadge({ stage }: { stage: string }) {
  const map: Record<string, string> = {
    Applied: "bg-secondary text-secondary-foreground",
    Screening: "bg-warning/10 text-warning",
    Interview: "bg-primary/10 text-primary",
    Offer: "bg-success/10 text-success",
    Hired: "bg-success text-success-foreground",
  };
  return (
    <Badge variant="secondary" className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${map[stage] ?? ""}`}>
      {stage}
    </Badge>
  );
}

function Dashboard() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Hiring overview"
        description="Snapshot of open roles, pipeline health, and team activity."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="size-4" /> Export
            </Button>
            <Button size="sm" className="gap-1.5">
              <Plus className="size-4" /> New job
            </Button>
          </>
        }
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="shadow-xs">
            <CardContent className="p-5">
              <div className="text-xs font-medium text-muted-foreground">{s.label}</div>
              <div className="mt-2 flex items-baseline gap-2">
                <div className="text-[28px] font-semibold tracking-tight text-foreground">{s.value}</div>
                <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${s.trend === "up" ? "text-success" : "text-destructive"}`}>
                  {s.trend === "up" ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                  {s.delta}
                </span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{s.hint}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-xs">
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Applications this week</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">Applied vs. hired across all open roles</p>
            </div>
            <Button variant="ghost" size="icon" className="size-8" aria-label="More">
              <MoreHorizontal className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="applied" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="d" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <ReTooltip cursor={{ stroke: "var(--color-border)" }} contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="applied" stroke="var(--color-primary)" strokeWidth={2} fill="url(#applied)" />
                  <Area type="monotone" dataKey="hired" stroke="var(--color-success)" strokeWidth={2} fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Recruitment pipeline</CardTitle>
            <p className="text-xs text-muted-foreground">Active candidates by stage</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {pipeline.map((p) => (
              <div key={p.stage} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{p.stage}</span>
                  <span className="tabular-nums text-muted-foreground">{p.count}</span>
                </div>
                <Progress value={p.pct} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Recent candidates</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">Latest activity across your pipeline</p>
            </div>
            <Button variant="ghost" size="sm">View all</Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Candidate</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead className="text-right">Match</TableHead>
                  <TableHead className="text-right">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((c) => (
                  <TableRow key={c.name}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-7">
                          <AvatarFallback className="bg-secondary text-[10px] font-medium">
                            {c.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{c.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.role}</TableCell>
                    <TableCell><StageBadge stage={c.stage} /></TableCell>
                    <TableCell className="text-right text-sm font-medium tabular-nums">{c.score}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">{c.updated}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <div className="flex flex-col gap-4">
          <Card className="shadow-xs">
            <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Quick actions</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {[
                { icon: Briefcase, label: "New job" },
                { icon: UserPlus, label: "Add candidate" },
                { icon: FileText, label: "Analyze CV" },
                { icon: PenSquare, label: "Write JD" },
                { icon: Target, label: "Match" },
                { icon: CalendarClock, label: "Schedule" },
              ].map((a) => (
                <button key={a.label} className="group flex flex-col items-start gap-2 rounded-lg border border-border bg-card p-3 text-left transition hover:border-primary/40 hover:bg-secondary/60">
                  <a.icon className="size-4 text-muted-foreground group-hover:text-primary" />
                  <span className="text-xs font-medium">{a.label}</span>
                </button>
              ))}
            </CardContent>
          </Card>
          <Card className="shadow-xs">
            <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Recent activity</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {activity.map((a, i) => (
                <div key={i} className="flex gap-2.5">
                  <div className="mt-1 size-1.5 shrink-0 rounded-full bg-primary/60" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">
                      <span className="font-medium text-foreground">{a.who}</span>{" "}
                      <span className="text-muted-foreground">{a.what}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{a.when}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">Upcoming interviews</CardTitle>
              <TrendingUp className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                ["Priya Menon", "Today · 2:00 PM", "Design panel"],
                ["Marcus Chen", "Tomorrow · 10:30 AM", "System design"],
                ["Yara Haddad", "Fri · 3:00 PM", "Hiring manager"],
              ].map(([n, t, k]) => (
                <div key={n} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{n}</div>
                    <div className="text-xs text-muted-foreground">{k}</div>
                  </div>
                  <div className="text-xs tabular-nums text-muted-foreground">{t}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}