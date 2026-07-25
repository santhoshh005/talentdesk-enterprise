import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Sparkles, Loader2 } from "lucide-react";
import { useCandidates } from "@/hooks/use-api";
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
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  
  const { data: candidatesRes, isLoading: isLoadingCandidates, refetch } = useCandidates({
    search: debouncedSearch,
  });
  
  const candidates = candidatesRes?.data || [];

  const handleReRunMatch = async () => {
    if (!candidates.length) return;
    try {
      await refetch();
      toast.success("Match scores updated with latest AI calculations");
    } catch (error) {
      toast.error("Failed to update match scores");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Candidate matching"
        description="AI-ranked candidates for a specific role. Click any candidate to view full evaluation profile."
        actions={
          <Button size="sm" className="gap-1.5" onClick={handleReRunMatch} disabled={isLoadingCandidates}>
            {isLoadingCandidates ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} 
            Re-run match
          </Button>
        }
      />
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search candidates by name, skill, role…" 
            className="pl-8" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
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
                    No candidates found in talent database.
                  </TableCell>
                </TableRow>
              ) : (
                candidates.map((r: any) => {
                  const score = r.score || 85;
                  return (
                    <TableRow 
                      key={r.id} 
                      className="cursor-pointer hover:bg-secondary/40"
                      onClick={() => setSelectedCandidateId(r.id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="size-7"><AvatarFallback className="bg-secondary text-[10px]">{r.name?.split(" ").map((n: string)=>n[0]).join("")}</AvatarFallback></Avatar>
                          <div>
                            <div className="text-sm font-medium">{r.name}</div>
                            <div className="text-xs text-muted-foreground">{r.role}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {r.skills?.slice(0, 3).map((s: string)=><Badge key={s} variant="secondary" className="rounded-full px-2 py-0 text-[10px]">{s}</Badge>)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{r.exp || `${r.experienceYears || 3}y`}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{r.loc || "Remote"}</TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                            <div className="h-full bg-primary" style={{ width: `${score}%` }} />
                          </div>
                          <span className="text-sm font-semibold tabular-nums">{score}%</span>
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