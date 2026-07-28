import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Search,
  Download,
  Plus,
  MoreHorizontal,
  User,
  Copy,
  FileText,
  Target,
  Trash2,
  Edit3,
} from "lucide-react";
import { useCandidates, useDeleteCandidate, useUpdateCandidate } from "@/hooks/use-api";
import { CandidateDetailSheet } from "@/components/candidate-detail-sheet";
import { CreateCandidateDialog } from "@/components/create-candidate-dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/candidates")({
  head: () => ({
    meta: [
      { title: "Candidates — TalentOS" },
      { name: "description", content: "View and manage candidates in your talent pool." },
    ],
  }),
  component: CandidatesPage,
});

function CandidatesPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [skillFilter, setSkillFilter] = useState("All skills");
  const [locationFilter, setLocationFilter] = useState("Any location");
  const [expFilter, setExpFilter] = useState("Any exp.");
  const [matchSort, setMatchSort] = useState("score_desc");

  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [isCreateCandidateOpen, setIsCreateCandidateOpen] = useState(false);

  // Edit Candidate Modal State
  const [editingCandidate, setEditingCandidate] = useState<any | null>(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editLoc, setEditLoc] = useState("");
  const [editSkills, setEditSkills] = useState("");

  const filters: Record<string, string> = {};
  if (searchTerm) filters.search = searchTerm;
  if (skillFilter !== "All skills") filters.skill = skillFilter;
  if (locationFilter !== "Any location") filters.location = locationFilter;
  if (matchSort) filters.sortBy = matchSort;

  const { data: candidatesRes, isLoading, refetch } = useCandidates(filters);
  const deleteCandidateMutation = useDeleteCandidate();
  const updateCandidateMutation = useUpdateCandidate();

  const candidatesList = candidatesRes?.data || [];

  const filteredCandidates = candidatesList.filter((c: any) => {
    if (expFilter !== "Any exp.") {
      if (expFilter === "0-2 yrs" && c.experienceYears > 2) return false;
      if (expFilter === "3-5 yrs" && (c.experienceYears < 3 || c.experienceYears > 5)) return false;
      if (expFilter === "5+ yrs" && c.experienceYears < 5) return false;
    }
    return true;
  });

  const openEditCandidateModal = (c: any) => {
    setEditingCandidate(c);
    setEditFirstName(c.firstName || c.name?.split(" ")[0] || "");
    setEditLastName(c.lastName || c.name?.split(" ").slice(1).join(" ") || "");
    setEditEmail(c.email || "");
    setEditRole(c.currentRole || c.role || "");
    setEditLoc(c.location || c.loc || "");
    setEditSkills(
      Array.isArray(c.skills)
        ? c.skills.map((s: any) => (typeof s === "string" ? s : s.name)).join(", ")
        : "",
    );
  };

  const handleSaveEditCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCandidate) return;
    try {
      await updateCandidateMutation.mutateAsync({
        id: editingCandidate.id,
        data: {
          firstName: editFirstName,
          lastName: editLastName,
          email: editEmail,
          currentRole: editRole,
          location: editLoc,
          skills: editSkills
            ? editSkills
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
        },
      });
      setEditingCandidate(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCandidate = async (candidateId: string, candidateName: string) => {
    if (!confirm(`Are you sure you want to delete candidate "${candidateName}"?`)) return;
    try {
      await deleteCandidateMutation.mutateAsync(candidateId);
      await refetch();
    } catch (err) {
      toast.error("Failed to delete candidate");
    }
  };

  const downloadCSV = () => {
    if (!filteredCandidates.length) {
      toast.error("No candidates to export");
      return;
    }
    const lines = ["Name,Role,Email,Phone,Location,Match Score,Skills"];
    filteredCandidates.forEach((c: any) => {
      const skillsStr = Array.isArray(c.skills) ? c.skills.join("; ") : c.skills || "";
      lines.push(
        `"${c.name || ""}","${c.role || ""}","${c.email || ""}","${c.phone || ""}","${c.loc || ""}","${c.score || ""}","${skillsStr}"`,
      );
    });
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `talentos_candidates_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredCandidates.length} candidates to CSV`);
  };

  const copyEmail = (email: string) => {
    if (email) {
      navigator.clipboard.writeText(email);
      toast.success(`Copied ${email} to clipboard`);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Candidates"
        description="A single view of every candidate across your organization."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={downloadCSV}>
              <Download className="size-4" /> Export CSV
            </Button>
            <Button size="sm" className="gap-1.5" onClick={() => setIsCreateCandidateOpen(true)}>
              <Plus className="size-4" /> Add candidate
            </Button>
          </>
        }
      />

      {/* Search and Filters Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, skill, role…"
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={skillFilter} onValueChange={setSkillFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Skill" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All skills">All skills</SelectItem>
            <SelectItem value="React">React</SelectItem>
            <SelectItem value="TypeScript">TypeScript</SelectItem>
            <SelectItem value="Node.js">Node.js</SelectItem>
            <SelectItem value="Python">Python</SelectItem>
            <SelectItem value="AWS">AWS</SelectItem>
          </SelectContent>
        </Select>

        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Any location">Any location</SelectItem>
            <SelectItem value="San Francisco">San Francisco</SelectItem>
            <SelectItem value="New York">New York</SelectItem>
            <SelectItem value="Remote">Remote</SelectItem>
          </SelectContent>
        </Select>

        <Select value={expFilter} onValueChange={setExpFilter}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Experience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Any exp.">Any exp.</SelectItem>
            <SelectItem value="0-2 yrs">0-2 yrs</SelectItem>
            <SelectItem value="3-5 yrs">3-5 yrs</SelectItem>
            <SelectItem value="5+ yrs">5+ yrs</SelectItem>
          </SelectContent>
        </Select>

        <Select value={matchSort} onValueChange={setMatchSort}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="score_desc">Match Score (High-Low)</SelectItem>
            <SelectItem value="score_asc">Match Score (Low-High)</SelectItem>
            <SelectItem value="exp_desc">Experience (High-Low)</SelectItem>
            <SelectItem value="name_asc">Name (A-Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Candidates Table */}
      <div className="rounded-lg border border-border bg-card shadow-xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Target Role</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Match Score</TableHead>
              <TableHead>Skills</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-10 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-36" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredCandidates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No candidates found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredCandidates.map((c: any) => {
                const candidateSkills = Array.isArray(c.skills) ? c.skills : [];
                return (
                  <TableRow
                    key={c.id}
                    className="cursor-pointer hover:bg-secondary/20"
                    onClick={() => setSelectedCandidateId(c.id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          <AvatarFallback className="bg-secondary text-xs font-semibold text-secondary-foreground">
                            {((c.firstName || c.name || "C") + " " + (c.lastName || ""))
                              .trim()
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-foreground text-sm">
                            {(c.firstName || c.name) + " " + (c.lastName || "")}
                          </div>
                          <div className="text-xs text-muted-foreground">{c.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-foreground">
                      {c.currentRole || c.role}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.location || c.loc}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.experienceYears || c.exp || 0} yrs
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="font-semibold text-xs border-primary/30 bg-primary/5 text-primary"
                      >
                        {c.qualityScore || c.score || 90}% match
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {candidateSkills.map((s: any) => {
                          const skillName = typeof s === "string" ? s : s.name || "";
                          return skillName ? (
                            <Badge
                              key={skillName}
                              variant="secondary"
                              className="rounded-full px-2 py-0 text-[10px] font-medium bg-secondary text-secondary-foreground"
                            >
                              {skillName}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuLabel>Candidate Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => setSelectedCandidateId(c.id)}
                            className="gap-2 cursor-pointer"
                          >
                            <User className="size-4 text-muted-foreground" />
                            <span>View Profile</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openEditCandidateModal(c)}
                            className="gap-2 cursor-pointer"
                          >
                            <Edit3 className="size-4 text-muted-foreground" />
                            <span>Edit Candidate</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => copyEmail(c.email)}
                            className="gap-2 cursor-pointer"
                          >
                            <Copy className="size-4 text-muted-foreground" />
                            <span>Copy Email</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="text-[11px] text-primary font-semibold">
                            AI Shortcuts
                          </DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() =>
                              navigate({ to: "/resume-analyzer", search: { jobTitle: c.role } })
                            }
                            className="gap-2 cursor-pointer"
                          >
                            <FileText className="size-4 text-primary" />
                            <span>Analyze Resume</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              navigate({ to: "/candidate-match", search: { jobTitle: c.role } })
                            }
                            className="gap-2 cursor-pointer"
                          >
                            <Target className="size-4 text-primary" />
                            <span>Match Position</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteCandidate(c.id, c.name)}
                            className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                          >
                            <Trash2 className="size-4" />
                            <span>Delete Candidate</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <CandidateDetailSheet
        open={!!selectedCandidateId}
        candidateId={selectedCandidateId}
        onOpenChange={(open) => {
          if (!open) setSelectedCandidateId(null);
        }}
      />

      {editingCandidate && (
        <Dialog
          open={!!editingCandidate}
          onOpenChange={(open) => !open && setEditingCandidate(null)}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Candidate Details</DialogTitle>
              <DialogDescription>Update details for {editingCandidate.name}.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveEditCandidate} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>First Name</Label>
                  <Input
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Last Name</Label>
                  <Input
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Current Role</Label>
                <Input value={editRole} onChange={(e) => setEditRole(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Location</Label>
                <Input value={editLoc} onChange={(e) => setEditLoc(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Skills (comma-separated)</Label>
                <Input value={editSkills} onChange={(e) => setEditSkills(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditingCandidate(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateCandidateMutation.isPending}>
                  {updateCandidateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <CreateCandidateDialog open={isCreateCandidateOpen} onOpenChange={setIsCreateCandidateOpen} />
    </div>
  );
}
