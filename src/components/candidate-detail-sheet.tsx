import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCandidate, useAddNote, useMoveStage } from "@/hooks/use-api";
import { MapPin, Briefcase, Mail, Phone, Calendar, Sparkles, Send, User } from "lucide-react";
import { toast } from "sonner";

interface CandidateDetailSheetProps {
  candidateId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const stageColors: Record<string, string> = {
  Applied: "bg-secondary text-secondary-foreground",
  Screening: "bg-warning/10 text-warning",
  Interview: "bg-primary/10 text-primary",
  Offer: "bg-success/10 text-success",
  Hired: "bg-success text-success-foreground",
};

export function CandidateDetailSheet({ candidateId, open, onOpenChange }: CandidateDetailSheetProps) {
  const { data: candidateData, isLoading } = useCandidate(candidateId || "");
  const candidate = candidateData?.data;
  const [newNote, setNewNote] = useState("");
  const addNoteMutation = useAddNote();
  const moveStageMutation = useMoveStage();

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !candidate?.applications?.[0]?.id) {
      toast.error("Please enter a note");
      return;
    }
    const appId = candidate.applications[0].id;
    addNoteMutation.mutate(
      { applicationId: appId, content: newNote },
      {
        onSuccess: () => {
          setNewNote("");
        },
      }
    );
  };

  const handleMoveStage = (toStageName: string) => {
    if (!candidate) return;
    const appId = candidate.applications?.[0]?.id;
    moveStageMutation.mutate({
      candidateId: candidate.id,
      applicationId: appId,
      toStageName,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-6">
        {isLoading || !candidate ? (
          <div className="flex h-full items-center justify-center">
            <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <SheetHeader className="text-left pb-4 border-b">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="size-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-base">
                      {candidate.firstName?.[0]}{candidate.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <SheetTitle className="text-xl font-bold">{candidate.firstName} {candidate.lastName}</SheetTitle>
                    <SheetDescription className="text-sm font-medium text-foreground/80 mt-0.5">
                      {candidate.currentRole || "Candidate"}
                    </SheetDescription>
                  </div>
                </div>
                <Badge variant="secondary" className={`rounded-full px-3 py-1 text-xs font-semibold ${stageColors[candidate.stage] || ""}`}>
                  {candidate.stage || "Applied"}
                </Badge>
              </div>
            </SheetHeader>

            {/* Quick Actions Bar */}
            <div className="flex items-center justify-between gap-3 p-3 bg-secondary/50 rounded-lg">
              <div className="text-xs font-medium text-muted-foreground">Move Pipeline Stage:</div>
              <Select value={candidate.stage || "Applied"} onValueChange={handleMoveStage}>
                <SelectTrigger className="w-[160px] h-8 text-xs font-medium bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Applied">Applied</SelectItem>
                  <SelectItem value="Screening">Screening</SelectItem>
                  <SelectItem value="Interview">Interview</SelectItem>
                  <SelectItem value="Offer">Offer</SelectItem>
                  <SelectItem value="Hired">Hired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* AI Summary Banner */}
            {candidate.aiSummary && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                  <Sparkles className="size-4" /> AI Candidate Evaluation ({candidate.qualityScore || 85}% Match)
                </div>
                <p className="text-xs leading-relaxed text-foreground/90">{candidate.aiSummary}</p>
              </div>
            )}

            {/* Contact Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="size-3.5 shrink-0" />
                <span className="truncate text-foreground font-medium">{candidate.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" />
                <span className="truncate text-foreground font-medium">{candidate.location || "Remote"}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Briefcase className="size-3.5 shrink-0" />
                <span className="truncate text-foreground font-medium">{candidate.experienceYears || 3} Years Exp</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="size-3.5 shrink-0" />
                <span className="truncate text-foreground font-medium">{candidate.phone || "Not provided"}</span>
              </div>
            </div>

            {/* Skills */}
            {candidate.skills && candidate.skills.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Skills</div>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.skills.map((s: any) => (
                    <Badge key={s.id || s.name || s} variant="secondary" className="text-xs">
                      {s.name || s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs Section */}
            <Tabs defaultValue="overview" className="mt-2">
              <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
                <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Overview</TabsTrigger>
                <TabsTrigger value="notes" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Notes & Feedback</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="pt-4 space-y-4 text-xs">
                {candidate.summary && (
                  <div>
                    <div className="font-semibold text-muted-foreground mb-1">Executive Summary</div>
                    <p className="text-muted-foreground leading-relaxed bg-secondary/30 p-3 rounded-md">{candidate.summary}</p>
                  </div>
                )}

                {candidate.applications && candidate.applications.length > 0 && (
                  <div>
                    <div className="font-semibold text-muted-foreground mb-2">Active Requisitions</div>
                    {candidate.applications.map((app: any) => (
                      <div key={app.id} className="flex items-center justify-between p-3 rounded-lg border bg-card text-xs">
                        <div>
                          <div className="font-medium text-foreground">{app.job?.title || "Requisition"}</div>
                          <div className="text-muted-foreground text-[11px]">Applied {new Date(app.createdAt).toLocaleDateString()}</div>
                        </div>
                        <Badge variant="outline">{app.pipelineStage?.name || "Applied"}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="notes" className="pt-4 space-y-4">
                <form onSubmit={handleAddNote} className="space-y-2">
                  <Textarea 
                    placeholder="Add interview feedback or notes about this candidate…" 
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="text-xs min-h-[80px]"
                  />
                  <Button type="submit" size="sm" className="gap-1.5 text-xs ml-auto flex" disabled={addNoteMutation.isPending}>
                    <Send className="size-3.5" /> Add Note
                  </Button>
                </form>

                <div className="space-y-2 pt-2">
                  {candidate.applications?.[0]?.notes && candidate.applications[0].notes.length > 0 ? (
                    candidate.applications[0].notes.map((note: any) => (
                      <div key={note.id} className="p-3 rounded-lg border bg-secondary/20 space-y-1 text-xs">
                        <div className="flex items-center justify-between font-medium">
                          <span className="text-foreground">{note.author?.firstName ? `${note.author.firstName} ${note.author.lastName}` : "Recruiter"}</span>
                          <span className="text-[10px] text-muted-foreground">{new Date(note.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-muted-foreground">{note.content}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-xs text-muted-foreground">No notes added yet. Use the box above to record interview feedback.</div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
