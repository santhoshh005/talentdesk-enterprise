import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Download, Pencil, Sparkles, Loader2, Copy } from "lucide-react";
import { useGenerateInterviewKit } from "@/hooks/use-api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/interview-generator")({
  head: () => ({
    meta: [
      { title: "Interview Generator — TalentOS" },
      { name: "description", content: "Generate structured interview kits by category and difficulty." },
    ],
  }),
  component: InterviewGen,
});

type Question = { question: string, purpose?: string, followUp?: string };

function InterviewGen() {
  const [role, setRole] = useState("Senior Product Designer");
  const [seniority, setSeniority] = useState("sr");
  const [difficulty, setDifficulty] = useState("hard");
  const [duration, setDuration] = useState("45");
  
  const generateKit = useGenerateInterviewKit();
  const kitData = generateKit.data?.data;

  const handleGenerate = async () => {
    try {
      await generateKit.mutateAsync({
        jobTitle: role,
        stage: seniority
      });
      toast.success("Interview kit generated");
    } catch (err) {
      toast.error("Failed to generate interview kit");
    }
  };

  const copyAll = () => {
    if (!kitData) return;
    
    let text = `Interview Kit: ${role} (${seniority})\n\n`;
    
    if (kitData.behavioral) {
      text += `=== Behavioral ===\n`;
      kitData.behavioral.forEach((q: Question, i: number) => text += `${i+1}. ${q.question}\n`);
      text += '\n';
    }
    
    if (kitData.technical) {
      text += `=== Technical ===\n`;
      kitData.technical.forEach((q: Question, i: number) => text += `${i+1}. ${q.question}\n`);
      text += '\n';
    }
    
    if (kitData.situational) {
      text += `=== Situational ===\n`;
      kitData.situational.forEach((q: Question, i: number) => text += `${i+1}. ${q.question}\n`);
    }

    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Interview Generator"
        description="Generate role-specific, structured interview kits."
        actions={
          <>
            {kitData && <Button variant="outline" size="sm" className="gap-1.5" onClick={copyAll}><Copy className="size-4" /> Copy all</Button>}
            <Button variant="outline" size="sm" className="gap-1.5"><Download className="size-4" /> Export PDF</Button>
            <Button size="sm" className="gap-1.5" onClick={handleGenerate} disabled={generateKit.isPending}>
              {generateKit.isPending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} 
              {kitData ? "Regenerate" : "Generate kit"}
            </Button>
          </>
        }
      />
      <Card className="shadow-xs">
        <CardContent className="grid grid-cols-1 gap-4 p-5 md:grid-cols-4">
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Input value={role} onChange={e => setRole(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Seniority</Label>
            <Select value={seniority} onValueChange={setSeniority}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="jr">Junior</SelectItem>
                <SelectItem value="mid">Mid</SelectItem>
                <SelectItem value="sr">Senior</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Difficulty</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="med">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 min</SelectItem>
                <SelectItem value="45">45 min</SelectItem>
                <SelectItem value="60">60 min</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-xs min-h-[400px]">
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Question bank</CardTitle></CardHeader>
        <CardContent>
          {generateKit.isPending ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="size-8 text-primary animate-spin mb-4" />
              <p className="text-sm text-muted-foreground">Generating questions...</p>
            </div>
          ) : kitData ? (
            <Tabs defaultValue="behavioral">
              <TabsList>
                <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
                <TabsTrigger value="technical">Technical</TabsTrigger>
                <TabsTrigger value="situational">Situational</TabsTrigger>
              </TabsList>
              {(["behavioral","technical","situational"] as const).map((k) => (
                <TabsContent key={k} value={k} className="mt-4 space-y-3">
                  {kitData[k]?.map((q: Question, i: number) => (
                    <div key={i} className="group flex flex-col gap-2 rounded-md border border-border p-4 transition hover:border-primary/30">
                      <div className="flex items-start gap-3">
                        <Badge variant="secondary" className="mt-0.5 rounded-full shrink-0">{i+1}</Badge>
                        <p className="flex-1 text-sm font-medium">{q.question}</p>
                        <Button variant="ghost" size="icon" className="size-8 opacity-0 group-hover:opacity-100 shrink-0"><Pencil className="size-4" /></Button>
                      </div>
                      {q.purpose && (
                        <div className="ml-10 text-xs text-muted-foreground bg-secondary/30 p-2 rounded">
                          <span className="font-semibold">Purpose:</span> {q.purpose}
                        </div>
                      )}
                      {q.followUp && (
                        <div className="ml-10 text-xs text-muted-foreground bg-secondary/30 p-2 rounded">
                          <span className="font-semibold">Follow-up:</span> {q.followUp}
                        </div>
                      )}
                    </div>
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Sparkles className="size-8 text-muted-foreground mb-4 opacity-50" />
              <p className="text-sm text-muted-foreground">Click generate to create an interview kit</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}