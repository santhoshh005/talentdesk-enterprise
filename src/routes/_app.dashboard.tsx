import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus, Download, Briefcase, UserPlus, ArrowUpRight, ArrowDownRight, FileText, Target, PenSquare, CalendarClock } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip as ReTooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
      { name: "description", content: "Hiring overview, analytics, and recent activity." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const { data: metricsData, isLoading: metricsLoading } = useDashboardMetrics();
  const { data: candidatesData, isLoading: candidatesLoading } = useCandidates({});
  
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);
  const [isCreateCandidateOpen, setIsCreateCandidateOpen] = useState(false);

  const kpis = metricsData?.data?.kpis;
  const candidateRows = candidatesData?.data || [];

  function downloadCSV() {
    const lines = [
      "Metric,Value",
      `Active Open Jobs,${kpis?.activeJobs || 0}`,
      `Total Candidates,${kpis?.totalCandidates || 0}`,
      `Offers Extended,${kpis?.offersExtended || 0}`,
      `Avg Time To Hire (Days),${kpis?.timeToHireAvgDays || 0}`,
      `Offer Acceptance Rate (%),${kpis?.offerAcceptanceRate || 0}%`,
      "",
      "Candidate Name,Role,Location,Quality Score"
    ];

    candidateRows.forEach((c: any) => {
      lines.push(`"${c.name || ''}","${c.role || ''}","${c.loc || ''}","${c.score || ''}"`);
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

  const stats = kpis ? [
    { label: "Open positions", value: kpis.activeJobs, delta: "+4", trend: "up", hint: "vs last week" },
    { label: "Applications today", value: kpis.totalCandidates, delta: "+18%", trend: "up", hint: "vs yesterday" },
    { label: "Total candidates", value: kpis.totalCandidates, delta: "+62", trend: "up", hint: "this month" },
    { label: "Avg time to hire", value: `${kpis.timeToHireAvgDays || 24} days`, delta: "-3 days", trend: "up", hint: "vs last month" },
  ] : [];

  const chartData = [
    { d: "Mon", applied: 12, hired: 2 },
    { d: "Tue", applied: 19, hired: 3 },
    { d: "Wed", applied: 24, hired: 5 },
    { d: "Thu", applied: 18, hired: 4 },
    { d: "Fri", applied: 32, hired: 8 },
    { d: "Sat", applied: 15, hired: 3 },
    { d: "Sun", applied: 9, hired: 1 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description="Overview of open positions, candidates, and hiring activity."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={downloadCSV}>
              <Download className="size-4" /> Export summary
            </Button>
            <Button size="sm" className="gap-1.5" onClick={() => setIsCreateCandidateOpen(true)}>
              <UserPlus className="size-4" /> Add candidate
            </Button>
            <Button size="sm" className="gap-1.5" onClick={() => setIsCreateJobOpen(true)}>
              <Plus className="size-4" /> New job
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="shadow-xs">
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))
        ) : (
          stats.map((s) => (
            <Card key={s.label} className="shadow-xs">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{s.label}</span>
                  <span className={`flex items-center gap-0.5 font-medium ${s.trend === "up" ? "text-success" : "text-destructive"}`}>
                    {s.trend === "up" ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                    {s.delta}
                  </span>
                </div>
                <div className="mt-1 text-2xl font-bold tracking-tight text-foreground">{s.value}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{s.hint}</div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card className="shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base font-semibold">Hiring activity overview</CardTitle>
            <p className="text-xs text-muted-foreground">Applications vs hires over time</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="size-2 rounded-full bg-primary" /> Applications
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="size-2 rounded-full bg-success" /> Hires
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Recent candidates</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">Latest candidates in your database</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/candidates" })}>View all</Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Candidate</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Match Score</TableHead>
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
                    <TableCell className="text-sm text-muted-foreground">{c.loc}</TableCell>
                    <TableCell className="text-right text-sm font-semibold tabular-nums">{c.score}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Quick actions</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {[
              { icon: Briefcase, label: "New job", action: () => setIsCreateJobOpen(true) },
              { icon: UserPlus, label: "Add candidate", action: () => setIsCreateCandidateOpen(true) },
              { icon: FileText, label: "Analyze CV", action: () => navigate({ to: "/resume-analyzer" }) },
              { icon: PenSquare, label: "Write JD", action: () => navigate({ to: "/jd-generator" }) },
              { icon: Target, label: "Match", action: () => navigate({ to: "/candidate-match" }) },
              { icon: CalendarClock, label: "Candidates", action: () => navigate({ to: "/candidates" }) },
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
      </div>

      <CreateJobDialog open={isCreateJobOpen} onOpenChange={setIsCreateJobOpen} />
      <CreateCandidateDialog open={isCreateCandidateOpen} onOpenChange={setIsCreateCandidateOpen} />
    </div>
  );
}