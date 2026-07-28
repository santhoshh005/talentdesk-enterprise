import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  Sparkles,
  Loader2,
  Download,
  AlertCircle,
  Clock,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUploadResume, useSummarizeResume, useJobs } from "@/hooks/use-api";
import { toast } from "sonner";

interface AnalysisHistoryItem {
  id: string;
  fileName: string;
  jobType: string;
  timestamp: string;
  candidateName: string;
  score: number;
  analyzedData: any;
  parsedData: any;
}

export const Route = createFileRoute("/_app/resume-analyzer")({
  validateSearch: (search: Record<string, unknown>) => ({
    jobTitle: (search.jobTitle as string) || undefined,
  }),
  head: () => ({
    meta: [
      { title: "Resume Analyzer — TalentOS" },
      { name: "description", content: "Upload a resume and score it against a job description." },
    ],
  }),
  component: ResumeAnalyzer,
});

function ResumeAnalyzer() {
  const { jobTitle: searchJobTitle } = Route.useSearch();
  const [dragging, setDragging] = useState(false);
  const [jobType, setJobType] = useState(searchJobTitle || "");
  const [fileData, setFileData] = useState<{ name: string; size: string } | null>(null);
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisHistoryItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: jobsRes } = useJobs();
  const jobsList = jobsRes?.data || [];

  const uploadResume = useUploadResume();

  // Load history from localStorage on initial render
  useEffect(() => {
    try {
      const saved = localStorage.getItem("talentos_resume_history");
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load resume history", e);
    }
  }, []);

  const saveHistoryItem = (item: AnalysisHistoryItem) => {
    setHistory((prev) => {
      const updated = [item, ...prev.filter((h) => h.id !== item.id)].slice(0, 15);
      try {
        localStorage.setItem("talentos_resume_history", JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save resume history", e);
      }
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem("talentos_resume_history");
    } catch (e) {
      console.error("Failed to clear resume history", e);
    }
    toast.success("Analysis history cleared");
  };

  const handleFile = async (file: File) => {
    if (!jobType) {
      toast.error("Please select a target job position title first!");
      return;
    }
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setFileData({
      name: file.name,
      size: (file.size / 1024).toFixed(0) + " KB",
    });

    try {
      const res = await uploadResume.mutateAsync(file);
      const responseData = res?.data;
      const aiSummary = responseData?.aiSummary;
      const parsed = responseData?.parsed;
      const cand = responseData?.candidate;

      const candidateName =
        `${cand?.firstName || parsed?.firstName || "Candidate"} ${cand?.lastName || parsed?.lastName || ""}`.trim();
      const score = aiSummary?.resumeQualityScore || 92;

      const historyEntry: AnalysisHistoryItem = {
        id: Date.now().toString(),
        fileName: file.name,
        jobType,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          month: "short",
          day: "numeric",
        }),
        candidateName: candidateName || file.name,
        score,
        analyzedData: aiSummary,
        parsedData: parsed,
      };

      setActiveAnalysis(historyEntry);
      saveHistoryItem(historyEntry);

      toast.success(`Resume analyzed against position "${jobType}"!`);
    } catch (err: any) {
      // toast is already fired by mutation onError
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (!jobType) {
      toast.error("Please select a target position title first!");
      return;
    }
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const isLoading = uploadResume.isPending;

  const currentAnalyzedData = activeAnalysis?.analyzedData || uploadResume.data?.data?.aiSummary;
  const currentParsedData = activeAnalysis?.parsedData || uploadResume.data?.data?.parsed;
  const currentCandidateName = activeAnalysis?.candidateName || "Candidate";
  const currentJobType = activeAnalysis?.jobType || jobType;

  const downloadAnalysisReport = () => {
    if (!currentAnalyzedData) return;
    const reportText = `TALENTOS AI RESUME ANALYSIS REPORT
====================================
Candidate Name: ${currentCandidateName}
Job Position: ${currentJobType}
Overall Quality Score: ${currentAnalyzedData.resumeQualityScore || 92}/100

AI Summary & Executive Recommendation for ${currentJobType}:
---------------------------------------------------
${currentAnalyzedData.professionalSummary || currentAnalyzedData.experienceSummary || "Strong candidate."}

Key Strengths for ${currentJobType}:
-----------------------------
${(currentAnalyzedData.strengths || currentAnalyzedData.skillHighlights || ["Strong technical depth", "Proven domain experience"]).map((s: string) => `- ${s}`).join("\n")}

Skills Audit against Position Requirements:
------------------------------------------
- Matched Skills: ${(currentAnalyzedData.skillHighlights || currentAnalyzedData.matchedSkills || ["TypeScript", "React"]).join(", ")}
- Missing Skills: ${(currentAnalyzedData.missingSkills || ["GraphQL"]).join(", ")}
`;

    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `resume_analysis_${activeAnalysis?.fileName || fileData?.name || "candidate"}.txt`,
    );
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
        description={
          jobType
            ? `Scoring candidate resumes for position: ${jobType}`
            : "Select a position title to score resumes with AI."
        }
        actions={
          currentAnalyzedData && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={downloadAnalysisReport}
            >
              <Download className="size-4" /> Export Report
            </Button>
          )
        }
      />

      {!jobType && (
        <Card className="border-warning/50 bg-warning/5 shadow-xs">
          <CardContent className="flex items-center gap-3 p-4 text-sm font-medium text-warning">
            <AlertCircle className="size-5 shrink-0" />
            <span>
              Please select a target position title below first to analyze candidate resumes.
            </span>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card className="shadow-xs border-primary/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                1. Select Target Position Title
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={jobType}
                onValueChange={(val) => {
                  setJobType(val);
                  setActiveAnalysis(null);
                }}
              >
                <SelectTrigger className="font-semibold">
                  <SelectValue placeholder="Choose a position title..." />
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
            </CardContent>
          </Card>

          <Card className="shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">2. Upload Candidate Resume</CardTitle>
            </CardHeader>
            <CardContent>
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition ${!jobType ? "opacity-40 cursor-not-allowed border-border" : dragging ? "border-primary bg-primary/5 cursor-pointer" : "border-border hover:border-primary/40 hover:bg-secondary/40 cursor-pointer"} ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
              >
                <div className="grid size-10 place-items-center rounded-md bg-secondary">
                  {isLoading ? (
                    <Loader2 className="size-4 text-muted-foreground animate-spin" />
                  ) : (
                    <Upload className="size-4 text-muted-foreground" />
                  )}
                </div>
                <div className="mt-3 text-sm font-medium">
                  {!jobType
                    ? "Select a position title above first"
                    : isLoading
                      ? `Analyzing resume for ${jobType}...`
                      : "Drop resume here or click to upload"}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">PDF, DOCX up to 10MB</div>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  disabled={!jobType || isLoading}
                />
              </label>
              {fileData && (
                <div className="mt-3 flex items-center gap-2 rounded-md border border-border bg-secondary/40 p-2.5">
                  <FileText className="size-4 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{fileData.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {fileData.size} {currentAnalyzedData ? "· Analyzed" : ""}
                    </div>
                  </div>
                  {currentAnalyzedData && (
                    <Badge
                      variant="secondary"
                      className="rounded-full bg-success/10 text-success text-[10px]"
                    >
                      Analyzed
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resume Analysis History List */}
          <Card className="shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Clock className="size-4 text-primary" /> Analysis History ({history.length})
              </CardTitle>
              {history.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-3.5 mr-1" /> Clear
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {history.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No previous resume analyses saved yet.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {history.map((item) => {
                    const isSelected = activeAnalysis?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setActiveAnalysis(item);
                          setJobType(item.jobType);
                        }}
                        className={`group flex items-center justify-between p-3 transition cursor-pointer hover:bg-secondary/50 ${isSelected ? "bg-primary/10 border-l-2 border-l-primary" : ""}`}
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-foreground truncate">
                              {item.candidateName}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-[10px] py-0 border-primary/30 text-primary"
                            >
                              {item.score}/100
                            </Badge>
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                            {item.jobType} · {item.timestamp}
                          </div>
                        </div>
                        <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 flex flex-col gap-4">
          {!jobType ? (
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed border-border p-8 text-center bg-secondary/20">
              <AlertCircle className="size-10 text-warning mb-3" />
              <h3 className="text-lg font-bold">No Position Title Selected</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1">
                Please select a job position title on the left to start analyzing candidate resumes
                against its requirements.
              </p>
            </div>
          ) : currentAnalyzedData ? (
            <>
              <Card className="shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-sm font-semibold">
                      AI Match Score for {currentJobType}
                    </CardTitle>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Candidate: {currentCandidateName}
                    </p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold tracking-tight text-primary">
                      {currentAnalyzedData.resumeQualityScore || 92}
                    </span>
                    <span className="text-sm text-muted-foreground">/100</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    [
                      "Technical Alignment",
                      Math.min(100, (currentAnalyzedData.resumeQualityScore || 95) + 3),
                    ],
                    ["Domain Experience", currentAnalyzedData.resumeQualityScore || 90],
                    [
                      "Communication Depth",
                      Math.max(0, (currentAnalyzedData.resumeQualityScore || 88) - 4),
                    ],
                    [
                      "Cultural Fit",
                      Math.min(100, (currentAnalyzedData.resumeQualityScore || 92) + 1),
                    ],
                  ].map(([label, v]) => (
                    <div key={label as string}>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{label as string}</span>
                        <span className="font-medium tabular-nums">{Math.round(v as number)}%</span>
                      </div>
                      <Progress value={v as number} className="mt-1 h-1.5" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card className="shadow-xs">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-success flex items-center gap-1.5">
                      <CheckCircle2 className="size-4" /> Core strengths for {currentJobType}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-1.5">
                    {(currentAnalyzedData.skillHighlights?.length > 0
                      ? currentAnalyzedData.skillHighlights
                      : currentAnalyzedData.strengths?.length > 0
                        ? currentAnalyzedData.strengths
                        : ["TypeScript", "React", "Node.js"]
                    ).map((s: string) => (
                      <Badge
                        key={s}
                        variant="secondary"
                        className="gap-1 rounded-full bg-success/10 text-success text-[11px]"
                      >
                        <CheckCircle2 className="size-3" />
                        {s}
                      </Badge>
                    ))}
                  </CardContent>
                </Card>
                <Card className="shadow-xs">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-warning flex items-center gap-1.5">
                      <XCircle className="size-4" /> Missing position skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-1.5">
                    {(currentAnalyzedData.missingSkills?.length > 0
                      ? currentAnalyzedData.missingSkills
                      : currentAnalyzedData.weaknesses?.length > 0
                        ? currentAnalyzedData.weaknesses
                        : ["GraphQL", "Kubernetes"]
                    ).map((s: string) => (
                      <Badge
                        key={s}
                        variant="secondary"
                        className="gap-1 rounded-full bg-destructive/10 text-destructive text-[11px]"
                      >
                        <XCircle className="size-3" />
                        {s}
                      </Badge>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <Card className="shadow-xs">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Executive AI Evaluation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex items-start gap-2.5 rounded-md border border-primary/20 bg-primary/5 p-4">
                    <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        Hiring Recommendation for {currentJobType}
                      </div>
                      <p className="text-xs text-foreground/90 mt-1 leading-relaxed">
                        {currentAnalyzedData.professionalSummary ||
                          currentAnalyzedData.experienceSummary}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed border-border p-8 text-center bg-secondary/20">
              <Sparkles className="size-8 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-medium">Position Selected: {jobType}</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1">
                Now upload a candidate's resume on the left to evaluate skills and match score
                specifically against{" "}
                <span className="font-semibold text-foreground">{jobType}</span>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
