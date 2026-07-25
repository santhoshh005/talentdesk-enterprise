import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip as ReTooltip, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardMetrics } from "@/hooks/use-api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — TalentOS" },
      { name: "description", content: "Hiring analytics, funnel metrics and team performance." },
    ],
  }),
  component: Analytics,
});

function downloadCSV() {
  toast.success("Analytics exported successfully");
}

function Analytics() {
  const { data, isLoading } = useDashboardMetrics();
  
  const kpis = data?.data?.kpis;
  const funnel = data?.data?.funnel || [];
  const sourcingChannels = data?.data?.sourcingChannels || [];

  const timeToHireData = funnel.map((f: any) => ({
    m: f.stage,
    days: f.count
  }));

  const sourceData = sourcingChannels.map((s: any) => ({
    s: s.channel,
    n: s.count
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Analytics"
        description="Understand pipeline health, source of hire, and team performance."
        actions={<Button variant="outline" size="sm" className="gap-1.5" onClick={downloadCSV}><Download className="size-4" /> Export</Button>}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="shadow-xs"><CardContent className="p-5"><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-8 w-16 mb-1" /><Skeleton className="h-3 w-12" /></CardContent></Card>
        )) : [
          ["Time to hire", `${kpis?.timeToHireAvgDays || 0} days`, "Average"],
          ["Offer acceptance", `${kpis?.offerAcceptanceRate || 0}%`, "Current"],
          ["Open positions", `${kpis?.activeJobs || 0}`, "Active"],
          ["Total candidates", `${kpis?.totalCandidates || 0}`, "In pipeline"],
        ].map(([l,v,d]) => (
          <Card key={l} className="shadow-xs">
            <CardContent className="p-5">
              <div className="text-xs text-muted-foreground">{l}</div>
              <div className="mt-1 text-2xl font-semibold tracking-tight">{v}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{d}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="shadow-xs">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Pipeline stage volume</CardTitle></CardHeader>
          <CardContent className="h-[280px] pt-0">
            {isLoading ? <Skeleton className="w-full h-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeToHireData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="m" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <ReTooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="days" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-xs">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Source of hire</CardTitle></CardHeader>
          <CardContent className="h-[280px] pt-0">
            {isLoading ? <Skeleton className="w-full h-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sourceData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="s" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <ReTooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="n" fill="var(--color-primary)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}