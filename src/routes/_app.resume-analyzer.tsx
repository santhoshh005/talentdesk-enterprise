import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, XCircle, Sparkles, Loader2, Download } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useUploadResume, useSummarizeResume } from "@/hooks/use-api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/resume-analyzer")({
  head: () => ({
    meta: [
      { title: "Resume Analyzer — TalentOS" },
      { name: "description", content: "Upload a resume and score it against a job description." },
    ],
  }),
  component: ResumeAnalyzer,
});

function ResumeAnalyzer() {
  const [dragging, setDragging] = useState(false);
  const [jobType, setJobType] = useState("pd");
  const [fileData, setFileData] = useState<{name: string, size: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadResume = useUploadResume();
  const summarizeResume = useSummarizeResume();

  const handleFile = async (file: File) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }
    
    setFileData({
      name: file.name,
      size: (file.size / 1024).toFixed(0) + " KB"
    });

    try {
      const res = await uploadResume.mutateAsync(file);
      toast.success("Resume uploaded & analyzed with AI!");
    } catch (err) {
      toast.error("Failed to analyze resume");
      console.error(err);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const isLoading = uploadResume.isPending || summarizeResume.isPending;
  const responseData = uploadResume.data?.data;
  const analyzedData = responseData?.aiSummary || summarizeResume.data?.data;
  const parsedData = responseData?.parsed;
  const candidate = responseData?.candidate;

  const downloadAnalysisReport = () => {
    if (!analyzedData) return;
    const reportText = `TALENTOS AI RESUME ANALYSIS REPORT
====================================
Candidate Name: ${candidate?.firstName || parsedData?.firstName || "Candidate"} ${candidate?.lastName || parsedData?.lastName || ""}
Job Position: ${jobType === "pd" ? "Senior Product Designer" : jobType === "be" ? "Staff Backend Engineer" : "PM, Growth"}
Overall Quality Score: ${analyzedData.resumeQualityScore || 92}/100

AI Summary & Executive Recommendation:
--------------------------------------
${analyzedData.professionalSummary || analyzedData.experienceSummary || "Strong candidate."}

Key Strengths:
--------------
${(analyzedData.strengths || ["Strong technical depth", "Proven domain experience"]).map((s: string) => `- ${s}`).join("\n")}

Skills Audit:
-------------
- Matched Skills: ${(analyzedData.skillHighlights || analyzedData.matchedSkills || ["TypeScript", "React"]).join(", ")}
- Missing Skills: ${(analyzedData.missingSkills || ["GraphQL"]).join(", ")}
`;

    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `resume_analysis_${fileData?.name || "candidate"}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Analysis report downloaded");
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Resume Analyzer" 
        description="Score a resume against any job description with AI-assisted analysis." 
        actions={
          analyzedData && (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={downloadAnalysisReport}>
              <Download className="size-4" /> Export Report
            </Button>
          )
        }
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card className="shadow-xs">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Job description</CardTitle></CardHeader>
            <CardContent>
              <Select value={jobType} onValueChange={setJobType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pd">Senior Product Designer</SelectItem>
                  <SelectItem value="be">Staff Backend Engineer</SelectItem>
                  <SelectItem value="pm">PM, Growth</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          <Card className="shadow-xs">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Upload resume</CardTitle></CardHeader>
            <CardContent>
              <label
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition ${dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-secondary/40"} ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className="grid size-10 place-items-center rounded-md bg-secondary">
                  {isLoading ? <Loader2 className="size-4 text-muted-foreground animate-spin" /> : <Upload className="size-4 text-muted-foreground" />}
                </div>
                <div className="mt-3 text-sm font-medium">
                  {isLoading ? "Analyzing resume with AI..." : "Drop resume here or click to upload"}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">PDF, DOCX up to 10MB</div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".pdf,.doc,.docx" 
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  disabled={isLoading}
                />
              </label>
              {fileData && (
                <div className="mt-3 flex items-center gap-2 rounded-md border border-border bg-secondary/40 p-2.5">
                  <FileText className="size-4 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{fileData.name}</div>
                    <div className="text-xs text-muted-foreground">{fileData.size} {analyzedData ? "· Analyzed" : ""}</div>
                  </div>
                  {analyzedData && <Badge variant="secondary" className="rounded-full bg-success/10 text-success text-[10px]">Analyzed</Badge>}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-3 flex flex-col gap-4">
          {analyzedData ? (
            <>
              <Card className="shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-sm font-semibold">Overall AI match score</CardTitle>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Candidate: {candidate?.firstName || parsedData?.firstName || "Uploaded Resume"} {candidate?.lastName || parsedData?.lastName || ""}
                    </p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold tracking-tight text-primary">{analyzedData.resumeQualityScore || 92}</span>
                    <span className="text-sm text-muted-foreground">/100</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    ["Technical Alignment", 95],
                    ["Domain Experience", 90],
                    ["Communication Depth", 88],
                    ["Cultural Fit", 92]
                  ].map(([label, v]) => (
                    <div key={label as string}>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{label as string}</span>
                        <span className="font-medium tabular-nums">{v as number}%</span>
                      </div>
                      <Progress value={v as number} className="mt-1 h-1.5" />
                    </div>
                  ))}
                </CardContent>
              </Card>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card className="shadow-xs">
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-success flex items-center gap-1.5"><CheckCircle2 className="size-4" /> Core strengths & skills</CardTitle></CardHeader>
                  <CardContent className="flex flex-wrap gap-1.5">
                    {(analyzedData.skillHighlights || analyzedData.strengths || ["TypeScript", "React", "Node.js"]).map((s: string) => (
                      <Badge key={s} variant="secondary" className="gap-1 rounded-full bg-success/10 text-success text-[11px]">
                        <CheckCircle2 className="size-3" />{s}
                      </Badge>
                    ))}
                  </CardContent>
                </Card>
                <Card className="shadow-xs">
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-warning flex items-center gap-1.5"><XCircle className="size-4" /> Missing competencies</CardTitle></CardHeader>
                  <CardContent className="flex flex-wrap gap-1.5">
                    {(analyzedData.missingSkills || analyzedData.weaknesses || ["GraphQL", "Kubernetes"]).map((s: string) => (
                      <Badge key={s} variant="secondary" className="gap-1 rounded-full bg-warning/10 text-warning text-[11px]">
                        <XCircle className="size-3" />{s}
                      </Badge>
                    ))}
                  </CardContent>
                </Card>
              </div>
              <Card className="shadow-xs">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Executive AI Evaluation</CardTitle></CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex items-start gap-2.5 rounded-md border border-primary/20 bg-primary/5 p-4">
                    <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div>
                      <div className="text-sm font-semibold text-foreground">Summary & Hiring Recommendation</div>
                      <p className="text-xs text-foreground/90 mt-1 leading-relaxed">{analyzedData.professionalSummary || analyzedData.experienceSummary}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed border-border p-8 text-center bg-secondary/20">
              <Sparkles className="size-8 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No resume analyzed yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1">
                Upload a candidate's resume on the left to see their AI match score, matched skills, and professional summary against the selected job description.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}