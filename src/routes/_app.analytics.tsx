import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip as ReTooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — TalentOS" },
      { name: "description", content: "Hiring analytics, funnel metrics and team performance." },
    ],
  }),
  component: Analytics,
});

const timeToHire = Array.from({ length: 12 }, (_, i) => ({ m: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i], days: 24 + Math.round(Math.sin(i)*4 + i*0.6) }));
const source = [
  { s: "Referral", n: 34 },{ s: "LinkedIn", n: 28 },{ s: "Careers site", n: 22 },
  { s: "Job board", n: 12 },{ s: "Agency", n: 4 },
];

function Analytics() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Analytics"
        description="Understand pipeline health, source of hire, and team performance."
        actions={<Button variant="outline" size="sm" className="gap-1.5"><Download className="size-4" /> Export</Button>}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Time to hire", "28 days", "-3 vs Q2"],
          ["Offer acceptance", "84%", "+2 pts"],
          ["Cost per hire", "$3,120", "-$180"],
          ["Diversity of hires", "48%", "+4 pts"],
        ].map(([l,v,d]) => (
          <Card key={l} className="shadow-xs">
            <CardContent className="p-5">
              <div className="text-xs text-muted-foreground">{l}</div>
              <div className="mt-1 text-2xl font-semibold tracking-tight">{v}</div>
              <div className="mt-0.5 text-xs text-success">{d}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="shadow-xs">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Time to hire (days)</CardTitle></CardHeader>
          <CardContent className="h-[280px] pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeToHire} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <ReTooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="days" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="shadow-xs">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Source of hire</CardTitle></CardHeader>
          <CardContent className="h-[280px] pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={source} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="s" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <ReTooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="n" fill="var(--color-primary)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}