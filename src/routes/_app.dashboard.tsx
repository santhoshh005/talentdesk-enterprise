import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus, Download, Briefcase, UserPlus, CalendarClock, TrendingUp, ArrowUpRight, ArrowDownRight, MoreHorizontal, FileText, Target, PenSquare } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip as ReTooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardMetrics, useCandidates } from "@/hooks/use-api";
import { CreateJobDialog } from "@/components/create-job-dialog";
import { CreateCandidateDialog } from "@/components/create-candidate-dialog";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — TalentOS" },
      { name: "description", content: "Hiring overview, pipeline, and recent activity." },
    ],
  }),
  component: Dashboard,
});

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
  const navigate = useNavigate();
  const { data: metricsData, isLoading: metricsLoading } = useDashboardMetrics();
  const { data: candidatesData, isLoading: candidatesLoading } = useCandidates({});
  
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);
  const [isCreateCandidateOpen, setIsCreateCandidateOpen] = useState(false);

  const kpis = metricsData?.data?.kpis;
  const funnel = metricsData?.data?.funnel || [];
  const candidateRows = candidatesData?.data || [];

  function downloadCSV() {
    const lines = [
      "Metric,Value",
      `Active Open Jobs,${kpis?.activeJobs || 0}`,
      `Total Candidates,${kpis?.totalCandidates || 0}`,
      `Interviews Scheduled,${kpis?.interviewsScheduled || 0}`,
      `Offers Extended,${kpis?.offersExtended || 0}`,
      `Avg Time To Hire (Days),${kpis?.timeToHireAvgDays || 0}`,
      `Offer Acceptance Rate (%),${kpis?.offerAcceptanceRate || 0}%`,
      "",
      "Candidate Name,Role,Stage,Location,Quality Score"
    ];

    candidateRows.forEach((c: any) => {
      lines.push(`"${c.name || ''}","${c.role || ''}","${c.stage || ''}","${c.loc || ''}","${c.score || ''}"`);
    });

    const csvContent = lines.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `talentos_hiring_summary_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Hiring summary exported to CSV");
  }

  const maxFunnelCount = Math.max(...funnel.map((f: any) => f.count), 1);
  const pipeline = funnel.map((f: any) => ({
    stage: f.stage,
    count: f.count,
    pct: (f.count / maxFunnelCount) * 100,
  }));

  const stats = kpis ? [
    { label: "Open positions", value: kpis.activeJobs, delta: "+4", trend: "up", hint: "vs last week" },
    { label: "Applications today", value: kpis.totalCandidates, delta: "+18%", trend: "up", hint: "vs yesterday" },
    { label: "In pipeline", value: kpis.totalCandidates, delta: "+62", trend: "up", hint: "this month" },
    { label: "Upcoming interviews", value: kpis.interviewsScheduled, delta: "-2", trend: "down", hint: "next 7 days" },
  ] : [];

  const chartData = funnel.length > 0 ? funnel.map((f: any) => ({
    d: f.stage.substring(0, 3),
    applied: f.count,
    hired: Math.round(f.count * (f.conversion / 100) || 0)
  })) : [
    { d: "Mon", applied: 42, hired: 3 },
    { d: "Tue", applied: 58, hired: 4 },
    { d: "Wed", applied: 71, hired: 5 },
    { d: "Thu", applied: 64, hired: 6 },
    { d: "Fri", applied: 89, hired: 8 },
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Hiring overview"
        description="Snapshot of open roles, pipeline health, and team activity."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={downloadCSV}>
              <Download className="size-4" /> Export CSV
            </Button>
            <Button size="sm" className="gap-1.5" onClick={() => setIsCreateJobOpen(true)}>
              <Plus className="size-4" /> New job
            </Button>
          </>
        }
      />
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricsLoading ? Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="shadow-xs">
            <CardContent className="p-5">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        )) : stats.map((s) => (
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
            {metricsLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-1.5 w-full" />
                </div>
              ))
            ) : pipeline.map((p: any) => (
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
            <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/candidates" })}>View all</Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Candidate</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead className="text-right">Match</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidatesLoading ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
                  </TableRow>
                )) : candidateRows.slice(0, 5).map((c: any) => (
                  <TableRow key={c.id} className="cursor-pointer hover:bg-secondary/40" onClick={() => navigate({ to: "/candidates" })}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-7">
                          <AvatarFallback className="bg-secondary text-[10px] font-medium">
                            {(c.name || 'C').split(" ").map((n: string) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{c.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.role}</TableCell>
                    <TableCell><StageBadge stage={c.stage} /></TableCell>
                    <TableCell className="text-right text-sm font-semibold tabular-nums">{c.score}</TableCell>
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
                { icon: Briefcase, label: "New job", action: () => setIsCreateJobOpen(true) },
                { icon: UserPlus, label: "Add candidate", action: () => setIsCreateCandidateOpen(true) },
                { icon: FileText, label: "Analyze CV", action: () => navigate({ to: "/resume-analyzer" }) },
                { icon: PenSquare, label: "Write JD", action: () => navigate({ to: "/jd-generator" }) },
                { icon: Target, label: "Match", action: () => navigate({ to: "/candidate-match" }) },
                { icon: CalendarClock, label: "Schedule", action: () => navigate({ to: "/candidates" }) },
              ].map((a) => (
                <button 
                  key={a.label} 
                  onClick={a.action}
                  className="group flex flex-col items-start gap-2 rounded-lg border border-border bg-card p-3 text-left transition hover:border-primary/40 hover:bg-secondary/60 cursor-pointer"
                >
                  <a.icon className="size-4 text-muted-foreground group-hover:text-primary" />
                  <span className="text-xs font-medium">{a.label}</span>
                </button>
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
                ["Sofia Alvarez", "Fri · 3:00 PM", "Hiring manager"],
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

      <CreateJobDialog open={isCreateJobOpen} onOpenChange={setIsCreateJobOpen} />
      <CreateCandidateDialog open={isCreateCandidateOpen} onOpenChange={setIsCreateCandidateOpen} />
    </div>
  );
}