import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCandidate, useAddNote } from "@/hooks/use-api";
import { MapPin, Briefcase, Mail, Phone, Sparkles, Send } from "lucide-react";
import { toast } from "sonner";

interface CandidateDetailSheetProps {
  candidateId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CandidateDetailSheet({ candidateId, open, onOpenChange }: CandidateDetailSheetProps) {
  const { data: candidateData, isLoading } = useCandidate(candidateId || "");
  const candidate = candidateData?.data;
  const [newNote, setNewNote] = useState("");
  const addNoteMutation = useAddNote();

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
            </SheetHeader>

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
                <div className="text-xs font-medium text-muted-foreground">Top Skills & Competencies</div>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.skills.map((s: any) => (
                    <span key={s.id || s.name} className="rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs for Resume / Notes */}
            <Tabs defaultValue="resume" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="resume">Resume & Background</TabsTrigger>
                <TabsTrigger value="notes">Notes ({candidate.applications?.[0]?.notes?.length || 0})</TabsTrigger>
              </TabsList>

              <TabsContent value="resume" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Executive Summary</div>
                  <p className="text-xs text-foreground/90 leading-relaxed bg-secondary/30 p-3 rounded-lg border border-border">
                    {candidate.summary || `${candidate.firstName} is an experienced professional with background in ${candidate.currentRole || 'software development'}.`}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="notes" className="space-y-4 pt-4">
                <form onSubmit={handleAddNote} className="space-y-2">
                  <Textarea
                    placeholder="Add interview feedback or notes..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={3}
                    className="text-xs"
                  />
                  <div className="flex justify-end">
                    <Button type="submit" size="sm" className="gap-1.5 text-xs" disabled={addNoteMutation.isPending}>
                      <Send className="size-3" /> Add Note
                    </Button>
                  </div>
                </form>

                <div className="space-y-3 pt-2">
                  {candidate.applications?.[0]?.notes?.length > 0 ? (
                    candidate.applications[0].notes.map((note: any) => (
                      <div key={note.id} className="rounded-lg border border-border bg-card p-3 space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span className="font-semibold text-foreground">{note.author?.firstName || "Team Member"}</span>
                          <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-foreground/90">{note.content}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-xs text-muted-foreground">No notes added yet.</div>
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
