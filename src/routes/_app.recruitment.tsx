import { createFileRoute } from "@tanstack/react-router";
import { Plus, Filter } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { useJobs, useJobPipeline, useMoveStage } from "@/hooks/use-api";
import { CreateCandidateDialog } from "@/components/create-candidate-dialog";
import { CandidateDetailSheet } from "@/components/candidate-detail-sheet";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/recruitment")({
  head: () => ({
    meta: [
      { title: "Recruitment — TalentOS" },
      { name: "description", content: "Kanban pipeline of active candidates by stage." },
    ],
  }),
  component: RecruitmentPage,
});

function RecruitmentPage() {
  const { data: jobsData, isLoading: jobsLoading } = useJobs({});
  const jobs = jobsData?.data || [];
  
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [isCreateCandidateOpen, setIsCreateCandidateOpen] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  useEffect(() => {
    if (jobs.length > 0 && !selectedJobId) {
      setSelectedJobId(jobs[0].id);
    }
  }, [jobs, selectedJobId]);

  const { data: pipelineData, isLoading: pipelineLoading } = useJobPipeline(selectedJobId);

  const moveStageMutation = useMoveStage();

  const handleMoveStage = (applicationId: string, toStageName: string) => {
    moveStageMutation.mutate({ applicationId, toStageName }, {
      onSuccess: () => {
        toast.success(`Candidate moved to ${toStageName}`);
      },
      onError: () => {
        toast.error("Failed to move candidate");
      }
    });
  };

  const columns = pipelineData?.data?.stages || [];
  const stageNames = columns.map((c: any) => c.name);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex-1">
          <PageHeader
            title="Recruitment pipeline"
            description="Manage candidates across stages for selected roles."
          />
        </div>
        <div className="flex items-center gap-2 pb-2">
          {jobsLoading ? (
            <Skeleton className="h-9 w-[250px]" />
          ) : (
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger className="w-[250px] h-9">
                <SelectValue placeholder="Select a job" />
              </SelectTrigger>
              <SelectContent>
                {jobs.map((j: any) => (
                  <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button size="sm" className="gap-1.5 h-9" onClick={() => setIsCreateCandidateOpen(true)}>
            <Plus className="size-4" /> Add candidate
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5 overflow-x-auto pb-4">
        {pipelineLoading && selectedJobId ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-lg bg-secondary/50 p-3 min-w-[280px]">
              <div className="flex justify-between items-center px-1 mb-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-6 rounded-full" />
              </div>
              {Array.from({ length: 3 }).map((_, j) => (
                <Card key={j} className="shadow-xs"><CardContent className="p-3"><Skeleton className="h-10 w-full mb-2" /><Skeleton className="h-4 w-full" /></CardContent></Card>
              ))}
            </div>
          ))
        ) : columns.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            {selectedJobId ? "No pipeline data for this job." : "Select a job to view the pipeline."}
          </div>
        ) : columns.map((col: any) => (
          <div key={col.id || col.name} className="flex flex-col gap-2 rounded-lg bg-secondary/50 p-3 min-w-[280px]">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{col.name}</span>
                <Badge variant="secondary" className="rounded-full bg-background px-1.5 text-[10px]">{col.count}</Badge>
              </div>
              <Button variant="ghost" size="icon" className="size-6" onClick={() => setIsCreateCandidateOpen(true)}><Plus className="size-3.5" /></Button>
            </div>
            <div className="flex flex-col gap-2">
              {col.candidates?.map((c: any) => (
                <Card 
                  key={c.id || c.applicationId} 
                  className="shadow-xs cursor-pointer transition hover:border-primary/40"
                  onClick={() => setSelectedCandidateId(c.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="size-7">
                        <AvatarFallback className="bg-background text-[10px]">
                          {(c.name || "U").split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{c.name}</div>
                        <div className="truncate text-xs text-muted-foreground">{c.role}</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">Match:</span>
                        <span className="font-medium tabular-nums text-foreground">{c.score || "—"}</span>
                      </div>
                    </div>
                    
                    <div className="mt-2 pt-2 border-t border-border" onClick={(e) => e.stopPropagation()}>
                      <Select 
                        value={col.name} 
                        onValueChange={(val) => {
                          if (val !== col.name) handleMoveStage(c.applicationId, val);
                        }}
                      >
                        <SelectTrigger className="h-7 text-xs bg-secondary/50 border-0">
                          <SelectValue placeholder="Move to..." />
                        </SelectTrigger>
                        <SelectContent>
                          {stageNames.map((stage: string) => (
                            <SelectItem key={stage} value={stage} disabled={stage === col.name} className="text-xs">
                              Move to {stage}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <CreateCandidateDialog open={isCreateCandidateOpen} onOpenChange={setIsCreateCandidateOpen} />
      <CandidateDetailSheet 
        candidateId={selectedCandidateId} 
        open={!!selectedCandidateId} 
        onOpenChange={(open) => !open && setSelectedCandidateId(null)} 
      />
    </div>
  );
}