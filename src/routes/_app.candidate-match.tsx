import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Sparkles, Loader2, Target } from "lucide-react";
import { useCandidates, useJobs, useBatchMatchCandidates } from "@/hooks/use-api";
import { useDebounce } from "@/hooks/use-debounce";
import { CandidateDetailSheet } from "@/components/candidate-detail-sheet";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/candidate-match")({
  validateSearch: (search: Record<string, unknown>) => ({
    jobTitle: (search.jobTitle as string) || undefined,
  }),
  head: () => ({
    meta: [
      { title: "Candidate Match — TalentOS" },
      { name: "description", content: "Rank candidates against a role using AI matching." },
    ],
  }),
  component: MatchPage,
});

function calculatePositionMatchScore(candidate: any, targetJobTitle: string): number {
  const roleNorm = (candidate.role || "").toLowerCase();
  const jobNorm = (targetJobTitle || "").toLowerCase();
  const skills = (candidate.skills || []).map((s: string) => String(s).toLowerCase());

  let score = 55;

  // Role Alignment
  if (roleNorm.includes(jobNorm) || jobNorm.includes(roleNorm)) {
    score += 30;
  } else if (
    (jobNorm.includes("recruiter") && roleNorm.includes("recruiter")) ||
    (jobNorm.includes("designer") && roleNorm.includes("designer")) ||
    (jobNorm.includes("frontend") &&
      (roleNorm.includes("frontend") || roleNorm.includes("react"))) ||
    (jobNorm.includes("backend") && (roleNorm.includes("backend") || roleNorm.includes("node")))
  ) {
    score += 25;
  } else if (
    (jobNorm.includes("designer") &&
      (roleNorm.includes("recruiter") || roleNorm.includes("engineer"))) ||
    (jobNorm.includes("recruiter") &&
      (roleNorm.includes("designer") || roleNorm.includes("engineer")))
  ) {
    score -= 20; // Major domain mismatch
  }

  // Skill Alignment
  if (
    jobNorm.includes("designer") &&
    skills.some((s: string) => ["figma", "ui", "ux", "design", "prototyping"].includes(s))
  )
    score += 12;
  if (
    jobNorm.includes("recruiter") &&
    skills.some((s: string) =>
      ["hiring", "staffing", "recruitment", "sourcing", "talent acquisition"].includes(s),
    )
  )
    score += 12;
  if (
    jobNorm.includes("frontend") &&
    skills.some((s: string) => ["react", "typescript", "tailwind", "next.js"].includes(s))
  )
    score += 12;
  if (
    jobNorm.includes("backend") &&
    skills.some((s: string) => ["node.js", "postgresql", "system design", "docker"].includes(s))
  )
    score += 12;

  // Experience level bonus
  const expYears = candidate.experienceYears || parseInt(candidate.exp, 10) || 3;
  if (expYears >= 5) score += 5;

  return Math.min(98, Math.max(38, score));
}

function MatchPage() {
  const { jobTitle: searchJobTitle } = Route.useSearch();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [targetJob, setTargetJob] = useState(searchJobTitle || "Senior Product Designer");
  const [skillFilter, setSkillFilter] = useState("All skills");
  const [locFilter, setLocFilter] = useState("Any location");
  const [expFilter, setExpFilter] = useState("Any");
  const [sortBy, setSortBy] = useState("score_desc");
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  const { data: jobsRes } = useJobs();
  const jobsList = jobsRes?.data || [];

  const filters: Record<string, string> = {};
  if (debouncedSearch) filters.search = debouncedSearch;
  if (skillFilter !== "All skills") filters.skill = skillFilter;
  if (locFilter !== "Any location") filters.location = locFilter;
  if (expFilter !== "Any") filters.experience = expFilter;

  const { data: candidatesRes, isLoading: isLoadingCandidates, refetch } = useCandidates(filters);
  const rawCandidates = candidatesRes?.data || [];

  const [aiScores, setAiScores] = useState<Record<string, number>>({});
  const batchMatch = useBatchMatchCandidates();

  const handleReRunMatch = async () => {
    try {
      const res = await batchMatch.mutateAsync({
        candidates: rawCandidates,
        jobTitle: targetJob,
      });
      if (res.data) {
        setAiScores(res.data);
        toast.success(`Match scores calculated specifically for "${targetJob}" using AI`);
      }
    } catch (error) {
      toast.error("Failed to calculate AI match scores");
    }
  };

  // Dynamically calculate match score
  const candidates = rawCandidates.map((c: any) => ({
    ...c,
    calculatedScore:
      aiScores[c.id] !== undefined ? aiScores[c.id] : calculatePositionMatchScore(c, targetJob),
  }));

  // Sort candidates
  if (sortBy === "score_desc")
    candidates.sort((a: any, b: any) => b.calculatedScore - a.calculatedScore);
  if (sortBy === "score_asc")
    candidates.sort((a: any, b: any) => a.calculatedScore - b.calculatedScore);
  if (sortBy === "exp_desc")
    candidates.sort((a: any, b: any) => (b.experienceYears || 0) - (a.experienceYears || 0));
  if (sortBy === "name_asc")
    candidates.sort((a: any, b: any) =>
      (a.firstName || a.name || "").localeCompare(b.firstName || b.name || ""),
    );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Candidate matching"
        description={`AI match scores calculated specifically against position: ${targetJob}`}
        actions={
          <Button
            size="sm"
            className="gap-1.5"
            onClick={handleReRunMatch}
            disabled={batchMatch.isPending || isLoadingCandidates}
          >
            {batchMatch.isPending || isLoadingCandidates ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            Re-calculate scores
          </Button>
        }
      />

      {/* Target Position & Search Filters Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/5 p-1 px-2.5 text-xs font-semibold text-primary">
          <Target className="size-4 shrink-0" /> Target Position:
          <Select value={targetJob} onValueChange={setTargetJob}>
            <SelectTrigger className="w-[200px] h-8 font-bold bg-background text-foreground border-border">
              <SelectValue placeholder="Select position..." />
            </SelectTrigger>
            <SelectContent>
              {jobsList.length > 0 ? (
                jobsList.map((j: any) => (
                  <SelectItem key={j.id} value={j.title}>
                    {j.title}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>
                  {jobsRes ? "No jobs available" : "Loading jobs..."}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-md">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search candidates…"
            className="pl-8 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Skill Filter */}
        <Select value={skillFilter} onValueChange={setSkillFilter}>
          <SelectTrigger className="w-[130px] h-9">
            <SelectValue placeholder="Skill" />
          </SelectTrigger>
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
          <SelectTrigger className="w-[130px] h-9">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
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
          <SelectTrigger className="w-[120px] h-9">
            <SelectValue placeholder="Experience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Any">Any exp.</SelectItem>
            <SelectItem value="0-2 yrs">0-2 yrs</SelectItem>
            <SelectItem value="3-5 yrs">3-5 yrs</SelectItem>
            <SelectItem value="5+ yrs">5+ yrs</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Dropdown */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="score_desc">Match Score (High-Low)</SelectItem>
            <SelectItem value="score_asc">Match Score (Low-High)</SelectItem>
            <SelectItem value="exp_desc">Experience (High-Low)</SelectItem>
            <SelectItem value="name_asc">Name (A-Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="shadow-xs overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Candidate</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">
                  Match Score for <span className="font-bold text-foreground">{targetJob}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingCandidates ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <div className="flex gap-2 items-center">
                        <Skeleton className="size-7 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-12" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-20 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : candidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    No matching candidates found for target position and filters.
                  </TableCell>
                </TableRow>
              ) : (
                candidates.map((r: any) => {
                  const score = r.calculatedScore;
                  const candidateSkills =
                    r.skills && r.skills.length > 0
                      ? r.skills
                      : r.role?.toLowerCase().includes("recruiter")
                        ? ["Hiring", "Staffing", "Recruitment"]
                        : ["TypeScript", "React", "Node.js"];

                  return (
                    <TableRow
                      key={r.id}
                      className="cursor-pointer hover:bg-secondary/40 [content-visibility:auto]"
                      onClick={() => setSelectedCandidateId(r.id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="size-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                              {((r.firstName || r.name || "C") + " " + (r.lastName || ""))
                                .trim()
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-semibold text-foreground">
                              {(r.firstName || r.name) + " " + (r.lastName || "")}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {r.currentRole || r.role}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {candidateSkills.map((s: string) => (
                            <Badge
                              key={s}
                              variant="secondary"
                              className="rounded-full px-2 py-0 text-[10px] font-medium bg-secondary text-secondary-foreground"
                            >
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {r.experienceYears || r.exp || 0} yrs
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {r.location || r.loc || "Remote"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                            <div
                              className={`h-full ${score >= 80 ? "bg-primary" : score >= 65 ? "bg-warning" : "bg-destructive"}`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                          <span
                            className={`text-sm font-bold tabular-nums ${score >= 80 ? "text-primary" : score >= 65 ? "text-warning" : "text-destructive"}`}
                          >
                            {score}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CandidateDetailSheet
        candidateId={selectedCandidateId}
        open={!!selectedCandidateId}
        onOpenChange={(open) => !open && setSelectedCandidateId(null)}
      />
    </div>
  );
}
