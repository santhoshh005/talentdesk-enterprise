import { createFileRoute } from "@tanstack/react-router";
import { Plus, Filter, MoreHorizontal, MapPin, Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useJobs } from "@/hooks/use-api";
import { useDebounce } from "@/hooks/use-debounce";
import { CreateJobDialog } from "@/components/create-job-dialog";

export const Route = createFileRoute("/_app/jobs")({
  head: () => ({
    meta: [
      { title: "Jobs — TalentOS" },
      { name: "description", content: "Manage open positions and requisitions." },
    ],
  }),
  component: JobsPage,
});

const statusColor: Record<string, string> = {
  Open: "bg-success/10 text-success",
  Published: "bg-success/10 text-success",
  Interviewing: "bg-primary/10 text-primary",
  Draft: "bg-secondary text-secondary-foreground",
  Closed: "bg-muted text-muted-foreground",
  Paused: "bg-warning/10 text-warning"
};

function JobsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [statusFilter, setStatusFilter] = useState("All");
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);

  const filters: Record<string, string> = {};
  if (debouncedSearch) filters.search = debouncedSearch;
  if (statusFilter !== "All") filters.status = statusFilter;

  const { data, isLoading } = useJobs(filters);
  const jobs = data?.data || [];

  const totalJobs = jobs.length;
  const openJobs = jobs.filter((j: any) => j.status === "Open" || j.status === "Published").length;
  const totalApplicants = jobs.reduce((sum: number, j: any) => sum + (j.candidatesCount || 0), 0);
  const avgApplicants = totalJobs ? Math.round(totalApplicants / totalJobs) : 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Jobs"
        description="Open positions and requisitions across your organization."
        actions={
          <>
            <Button size="sm" className="gap-1.5" onClick={() => setIsCreateJobOpen(true)}>
              <Plus className="size-4" /> New job
            </Button>
          </>
        }
      />
      
      <div className="flex items-center gap-2">
        <Input 
          placeholder="Search jobs by title, department, location…" 
          className="max-w-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All statuses</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PAUSED">Paused</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-xs">
          <CardContent className="p-4">
            <div className="text-xs font-medium text-muted-foreground">Total Positions</div>
            <div className="mt-1 text-2xl font-bold">{isLoading ? <Skeleton className="h-7 w-12" /> : totalJobs}</div>
          </CardContent>
        </Card>
        <Card className="shadow-xs">
          <CardContent className="p-4">
            <div className="text-xs font-medium text-muted-foreground">Active / Published</div>
            <div className="mt-1 text-2xl font-bold text-success">{isLoading ? <Skeleton className="h-7 w-12" /> : openJobs}</div>
          </CardContent>
        </Card>
        <Card className="shadow-xs">
          <CardContent className="p-4">
            <div className="text-xs font-medium text-muted-foreground">Total Applicants</div>
            <div className="mt-1 text-2xl font-bold">{isLoading ? <Skeleton className="h-7 w-12" /> : totalApplicants}</div>
          </CardContent>
        </Card>
        <Card className="shadow-xs">
          <CardContent className="p-4">
            <div className="text-xs font-medium text-muted-foreground">Avg per Requisition</div>
            <div className="mt-1 text-2xl font-bold">{isLoading ? <Skeleton className="h-7 w-12" /> : avgApplicants}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Position Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Salary Range</TableHead>
                <TableHead>Applicants</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-6 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : jobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    No jobs found matching your criteria. Click "+ New job" above to create one!
                  </TableCell>
                </TableRow>
              ) : (
                jobs.map((j: any) => (
                  <TableRow key={j.id} className="cursor-pointer hover:bg-secondary/40">
                    <TableCell className="font-medium">
                      <div>{j.title}</div>
                      <div className="text-xs text-muted-foreground">{j.code} · {j.type}</div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{j.dept}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{j.loc}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{j.salary}</TableCell>
                    <TableCell className="text-sm font-semibold">{j.candidatesCount}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusColor[j.status] || "bg-primary/10 text-primary"}`}>
                        {j.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="size-7"><MoreHorizontal className="size-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreateJobDialog open={isCreateJobOpen} onOpenChange={setIsCreateJobOpen} />
    </div>
  );
}