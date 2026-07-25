import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Copy, Save, Sparkles, Loader2, X, AlertCircle } from "lucide-react";
import { useGenerateJD, useJobs } from "@/hooks/use-api";
import { api } from "@/lib/api-client";
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
  const [level, setLevel] = useState("sr");
  const [location, setLocation] = useState("San Francisco, CA · Hybrid");
  const [employmentType, setEmploymentType] = useState("ft");
  const [skillsInput, setSkillsInput] = useState("React, TypeScript, Node.js, System Design");
  const [tone, setTone] = useState("clear");
  const [generatedText, setGeneratedText] = useState("");

  const { data: jobsRes } = useJobs();
  const jobsList = jobsRes?.data || [];

  useEffect(() => {
    if (searchJobTitle) {
      handleSelectExistingJob(searchJobTitle);
    }
  }, [searchJobTitle, jobsList.length]);

  const generateJD = useGenerateJD();
  const skillsList = skillsInput.split(",").map(s => s.trim()).filter(Boolean);

  const handleSelectExistingJob = (selectedTitle: string) => {
    setTitle(selectedTitle);
    const existingJob = jobsList.find((j: any) => j.title === selectedTitle);
    if (existingJob) {
      if (existingJob.dept) setDepartment(existingJob.dept);
      if (existingJob.loc) setLocation(existingJob.loc);
      if (existingJob.skills && existingJob.skills.length > 0) {
        setSkillsInput(existingJob.skills.join(", "));
      }
      if (existingJob.description && existingJob.description.length > 30) {
        setGeneratedText(existingJob.description);
      }
    }
  };

  const handleGenerate = async () => {
    if (!title) {
      toast.error("Please select or enter a position title first!");
      return;
    }
    try {
      const res = await generateJD.mutateAsync({
        title,
        department,
        keyResponsibilities: skillsList,
      });
      
      const { data } = res;
      const formattedText = `${data.title || title}
      
About the role
${data.summary || data.description || 'Join our team as a ' + title + '.'}

What you'll do
${(data.responsibilities || ['Develop scalable software features', 'Collaborate with cross-functional teams']).map((r: string) => `• ${r}`).join('\n')}

What we're looking for
${(data.requirements || ['3+ years of experience in modern web development', 'Strong problem solving skills']).map((r: string) => `• ${r}`).join('\n')}

What we offer
• Competitive salary & equity options
• Health, dental, and vision insurance
• Flexible work location & PTO
`;
      setGeneratedText(formattedText);
      toast.success(`Job description generated for "${title}"!`);
    } catch (error) {
      toast.error("Failed to generate JD");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    toast.success("Copied to clipboard");
  };

  const handleSaveDraft = async () => {
    if (!generatedText) return;
    try {
      await api.createJob({
        title,
        description: generatedText
      });
      toast.success(`Saved position "${title}" to workspace`);
    } catch (error) {
      toast.error("Failed to save draft");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const updatedSkills = skillsList.filter(s => s !== skillToRemove);
    setSkillsInput(updatedSkills.join(", "));
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="JD Generator"
        description={title ? `Drafting job description for position: ${title}` : "Select a position title first to generate its job description."}
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleSaveDraft} disabled={!generatedText}><Save className="size-4" /> Save position</Button>
            <Button size="sm" className="gap-1.5" onClick={handleGenerate} disabled={!title || generateJD.isPending}>
              {generateJD.isPending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} 
              Generate JD
            </Button>
          </>
        }
      />

      {!title && (
        <Card className="border-warning/50 bg-warning/5 shadow-xs">
          <CardContent className="flex items-center gap-3 p-4 text-sm font-medium text-warning">
            <AlertCircle className="size-5 shrink-0" />
            <span>Please select a position title below first to generate or view its job description.</span>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 shadow-xs h-fit border-primary/30">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">1. Select Target Position Title</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Select Position</Label>
              <Select value={title} onValueChange={handleSelectExistingJob}>
                <SelectTrigger className="font-semibold"><SelectValue placeholder="Choose a position title..." /></SelectTrigger>
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
            </div>

            <div className="space-y-1.5">
              <Label>Or Enter Custom Position Title</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Senior Staff Engineer" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Product">Product</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Level</Label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jr">Junior</SelectItem>
                    <SelectItem value="mid">Mid</SelectItem>
                    <SelectItem value="sr">Senior</SelectItem>
                    <SelectItem value="staff">Staff / Lead</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input value={location} onChange={e => setLocation(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Employment type</Label>
              <Select value={employmentType} onValueChange={setEmploymentType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ft">Full-time</SelectItem>
                  <SelectItem value="pt">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Must-have skills</Label>
              <Input value={skillsInput} onChange={e => setSkillsInput(e.target.value)} placeholder="React, Node.js, etc" />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {skillsList.map((s, i) => (
                  <Badge key={i} variant="secondary" className="rounded-full flex items-center gap-1 cursor-pointer" onClick={() => removeSkill(s)}>
                    {s} <X className="size-3 hover:text-destructive" />
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="clear">Clear & professional</SelectItem>
                  <SelectItem value="friendly">Warm & inclusive</SelectItem>
                  <SelectItem value="concise">Concise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold">{title ? `Job description for ${title}` : "Generated Job Description"}</CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="gap-1.5" onClick={handleCopy} disabled={!generatedText}><Copy className="size-4" /> Copy</Button>
            </div>
          </CardHeader>
          <CardContent>
            {!title ? (
              <div className="flex flex-col items-center justify-center min-h-[520px] bg-secondary/10 rounded-md border border-dashed text-center p-6">
                <AlertCircle className="size-8 text-warning mb-3" />
                <h4 className="text-base font-semibold">Select Position Title First</h4>
                <p className="text-xs text-muted-foreground max-w-xs mt-1">Please select or enter a target position title on the left, then click Generate JD.</p>
              </div>
            ) : generateJD.isPending ? (
              <div className="flex flex-col items-center justify-center min-h-[520px] bg-secondary/10 rounded-md border border-dashed">
                <Loader2 className="size-8 text-primary animate-spin mb-4" />
                <p className="text-sm text-muted-foreground">Drafting description for {title}...</p>
              </div>
            ) : (
              <Textarea 
                className="min-h-[520px] resize-none border-border font-normal leading-relaxed text-sm" 
                value={generatedText}
                onChange={e => setGeneratedText(e.target.value)}
                placeholder={`Job description for ${title} will appear here. Click Generate JD to start.`}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}