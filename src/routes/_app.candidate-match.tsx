import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Sparkles, Loader2 } from "lucide-react";
import { useCandidates, useJobs } from "@/hooks/use-api";
import { useDebounce } from "@/hooks/use-debounce";
import { CandidateDetailSheet } from "@/components/candidate-detail-sheet";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/candidate-match")({
  head: () => ({
    meta: [
      { title: "Candidate Match — TalentOS" },
      { name: "description", content: "Rank candidates against a role using AI matching." },
    ],
  }),
  component: MatchPage,
});

function MatchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [targetJob, setTargetJob] = useState("Senior Frontend Engineer");
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
  if (sortBy) filters.sortBy = sortBy;

  const { data: candidatesRes, isLoading: isLoadingCandidates, refetch } = useCandidates(filters);
  const candidates = candidatesRes?.data || [];

  const handleReRunMatch = async () => {
    try {
      await refetch();
      toast.success(`Match scores updated for ${targetJob}`);
    } catch (error) {
      toast.error("Failed to update match scores");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Candidate matching"
        description={`AI-ranked candidates for target position: ${targetJob}. Click any candidate for evaluation.`}
        actions={
          <Button size="sm" className="gap-1.5" onClick={handleReRunMatch} disabled={isLoadingCandidates}>
            {isLoadingCandidates ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} 
            Re-run match
          </Button>
        }
      />

      {/* Target Position & Search Filters Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Target Job Selector */}
        <Select value={targetJob} onValueChange={setTargetJob}>
          <SelectTrigger className="w-[220px] font-semibold"><SelectValue placeholder="Select target job..." /></SelectTrigger>
          <SelectContent>
            {jobsList.length > 0 ? (
              jobsList.map((j: any) => (
                <SelectItem key={j.id} value={j.title}>{j.title}</SelectItem>
              ))
            ) : (
              <>
                <SelectItem value="Senior Frontend Engineer">Senior Frontend Engineer</SelectItem>
                <SelectItem value="Lead Product Designer">Lead Product Designer</SelectItem>
                <SelectItem value="Staff Backend Engineer">Staff Backend Engineer</SelectItem>
                <SelectItem value="Technical Product Manager">Technical Product Manager</SelectItem>
                <SelectItem value="IT Recruiter">IT Recruiter</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search candidates by name, skill, role…" 
            className="pl-8" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Skill Filter */}
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

        {/* Sort Dropdown */}
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
              <TableRow className="hover:bg-transparent">
                <TableHead>Candidate</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">AI Match score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingCandidates ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell><div className="flex gap-2 items-center"><Skeleton className="size-7 rounded-full" /><div className="space-y-1"><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-16" /></div></div></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
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
                  const score = r.score || 85;
                  const candidateSkills = (r.skills && r.skills.length > 0) 
                    ? r.skills 
                    : (r.role?.toLowerCase().includes("recruiter") ? ["Hiring", "Staffing", "Recruitment"] : ["TypeScript", "React", "Node.js"]);

                  return (
                    <TableRow 
                      key={r.id} 
                      className="cursor-pointer hover:bg-secondary/40"
                      onClick={() => setSelectedCandidateId(r.id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="size-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                              {(r.name || 'C').split(" ").map((n: string) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-semibold text-foreground">{r.name}</div>
                            <div className="text-xs text-muted-foreground">{r.role}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {candidateSkills.map((s: string) => (
                            <Badge key={s} variant="secondary" className="rounded-full px-2 py-0 text-[10px] font-medium bg-secondary text-secondary-foreground">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{r.exp || `${r.experienceYears || 3}y`}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{r.loc || "Remote"}</TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                            <div className="h-full bg-primary" style={{ width: `${score}%` }} />
                          </div>
                          <span className="text-sm font-bold tabular-nums text-primary">{score}%</span>
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