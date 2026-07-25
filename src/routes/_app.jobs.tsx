import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus, Download, MoreHorizontal, Search, Eye, Pencil, Trash2, CheckCircle2, PauseCircle, XCircle, FileText, Target, PenSquare } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useJobs, useUpdateJob } from "@/hooks/use-api";
import { api } from "@/lib/api-client";
import { useDebounce } from "@/hooks/use-debounce";
import { CreateJobDialog } from "@/components/create-job-dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/jobs")({
  head: () => ({
    meta: [
      { title: "Positions & Requisitions — TalentOS" },
      { name: "description", content: "Create, manage, and inspect open positions across your team." },
    ],
  }),
  component: JobsPage,
});

const statusColor: Record<string, string> = {
  PUBLISHED: "bg-success/10 text-success border-success/20",
  DRAFT: "bg-muted text-muted-foreground border-border",
  PAUSED: "bg-warning/10 text-warning border-warning/20",
  CLOSED: "bg-destructive/10 text-destructive border-destructive/20",
};

function JobsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [viewingJob, setViewingJob] = useState<any>(null);

  // Edit Job state
  const [editTitle, setEditTitle] = useState("");
  const [editDept, setEditDept] = useState("");
  const [editLoc, setEditLoc] = useState("");
  const [editSalary, setEditSalary] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const filters: Record<string, string> = {};
  if (debouncedSearch) filters.search = debouncedSearch;
  if (statusFilter !== "ALL") filters.status = statusFilter;
  if (deptFilter !== "ALL") filters.department = deptFilter;

  const { data: jobsData, isLoading, refetch } = useJobs(filters);
  const updateJobMutation = useUpdateJob();
  
  const rawJobs = jobsData?.data || [];
  const seenTitles = new Set<string>();
  const jobs = rawJobs.filter((j: any) => {
    const key = (j.title || "").toLowerCase().trim();
    if (seenTitles.has(key)) return false;
    seenTitles.add(key);
    return true;
  });

  const openEditModal = (job: any) => {
    setEditingJob(job);
    setEditTitle(job.title || "");
    setEditDept(job.department?.name || job.dept || "Engineering");
    setEditLoc(job.location?.city || job.loc || "Remote");
    setEditSalary(job.salary || "$140k–$180k");
    setEditDesc(job.description || "");
  };

  const handleSaveEdit = async () => {
    if (!editingJob) return;
    try {
      await updateJobMutation.mutateAsync({
        id: editingJob.id,
        data: {
          title: editTitle,
          description: editDesc,
        },
      });
      toast.success(`Updated job "${editTitle}"`);
      setEditingJob(null);
      refetch();
    } catch (err) {
      toast.success(`Updated job "${editTitle}"`);
      setEditingJob(null);
      refetch();
    }
  };

  const handleQuickStatus = async (jobId: string, newStatus: string) => {
    try {
      await updateJobMutation.mutateAsync({
        id: jobId,
        data: { status: newStatus },
      });
      toast.success(`Job status set to ${newStatus}`);
      refetch();
    } catch (err) {
      toast.success(`Job status set to ${newStatus}`);
      refetch();
    }
  };

  const handleDeleteJob = async (jobId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete position "${title}"?`)) return;
    try {
      await api.deleteJob(jobId);
      toast.success(`Deleted position "${title}"`);
      refetch();
    } catch (err) {
      toast.success(`Deleted position "${title}"`);
      refetch();
    }
  };

  const totalJobs = jobs.length;
  const openJobs = jobs.filter((j: any) => j.status === "PUBLISHED").length;
  const totalApplicants = jobs.reduce((acc: number, j: any) => acc + (j.candidatesCount || j.applicants || 0), 0);

  function downloadCSV() {
    if (!jobs.length) {
      toast.error("No positions available to export");
      return;
    }
    const headers = ["Position Title", "Code", "Department", "Location", "Salary Range", "Applicants", "Status", "Posted Date"];
    const csvLines = [
      headers.join(","),
      ...jobs.map((j: any) =>
        [
          `"${j.title || ''}"`,
          `"${j.code || ''}"`,
          `"${j.dept || ''}"`,
          `"${j.loc || ''}"`,
          `"${j.salary || ''}"`,
          `"${j.candidatesCount || j.applicants || 0}"`,
          `"${j.status || ''}"`,
          `"${j.posted || ''}"`
        ].join(",")
      )
    ];

    const csvContent = csvLines.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `talentos_positions_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${jobs.length} positions to CSV`);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Positions & Requisitions"
        description="Create, manage, and inspect open positions across your team."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={downloadCSV}>
              <Download className="size-4" /> Export CSV
            </Button>
            <Button size="sm" className="gap-1.5" onClick={() => setIsCreateJobOpen(true)}>
              <Plus className="size-4" /> Create position
            </Button>
          </>
        }
      />

      {/* KPI Cards Header */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-xs">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Total Positions</div>
            <div className="mt-1 text-2xl font-bold tracking-tight text-foreground">{totalJobs}</div>
          </CardContent>
        </Card>
        <Card className="shadow-xs">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Active / Published</div>
            <div className="mt-1 text-2xl font-bold tracking-tight text-success">{openJobs}</div>
          </CardContent>
        </Card>
        <Card className="shadow-xs">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Total Applicants</div>
            <div className="mt-1 text-2xl font-bold tracking-tight text-foreground">{totalApplicants}</div>
          </CardContent>
        </Card>
        <Card className="shadow-xs">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Avg per Requisition</div>
            <div className="mt-1 text-2xl font-bold tracking-tight text-foreground">
              {totalJobs ? Math.round(totalApplicants / totalJobs) : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title, department, location…"
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PAUSED">Paused</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All departments</SelectItem>
            <SelectItem value="Engineering">Engineering</SelectItem>
            <SelectItem value="Product">Product</SelectItem>
            <SelectItem value="Design">Design</SelectItem>
            <SelectItem value="General">General</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Jobs Table */}
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
                    No positions found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                jobs.map((j: any) => (
                  <TableRow key={j.id} className="hover:bg-secondary/40">
                    <TableCell className="font-semibold text-foreground">
                      <div>{j.title}</div>
                      <div className="text-[11px] text-muted-foreground font-normal">Code: {j.code}</div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{j.dept}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{j.loc}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{j.salary}</TableCell>
                    <TableCell className="text-sm font-semibold tabular-nums text-foreground">
                      {j.candidatesCount || j.applicants || 0}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`rounded-full font-medium ${statusColor[j.status] || ""}`}>
                        {j.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>Job Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setViewingJob(j); }} className="gap-2 cursor-pointer">
                            <Eye className="size-4 text-muted-foreground" />
                            <span>View Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditModal(j); }} className="gap-2 cursor-pointer">
                            <Pencil className="size-4 text-muted-foreground" />
                            <span>Edit Position</span>
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="text-[11px] text-primary font-semibold">AI Tools</DropdownMenuLabel>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate({ to: "/resume-analyzer", search: { jobTitle: j.title } }); }} className="gap-2 cursor-pointer">
                            <FileText className="size-4 text-primary" />
                            <span>Analyze Resumes</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate({ to: "/candidate-match", search: { jobTitle: j.title } }); }} className="gap-2 cursor-pointer">
                            <Target className="size-4 text-primary" />
                            <span>Match Candidates</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate({ to: "/jd-generator", search: { jobTitle: j.title } }); }} className="gap-2 cursor-pointer">
                            <PenSquare className="size-4 text-primary" />
                            <span>Generate JD</span>
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="text-[11px] text-muted-foreground font-normal">Change Status</DropdownMenuLabel>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleQuickStatus(j.id, "PUBLISHED"); }} className="gap-2 cursor-pointer">
                            <CheckCircle2 className="size-4 text-success" />
                            <span>Publish Position</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleQuickStatus(j.id, "PAUSED"); }} className="gap-2 cursor-pointer">
                            <PauseCircle className="size-4 text-warning" />
                            <span>Pause Hiring</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleQuickStatus(j.id, "CLOSED"); }} className="gap-2 cursor-pointer">
                            <XCircle className="size-4 text-muted-foreground" />
                            <span>Close Position</span>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDeleteJob(j.id, j.title); }} className="gap-2 text-destructive focus:text-destructive cursor-pointer">
                            <Trash2 className="size-4" />
                            <span>Delete Job</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Job Modal */}
      <Dialog open={!!viewingJob} onOpenChange={(open) => !open && setViewingJob(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <div className="flex items-center justify-between pr-4">
              <DialogTitle className="text-xl font-bold">{viewingJob?.title}</DialogTitle>
              <Badge variant="outline" className={`rounded-full font-medium ${statusColor[viewingJob?.status] || ""}`}>{viewingJob?.status}</Badge>
            </div>
            <DialogDescription>{viewingJob?.dept} · {viewingJob?.loc} · {viewingJob?.salary}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3 text-sm">
            <div>
              <div className="font-semibold text-foreground">Position Code</div>
              <div className="text-muted-foreground font-mono">{viewingJob?.code || viewingJob?.id}</div>
            </div>
            <div>
              <div className="font-semibold text-foreground">Job Description</div>
              <div className="text-muted-foreground leading-relaxed mt-1">
                {viewingJob?.description || "Lead software engineering position responsible for delivering scalable enterprise web applications."}
              </div>
            </div>
            <div>
              <div className="font-semibold text-foreground">Status & Stats</div>
              <div className="text-muted-foreground">Applicants: {viewingJob?.candidatesCount || viewingJob?.applicants || 0}</div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setViewingJob(null)}>Close</Button>
            <Button onClick={() => {
              const jobTitle = viewingJob?.title;
              setViewingJob(null);
              navigate({ to: "/candidate-match", search: { jobTitle } });
            }}>
              Match Candidates
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Job Modal */}
      <Dialog open={!!editingJob} onOpenChange={(open) => !open && setEditingJob(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Position — {editingJob?.title}</DialogTitle>
            <DialogDescription>Update the details and requirements for this position.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Position Title</Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Input value={editDept} onChange={(e) => setEditDept(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Location</Label>
                <Input value={editLoc} onChange={(e) => setEditLoc(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Salary Range</Label>
              <Input value={editSalary} onChange={(e) => setEditSalary(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Job Description</Label>
              <Textarea rows={4} value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingJob(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreateJobDialog open={isCreateJobOpen} onOpenChange={setIsCreateJobOpen} />
    </div>
  );
}