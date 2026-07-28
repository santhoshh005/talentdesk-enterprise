import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Copy, Sparkles, Loader2, X, AlertCircle } from "lucide-react";
import { useGenerateJD, useJobs } from "@/hooks/use-api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/jd-generator")({
  validateSearch: (search: Record<string, unknown>) => ({
    jobTitle: (search.jobTitle as string) || undefined,
  }),
  head: () => ({
    meta: [
      { title: "JD Generator — TalentOS" },
      { name: "description", content: "Draft structured, inclusive job descriptions with AI." },
    ],
  }),
  component: JDGen,
});

function JDGen() {
  const { jobTitle: searchJobTitle } = Route.useSearch();
  const [title, setTitle] = useState(searchJobTitle || "");
  const [department, setDepartment] = useState("Engineering");
  const [level, setLevel] = useState("Senior");
  const [location, setLocation] = useState("New York, USA");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [experienceRequired, setExperienceRequired] = useState("5+ years");
  const [roleSummary, setRoleSummary] = useState("");
  const [skillsInput, setSkillsInput] = useState("Go, Node.js, Kafka, AWS");
  const [tone, setTone] = useState("Clear & professional");
  const [generatedText, setGeneratedText] = useState("");

  const { data: jobsRes } = useJobs();
  const jobsList = jobsRes?.data || [];

  useEffect(() => {
    if (searchJobTitle) {
      handleSelectExistingJob(searchJobTitle);
    }
  }, [searchJobTitle, jobsList.length]);

  const generateJD = useGenerateJD();
  const skillsList = skillsInput
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const handleSelectExistingJob = (selectedTitle: string) => {
    setTitle(selectedTitle);
    const existingJob = jobsList.find((j: any) => j.title === selectedTitle);
    if (existingJob) {
      if (existingJob.department?.name || existingJob.departmentId || existingJob.dept)
        setDepartment(existingJob.department?.name || existingJob.departmentId || existingJob.dept);
      if (existingJob.location?.name || existingJob.locationId || existingJob.loc)
        setLocation(existingJob.location?.name || existingJob.locationId || existingJob.loc);
      if (existingJob.skills && existingJob.skills.length > 0) {
        setSkillsInput(
          existingJob.skills.map((s: any) => (typeof s === "string" ? s : s.name)).join(", "),
        );
      }
      if (existingJob.description && existingJob.description.length > 20) {
        setRoleSummary(existingJob.description);
      }
    }
  };

  const handleGenerate = async () => {
    // Form Validation
    if (!title.trim()) {
      toast.error("Please enter or select a position title.");
      return;
    }
    if (!location.trim()) {
      toast.error("Please enter a job location.");
      return;
    }
    if (!roleSummary.trim()) {
      toast.error("Please provide a brief role description / overview.");
      return;
    }
    if (!skillsInput.trim()) {
      toast.error("Please enter at least one must-have skill.");
      return;
    }

    try {
      const res = await generateJD.mutateAsync({
        title: title.trim(),
        department,
        level,
        location: location.trim(),
        employmentType,
        experienceRequired,
        overviewSummary: roleSummary.trim(),
        keyResponsibilities: skillsList,
        tone,
      });

      const { data } = res;
      const respList = (data.responsibilities || []).map((r: string) => `• ${r}`).join("\n");
      const reqList = (data.requirements || []).map((r: string) => `• ${r}`).join("\n");
      const prefList = (data.preferredQualifications || []).map((r: string) => `• ${r}`).join("\n");

      const formattedText = `${data.title || title}

About the role
${roleSummary ? roleSummary + "\n\n" : ""}${data.summary || `We are seeking a ${title} to drive the technical vision, architecture, and execution of our ${department} team. In this role, you will lead complex technical initiatives, mentor senior engineers, and collaborate closely with cross-functional leadership.`}

What you'll do
${respList || `• Architect, build, and maintain highly scalable backend services using ${skillsInput}.\n• Drive engineering best practices, architectural guidelines, and security standards.\n• Collaborate with product and design teams to deliver high-impact features.`}

What we're looking for
• ${experienceRequired ? experienceRequired : "5+ years"} of professional software engineering experience with a strong focus on ${department} systems.
• Deep technical expertise in ${skillsInput}.
${reqList}

Preferred Qualifications
${prefList || `• Proven track record of operating high-throughput cloud infrastructure (AWS/GCP).\n• Experience mentoring engineers and leading technical architecture discussions.`}

Job Details & Benefits
• Department: ${department}
• Seniority Level: ${level}
• Location: ${location}
• Employment Type: ${employmentType}
• Suggested Salary Range: $${data.suggestedSalaryRange?.min ? (data.suggestedSalaryRange.min / 1000).toFixed(0) + "k" : "140k"} – $${data.suggestedSalaryRange?.max ? (data.suggestedSalaryRange.max / 1000).toFixed(0) + "k" : "190k"} & Equity Options
• Comprehensive medical, dental, and vision insurance with flexible PTO
`;

      setGeneratedText(formattedText);
      toast.success(`Generated job description for "${title}"!`);
    } catch (error) {
      toast.error("Failed to generate JD");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    toast.success("Copied to clipboard");
  };

  const removeSkill = (skillToRemove: string) => {
    const updatedSkills = skillsList.filter((s) => s !== skillToRemove);
    setSkillsInput(updatedSkills.join(", "));
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="JD Generator"
        description={
          title
            ? `Drafting job description for position: ${title}`
            : "Select a position title first to generate its job description."
        }
        actions={
          <Button
            size="sm"
            className="gap-1.5"
            onClick={handleGenerate}
            disabled={!title || generateJD.isPending}
          >
            {generateJD.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            Generate JD
          </Button>
        }
      />

      {!title && (
        <Card className="border-warning/50 bg-warning/5 shadow-xs">
          <CardContent className="flex items-center gap-3 p-4 text-sm font-medium text-warning">
            <AlertCircle className="size-5 shrink-0" />
            <span>
              Please select a position title below first to generate or view its job description.
            </span>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 shadow-xs h-fit border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              1. Position Details & Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>
                Select Position <span className="text-destructive">*</span>
              </Label>
              <Select value={title} onValueChange={handleSelectExistingJob}>
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
            </div>

            <div className="space-y-1.5">
              <Label>
                Or Enter Custom Position Title <span className="text-destructive">*</span>
              </Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Staff Backend Engineer"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Product">Product</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Level</Label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Junior">Junior</SelectItem>
                    <SelectItem value="Mid">Mid</SelectItem>
                    <SelectItem value="Senior">Senior</SelectItem>
                    <SelectItem value="Staff / Lead">Staff / Lead</SelectItem>
                    <SelectItem value="Director">Director / Principal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>
                Location <span className="text-destructive">*</span>
              </Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. New York, USA or Remote"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Employment type</Label>
              <Select value={employmentType} onValueChange={setEmploymentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Experience Required Dropdown Selector */}
            <div className="space-y-1.5">
              <Label className="font-semibold text-foreground">
                Required Experience <span className="text-destructive">*</span>
              </Label>
              <Select value={experienceRequired} onValueChange={setExperienceRequired}>
                <SelectTrigger>
                  <SelectValue placeholder="Select years of experience..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1+ years">1+ years</SelectItem>
                  <SelectItem value="2+ years">2+ years</SelectItem>
                  <SelectItem value="3+ years">3+ years</SelectItem>
                  <SelectItem value="4+ years">4+ years</SelectItem>
                  <SelectItem value="5+ years">5+ years</SelectItem>
                  <SelectItem value="6+ years">6+ years</SelectItem>
                  <SelectItem value="7+ years">7+ years</SelectItem>
                  <SelectItem value="8+ years">8+ years</SelectItem>
                  <SelectItem value="10+ years">10+ years</SelectItem>
                  <SelectItem value="12+ years">12+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Role Overview & Description Section */}
            <div className="space-y-1.5">
              <Label className="font-semibold text-foreground">
                Role Description / Overview <span className="text-destructive">*</span>
              </Label>
              <Textarea
                rows={3}
                value={roleSummary}
                onChange={(e) => setRoleSummary(e.target.value)}
                placeholder="Brief summary of project goals, team culture, or core expectations for this role..."
                className="resize-none text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>
                Must-have skills <span className="text-destructive">*</span>
              </Label>
              <Input
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="Go, Node.js, Kafka, AWS"
                required
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {skillsList.map((s, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="rounded-full flex items-center gap-1 cursor-pointer"
                    onClick={() => removeSkill(s)}
                  >
                    {s} <X className="size-3 hover:text-destructive" />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Clear & professional">Clear & professional</SelectItem>
                  <SelectItem value="Executive & formal">Executive & formal</SelectItem>
                  <SelectItem value="Warm & inclusive">Warm & inclusive</SelectItem>
                  <SelectItem value="Direct & high-impact">Direct & high-impact</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold">
              {title ? `Job description for ${title}` : "Generated Job Description"}
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5"
                onClick={handleCopy}
                disabled={!generatedText}
              >
                <Copy className="size-4" /> Copy
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!title ? (
              <div className="flex flex-col items-center justify-center min-h-[580px] bg-secondary/10 rounded-md border border-dashed text-center p-6">
                <AlertCircle className="size-8 text-warning mb-3" />
                <h4 className="text-base font-semibold">Select Position Title First</h4>
                <p className="text-xs text-muted-foreground max-w-xs mt-1">
                  Please select or enter a target position title on the left, fill out the
                  experience and description details, then click Generate JD.
                </p>
              </div>
            ) : generateJD.isPending ? (
              <div className="flex flex-col items-center justify-center min-h-[580px] bg-secondary/10 rounded-md border border-dashed">
                <Loader2 className="size-8 text-primary animate-spin mb-4" />
                <p className="text-sm text-muted-foreground">
                  Drafting comprehensive description for {title}...
                </p>
              </div>
            ) : (
              <Textarea
                className="min-h-[580px] resize-none border-border font-normal leading-relaxed text-sm"
                value={generatedText}
                onChange={(e) => setGeneratedText(e.target.value)}
                placeholder={`Job description for ${title} will appear here. Fill required fields and click Generate JD.`}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
