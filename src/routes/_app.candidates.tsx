import { createFileRoute } from "@tanstack/react-router";
import { Plus, Download, MoreHorizontal, Search, User, ArrowRightLeft, FileText, Copy } from "lucide-react";
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useCandidates, useMoveStage } from "@/hooks/use-api";
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

const stageColor: Record<string, string> = {
  Applied: "bg-secondary text-secondary-foreground",
  Screening: "bg-warning/10 text-warning",
  Interview: "bg-primary/10 text-primary",
  Offer: "bg-success/10 text-success",
  Hired: "bg-success text-success-foreground"
};

function CandidatesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [stageFilter, setStageFilter] = useState("All stages");
  const [locFilter, setLocFilter] = useState("Any location");
  const [expFilter, setExpFilter] = useState("Any");
  const [isCreateCandidateOpen, setIsCreateCandidateOpen] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  const moveStageMutation = useMoveStage();

  const filters: Record<string, string> = {};
  if (debouncedSearch) filters.search = debouncedSearch;
  if (stageFilter !== "All stages") filters.stage = stageFilter;
  if (locFilter !== "Any location") filters.location = locFilter;
  if (expFilter !== "Any") filters.experience = expFilter;

  const { data, isLoading } = useCandidates(filters);
  const rows = data?.data || [];

  function downloadCSV() {
    if (!rows.length) {
      toast.error("No candidates available to export");
      return;
    }
    const headers = ["Name", "Email", "Role", "Location", "Experience", "Stage", "Score", "Skills"];
    const csvLines = [
      headers.join(","),
      ...rows.map((c: any) =>
        [
          `"${c.name || ''}"`,
          `"${c.email || ''}"`,
          `"${c.role || ''}"`,
          `"${c.loc || ''}"`,
          `"${c.exp || ''}"`,
          `"${c.stage || ''}"`,
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

  const handleMoveStage = (candidateId: string, toStageName: string) => {
    moveStageMutation.mutate({ candidateId, toStageName }, {
      onSuccess: () => {
        toast.success(`Moved candidate to ${toStageName}`);
      }
    });
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
        description="A single view of every candidate across roles and pipelines."
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
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search by name, skill, role…" 
            className="pl-8" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Stage" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All stages">All stages</SelectItem>
            <SelectItem value="Applied">Applied</SelectItem>
            <SelectItem value="Screening">Screening</SelectItem>
            <SelectItem value="Interview">Interview</SelectItem>
            <SelectItem value="Offer">Offer</SelectItem>
            <SelectItem value="Hired">Hired</SelectItem>
          </SelectContent>
        </Select>
        <Select value={locFilter} onValueChange={setLocFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Location" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Any location">Any location</SelectItem>
            <SelectItem value="Remote">Remote</SelectItem>
            <SelectItem value="San Francisco">San Francisco</SelectItem>
            <SelectItem value="New York">New York</SelectItem>
            <SelectItem value="London">London</SelectItem>
            <SelectItem value="Berlin">Berlin</SelectItem>
          </SelectContent>
        </Select>
        <Select value={expFilter} onValueChange={setExpFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Experience" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Any">Any exp</SelectItem>
            <SelectItem value="1-3">1-3 years</SelectItem>
            <SelectItem value="3-5">3-5 years</SelectItem>
            <SelectItem value="5+">5+ years</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead className="text-right">AI Score</TableHead>
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
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-6 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                    No candidates found matching your filter criteria.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((c: any) => (
                  <TableRow key={c.id} className="cursor-pointer hover:bg-secondary/40" onClick={() => setSelectedCandidateId(c.id)}>
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
                    <TableCell className="text-sm text-muted-foreground">{c.exp}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(c.skills || []).slice(0, 3).map((s: string) => (
                          <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
                        ))}
                        {(c.skills || []).length > 3 && (
                          <Badge variant="outline" className="text-[10px]">+{c.skills.length - 3}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${stageColor[c.stage] || ""}`}>
                        {c.stage}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold tabular-nums">{c.score}</TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-7">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setSelectedCandidateId(c.id)} className="gap-2">
                            <User className="size-4" /> View Profile & Notes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => copyEmail(c.email)} className="gap-2">
                            <Copy className="size-4" /> Copy Email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="gap-2">
                              <ArrowRightLeft className="size-4" /> Move Stage
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="w-36">
                              {["Applied", "Screening", "Interview", "Offer", "Hired"].map((stage) => (
                                <DropdownMenuItem 
                                  key={stage} 
                                  onClick={() => handleMoveStage(c.id, stage)}
                                  disabled={c.stage === stage}
                                >
                                  {stage}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
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

      <CreateCandidateDialog open={isCreateCandidateOpen} onOpenChange={setIsCreateCandidateOpen} />
      <CandidateDetailSheet 
        candidateId={selectedCandidateId} 
        open={!!selectedCandidateId} 
        onOpenChange={(open) => !open && setSelectedCandidateId(null)} 
      />
    </div>
  );
}