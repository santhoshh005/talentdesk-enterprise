import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus, Download, MoreHorizontal, Search, User, Copy, FileText, Target, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useCandidates } from "@/hooks/use-api";
import { api } from "@/lib/api-client";
import { useDebounce } from "@/hooks/use-debounce";
import { CreateCandidateDialog } from "@/components/create-candidate-dialog";
import { CandidateDetailSheet } from "@/components/candidate-detail-sheet";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/candidates")({
  head: () => ({
    meta: [
      { title: "Candidates — TalentOS" },
      { name: "description", content: "Search, filter and manage every candidate in your talent pool." },
    ],
  }),
  component: CandidatesPage,
});

function CandidatesPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [skillFilter, setSkillFilter] = useState("All skills");
  const [locFilter, setLocFilter] = useState("Any location");
  const [expFilter, setExpFilter] = useState("Any");
  const [sortBy, setSortBy] = useState("score_desc");
  const [isCreateCandidateOpen, setIsCreateCandidateOpen] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  const filters: Record<string, string> = {};
  if (debouncedSearch) filters.search = debouncedSearch;
  if (skillFilter !== "All skills") filters.skill = skillFilter;
  if (locFilter !== "Any location") filters.location = locFilter;
  if (expFilter !== "Any") filters.experience = expFilter;
  if (sortBy) filters.sortBy = sortBy;

  const { data, isLoading, refetch } = useCandidates(filters);
  const rows = data?.data || [];

  function downloadCSV() {
    if (!rows.length) {
      toast.error("No candidates available to export");
      return;
    }
    const headers = ["Name", "Email", "Role", "Location", "Experience", "Score", "Skills"];
    const csvLines = [
      headers.join(","),
      ...rows.map((c: any) =>
        [
          `"${c.name || ''}"`,
          `"${c.email || ''}"`,
          `"${c.role || ''}"`,
          `"${c.loc || ''}"`,
          `"${c.exp || ''}"`,
          `"${c.score || ''}"`,
          `"${(c.skills || []).join("; ")}"`
        ].join(",")
      )
    ];

    const csvContent = csvLines.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `talentos_candidates_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} candidates to CSV`);
  }

  const copyEmail = (email: string) => {
    if (email) {
      navigator.clipboard.writeText(email);
      toast.success(`Copied ${email} to clipboard`);
    }
  };

  const handleDeleteCandidate = async (candidateId: string, candidateName: string) => {
    if (!confirm(`Are you sure you want to delete candidate "${candidateName}"?`)) return;
    try {
      await api.deleteCandidate(candidateId);
      toast.success(`Deleted candidate "${candidateName}"`);
      refetch();
    } catch (err) {
      toast.error("Failed to delete candidate");
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

        {/* Skill Based Filter */}
        <Select value={skillFilter} onValueChange={setSkillFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Skill" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All skills">All skills</SelectItem>
            <SelectItem value="React">React</SelectItem>
            <SelectItem value="TypeScript">TypeScript</SelectItem>
            <SelectItem value="Node.js">Node.js</SelectItem>
            <SelectItem value="Recruitment">Recruitment</SelectItem>
            <SelectItem value="Hiring">Hiring</SelectItem>
            <SelectItem value="Staffing">Staffing</SelectItem>
            <SelectItem value="PostgreSQL">PostgreSQL</SelectItem>
            <SelectItem value="System Design">System Design</SelectItem>
          </SelectContent>
        </Select>

        {/* Location Filter */}
        <Select value={locFilter} onValueChange={setLocFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Location" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Any location">Any location</SelectItem>
            <SelectItem value="Remote">Remote</SelectItem>
            <SelectItem value="San Francisco">San Francisco</SelectItem>
            <SelectItem value="New York">New York</SelectItem>
            <SelectItem value="Bangalore">Bangalore</SelectItem>
            <SelectItem value="London">London</SelectItem>
          </SelectContent>
        </Select>

        {/* Experience Filter */}
        <Select value={expFilter} onValueChange={setExpFilter}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Experience" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Any">Any exp.</SelectItem>
            <SelectItem value="0-2 yrs">0-2 yrs</SelectItem>
            <SelectItem value="3-5 yrs">3-5 yrs</SelectItem>
            <SelectItem value="5+ yrs">5+ yrs</SelectItem>
          </SelectContent>
        </Select>

        {/* Sorting Dropdown */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[170px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="score_desc">Match Score (High-Low)</SelectItem>
            <SelectItem value="score_asc">Match Score (Low-High)</SelectItem>
            <SelectItem value="exp_desc">Experience (High-Low)</SelectItem>
            <SelectItem value="name_asc">Name (A-Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="shadow-xs">
        <CardContent className="p-0">
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
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-6 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    No candidates found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((c: any) => {
                  const candidateSkills = (c.skills && c.skills.length > 0)
                    ? c.skills 
                    : (c.role?.toLowerCase().includes("recruiter") ? ["Hiring", "Staffing", "Recruitment"] : ["TypeScript", "React", "Node.js"]);

                  return (
                    <TableRow key={c.id} className="hover:bg-secondary/40">
                      <TableCell className="font-medium cursor-pointer" onClick={() => setSelectedCandidateId(c.id)}>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="size-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                              {(c.name || 'C').split(" ").map((n: string) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-foreground">{c.name}</div>
                            <div className="text-xs text-muted-foreground">{c.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.role}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.loc}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.exp}</TableCell>
                      <TableCell className="text-sm font-bold tabular-nums text-primary">{c.score}%</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {candidateSkills.map((s: string) => (
                            <Badge key={s} variant="secondary" className="rounded-full px-2 py-0 text-[10px] font-medium bg-secondary text-secondary-foreground">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuLabel>Candidate Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setSelectedCandidateId(c.id)} className="gap-2 cursor-pointer">
                              <User className="size-4 text-muted-foreground" />
                              <span>View Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => copyEmail(c.email)} className="gap-2 cursor-pointer">
                              <Copy className="size-4 text-muted-foreground" />
                              <span>Copy Email</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-[11px] text-primary font-semibold">AI Shortcuts</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigate({ to: "/resume-analyzer", search: { jobTitle: c.role } })} className="gap-2 cursor-pointer">
                              <FileText className="size-4 text-primary" />
                              <span>Analyze Resume</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate({ to: "/candidate-match", search: { jobTitle: c.role } })} className="gap-2 cursor-pointer">
                              <Target className="size-4 text-primary" />
                              <span>Match Position</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDeleteCandidate(c.id, c.name)} className="gap-2 text-destructive focus:text-destructive cursor-pointer">
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
        </CardContent>
      </Card>

      <CreateCandidateDialog open={isCreateCandidateOpen} onOpenChange={setIsCreateCandidateOpen} />
      <CandidateDetailSheet candidateId={selectedCandidateId} open={!!selectedCandidateId} onOpenChange={(v) => !v && setSelectedCandidateId(null)} />
    </div>
  );
}