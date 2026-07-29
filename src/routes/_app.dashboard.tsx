import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Plus,
  Download,
  Briefcase,
  UserPlus,
  FileText,
  Target,
  PenSquare,
  CalendarClock,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useCandidates, useJobs } from "@/hooks/use-api";
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
  const { data: candidatesData, isLoading: candidatesLoading } = useCandidates({});
  const { data: jobsData, isLoading: jobsLoading } = useJobs();

  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);
  const [isCreateCandidateOpen, setIsCreateCandidateOpen] = useState(false);

  const candidateRows = candidatesData?.data || [];
  const jobsList = jobsData?.data || [];

  const totalOpenJobs = jobsList.length;
  const totalCandidatesCount = candidateRows.length;

  function downloadCSV() {
    const lines = [
      "Metric,Value",
      `Total Open Jobs,${totalOpenJobs}`,
      `Total Candidates,${totalCandidatesCount}`,
      "",
      "Candidate Name,Role,Location,Quality Score",
    ];

    candidateRows.forEach((c: any) => {
      lines.push(`"${c.name || ""}","${c.role || ""}","${c.loc || ""}","${c.score || ""}"`);
    });

    const csvContent = lines.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `talentos_hiring_summary_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Hiring summary exported to CSV");
  }

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

      {/* Top 2 Interactive Action Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card
          onClick={() => setIsCreateJobOpen(true)}
          className="group shadow-xs border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-all cursor-pointer"
        >
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Open Jobs
              </div>
              <div className="mt-1 text-3xl font-extrabold text-foreground">
                {jobsLoading ? <Skeleton className="h-8 w-16 my-1" /> : totalOpenJobs}
              </div>
              <div className="mt-1.5 flex items-center gap-1 text-xs text-primary font-medium group-hover:underline">
                <Plus className="size-3.5" /> Click to add position
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsCreateJobOpen(true);
              }}
              className="grid size-13 place-items-center rounded-xl bg-primary text-primary-foreground shadow-md transition-transform group-hover:scale-105"
              title="Add New Job Position"
            >
              <Briefcase className="size-6" />
            </button>
          </CardContent>
        </Card>

        <Card
          onClick={() => setIsCreateCandidateOpen(true)}
          className="group shadow-xs border-success/30 bg-success/5 hover:bg-success/10 hover:border-success/50 transition-all cursor-pointer"
        >
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Candidates
              </div>
              <div className="mt-1 text-3xl font-extrabold text-foreground">
                {candidatesLoading ? <Skeleton className="h-8 w-16 my-1" /> : totalCandidatesCount}
              </div>
              <div className="mt-1.5 flex items-center gap-1 text-xs text-success font-medium group-hover:underline">
                <Plus className="size-3.5" /> Click to add candidate
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsCreateCandidateOpen(true);
              }}
              className="grid size-13 place-items-center rounded-xl bg-success text-success-foreground shadow-md transition-transform group-hover:scale-105"
              title="Add New Candidate"
            >
              <UserPlus className="size-6" />
            </button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-xs overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Recent candidates</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Latest candidates in your database
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/candidates" })}>
              View all
            </Button>
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
                {candidatesLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-28" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-4 w-8 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : candidateRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                      No candidates in database yet. Click "Add candidate" above to add one.
                    </TableCell>
                  </TableRow>
                ) : (
                  candidateRows.slice(0, 6).map((c: any) => (
                    <TableRow
                      key={c.id}
                      className="cursor-pointer hover:bg-secondary/40"
                      onClick={() => navigate({ to: "/candidates" })}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="size-7">
                            <AvatarFallback className="bg-secondary text-[10px] font-medium">
                              {((c.firstName || c.name || "C") + " " + (c.lastName || ""))
                                .trim()
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">
                            {(c.firstName || c.name) + " " + (c.lastName || "")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {c.currentRole || c.role || "Candidate"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {c.location || c.loc || "Remote"}
                      </TableCell>
                      <TableCell className="text-right text-sm font-semibold tabular-nums">
                        {c.qualityScore || c.score || 0}%
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {[
              { icon: Briefcase, label: "New job", action: () => setIsCreateJobOpen(true) },
              {
                icon: UserPlus,
                label: "Add candidate",
                action: () => setIsCreateCandidateOpen(true),
              },
              {
                icon: FileText,
                label: "Analyze CV",
                action: () => navigate({ to: "/resume-analyzer" }),
              },
              {
                icon: PenSquare,
                label: "Write JD",
                action: () => navigate({ to: "/jd-generator" }),
              },
              { icon: Target, label: "Match", action: () => navigate({ to: "/candidate-match" }) },
              {
                icon: CalendarClock,
                label: "Candidates",
                action: () => navigate({ to: "/candidates" }),
              },
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
