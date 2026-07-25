import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Upload, FileText, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

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
  const analyzed = true;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Resume Analyzer" description="Score a resume against any job description with AI-assisted analysis." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card className="shadow-xs">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Job description</CardTitle></CardHeader>
            <CardContent>
              <Select defaultValue="pd">
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
                onDrop={(e) => { e.preventDefault(); setDragging(false); }}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition ${dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-secondary/40"}`}
              >
                <div className="grid size-10 place-items-center rounded-md bg-secondary">
                  <Upload className="size-4 text-muted-foreground" />
                </div>
                <div className="mt-3 text-sm font-medium">Drop resume here or click to upload</div>
                <div className="mt-1 text-xs text-muted-foreground">PDF, DOCX up to 10MB</div>
                <input type="file" className="hidden" accept=".pdf,.doc,.docx" />
              </label>
              {analyzed && (
                <div className="mt-3 flex items-center gap-2 rounded-md border border-border bg-secondary/40 p-2.5">
                  <FileText className="size-4 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">priya-menon-resume.pdf</div>
                    <div className="text-xs text-muted-foreground">Uploaded 2 min ago · 218 KB</div>
                  </div>
                  <Badge variant="secondary" className="rounded-full bg-success/10 text-success text-[10px]">Analyzed</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-3 flex flex-col gap-4">
          <Card className="shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-sm font-semibold">Overall match</CardTitle>
                <p className="mt-0.5 text-xs text-muted-foreground">Priya Menon vs. Senior Product Designer</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-semibold tracking-tight">92</span>
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[["Skills", 96],["Experience", 90],["Education", 82],["Culture add", 88]].map(([label, v]) => (
                <div key={label as string}>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{label as string}</span>
                    <span className="font-medium tabular-nums">{v as number}</span>
                  </div>
                  <Progress value={v as number} className="mt-1 h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="shadow-xs">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Matched skills</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-1.5">
                {["Figma", "Design systems", "Prototyping", "User research", "Motion", "Accessibility"].map((s) => (
                  <Badge key={s} variant="secondary" className="gap-1 rounded-full bg-success/10 text-success text-[11px]">
                    <CheckCircle2 className="size-3" />{s}
                  </Badge>
                ))}
              </CardContent>
            </Card>
            <Card className="shadow-xs">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Missing skills</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-1.5">
                {["Design ops", "B2B SaaS"].map((s) => (
                  <Badge key={s} variant="secondary" className="gap-1 rounded-full bg-warning/10 text-warning text-[11px]">
                    <XCircle className="size-3" />{s}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          </div>
          <Card className="shadow-xs">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Experience</div>
                <p className="text-muted-foreground">8 years in product design, most recently leading design systems at a Series C fintech. Shipped 3 major cross-platform launches.</p>
              </div>
              <Separator />
              <div>
                <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Education</div>
                <p className="text-muted-foreground">MSc, Interaction Design — Malmö University, 2016.</p>
              </div>
              <Separator />
              <div className="flex items-start gap-2 rounded-md border border-primary/20 bg-primary/5 p-3">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <div className="text-sm font-medium text-foreground">Recommendation</div>
                  <p className="text-sm text-muted-foreground">Strong fit — move to interview. Probe on design ops maturity and B2B SaaS exposure during the panel round.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}