import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus, MoreHorizontal, Eye, Pencil, Trash2, CheckCircle2, PauseCircle, XCircle } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useJobs } from "@/hooks/use-api";
import { useDebounce } from "@/hooks/use-debounce";
import { CreateJobDialog } from "@/components/create-job-dialog";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

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
  PUBLISHED: "bg-success/10 text-success",
  Interviewing: "bg-primary/10 text-primary",
  DRAFT: "bg-secondary text-secondary-foreground",
  CLOSED: "bg-muted text-muted-foreground",
  PAUSED: "bg-warning/10 text-warning",
};

function JobsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [statusFilter, setStatusFilter] = useState("All");
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);

  // Edit State
  const [editingJob, setEditingJob] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editStatus, setEditStatus] = useState("PUBLISHED");
  const [editWorkplace, setEditWorkplace] = useState("Hybrid");
  const [editDescription, setEditDescription] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // View Details Modal
  const [viewingJob, setViewingJob] = useState<any | null>(null);

  const filters: Record<string, string> = {};
  if (debouncedSearch) filters.search = debouncedSearch;
  if (statusFilter !== "All") filters.status = statusFilter;

  const { data, isLoading, mutate } = useJobs(filters);
  const jobs = data?.data || [];

  const totalJobs = jobs.length;
  const openJobs = jobs.filter((j: any) => j.status === "Open" || j.status === "PUBLISHED").length;
  const totalApplicants = jobs.reduce((sum: number, j: any) => sum + (j.candidatesCount || 0), 0);
  const avgApplicants = totalJobs ? Math.round(totalApplicants / totalJobs) : 0;

  // Open Edit Modal
  const openEditModal = (job: any) => {
    setEditingJob(job);
    setEditTitle(job.title || "");
    setEditStatus(job.status || "PUBLISHED");
    setEditWorkplace(job.workplaceType || "Hybrid");
    setEditDescription(job.description || "");
  };

  // Submit Update
  const handleUpdateJob = async () => {
    if (!editingJob) return;
    setIsUpdating(true);
    try {
      await api.updateJob(editingJob.id, {
        title: editTitle,
        status: editStatus,
        workplaceType: editWorkplace,
        description: editDescription,
      });
      toast.success("Job updated successfully!");
      setEditingJob(null);
      mutate();
    } catch (err: any) {
      toast.error(err.message || "Failed to update job");
    } finally {
      setIsUpdating(false);
    }
  };

  // Quick Status Update
  const handleQuickStatus = async (jobId: string, newStatus: string) => {
    try {
      await api.updateJob(jobId, { status: newStatus });
      toast.success(`Job status changed to ${newStatus}`);
      mutate();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  // Delete Job
  const handleDeleteJob = async (jobId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await api.deleteJob(jobId);
      toast.success(`Job "${title}" deleted successfully`);
      mutate();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete job");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Jobs"
        description="Open positions and requisitions across your organization."
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => setIsCreateJobOpen(true)}>
            <Plus className="size-4" /> New job
          </Button>
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
                  <TableRow key={j.id} className="hover:bg-secondary/40">
                    <TableCell className="font-medium cursor-pointer" onClick={() => setViewingJob(j)}>
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Job Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setViewingJob(j)} className="gap-2 cursor-pointer">
                            <Eye className="size-4 text-muted-foreground" />
                            <span>View Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditModal(j)} className="gap-2 cursor-pointer">
                            <Pencil className="size-4 text-muted-foreground" />
                            <span>Edit Position</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="text-[11px] text-muted-foreground font-normal">Change Status</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleQuickStatus(j.id, "PUBLISHED")} className="gap-2 cursor-pointer">
                            <CheckCircle2 className="size-4 text-success" />
                            <span>Publish Position</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleQuickStatus(j.id, "PAUSED")} className="gap-2 cursor-pointer">
                            <PauseCircle className="size-4 text-warning" />
                            <span>Pause Hiring</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleQuickStatus(j.id, "CLOSED")} className="gap-2 cursor-pointer">
                            <XCircle className="size-4 text-muted-foreground" />
                            <span>Close Position</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteJob(j.id, j.title)} className="gap-2 text-destructive focus:text-destructive cursor-pointer">
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

      {/* Edit Job Modal */}
      <Dialog open={!!editingJob} onOpenChange={(v) => !v && setEditingJob(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Position</DialogTitle>
            <DialogDescription>Update the job title, status, or description.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Position Title</Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PAUSED">Paused</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Workplace</Label>
                <Select value={editWorkplace} onValueChange={setEditWorkplace}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                    <SelectItem value="Remote">Remote</SelectItem>
                    <SelectItem value="Onsite">Onsite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={3} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingJob(null)}>Cancel</Button>
            <Button onClick={handleUpdateJob} disabled={isUpdating}>{isUpdating ? "Saving…" : "Save changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Job Details Modal */}
      <Dialog open={!!viewingJob} onOpenChange={(v) => !v && setViewingJob(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-between pr-4">
              <DialogTitle className="text-lg">{viewingJob?.title}</DialogTitle>
              <Badge variant="secondary">{viewingJob?.status}</Badge>
            </div>
            <DialogDescription>{viewingJob?.code} · {viewingJob?.dept} · {viewingJob?.loc}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-2 text-sm border-y border-border py-3">
              <div><span className="text-muted-foreground">Workplace:</span> <span className="font-medium text-foreground">{viewingJob?.workplaceType || 'Hybrid'}</span></div>
              <div><span className="text-muted-foreground">Job Type:</span> <span className="font-medium text-foreground">{viewingJob?.type || 'Full-time'}</span></div>
              <div><span className="text-muted-foreground">Salary:</span> <span className="font-medium text-foreground">{viewingJob?.salary || 'Competitive'}</span></div>
              <div><span className="text-muted-foreground">Applicants:</span> <span className="font-medium text-foreground">{viewingJob?.candidatesCount || 0} candidates</span></div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Description</div>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{viewingJob?.description || 'No detailed description provided.'}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingJob(null)}>Close</Button>
            <Button onClick={() => { const j = viewingJob; setViewingJob(null); openEditModal(j); }}>Edit Job</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreateJobDialog open={isCreateJobOpen} onOpenChange={setIsCreateJobOpen} />
    </div>
  );
}