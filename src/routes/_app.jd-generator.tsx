import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, History, Save, Sparkles, Loader2, X } from "lucide-react";
import { useGenerateJD } from "@/hooks/use-api";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/jd-generator")({
  head: () => ({
    meta: [
      { title: "JD Generator — TalentOS" },
      { name: "description", content: "Draft structured, inclusive job descriptions with AI." },
    ],
  }),
  component: JDGen,
});

function JDGen() {
  const [title, setTitle] = useState("Senior Product Designer");
  const [department, setDepartment] = useState("design");
  const [level, setLevel] = useState("sr");
  const [location, setLocation] = useState("Remote · EU");
  const [employmentType, setEmploymentType] = useState("ft");
  const [skillsInput, setSkillsInput] = useState("Figma, Design systems, Prototyping, User research");
  const [tone, setTone] = useState("clear");
  const [generatedText, setGeneratedText] = useState("");
  
  const generateJD = useGenerateJD();
  const skillsList = skillsInput.split(",").map(s => s.trim()).filter(Boolean);

  const handleGenerate = async () => {
    try {
      const res = await generateJD.mutateAsync({
        title,
        department,
        keySkills: skillsList,
      });
      
      const { data } = res;
      // Format the structured JD into a text document
      const formattedText = `${data.title}
      
About the role
${data.description}

What you'll do
${data.responsibilities?.map((r: string) => `• ${r}`).join('\n')}

What we're looking for
${data.requirements?.map((r: string) => `• ${r}`).join('\n')}
${data.qualifications?.map((q: string) => `• ${q}`).join('\n')}

What we offer
${data.benefits?.map((b: string) => `• ${b}`).join('\n')}
`;
      setGeneratedText(formattedText);
      toast.success("Job description generated!");
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
      toast.success("Saved as draft");
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
        description="Draft structured, inclusive job descriptions in seconds."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5"><History className="size-4" /> History</Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleSaveDraft} disabled={!generatedText}><Save className="size-4" /> Save draft</Button>
            <Button size="sm" className="gap-1.5" onClick={handleGenerate} disabled={generateJD.isPending}>
              {generateJD.isPending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} 
              Generate
            </Button>
          </>
        }
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 shadow-xs h-fit">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Role details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Job title</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="eng">Engineering</SelectItem>
                    <SelectItem value="prod">Product</SelectItem>
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
                    <SelectItem value="staff">Staff</SelectItem>
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
              <Label>Must-have skills (comma separated)</Label>
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
            <CardTitle className="text-sm font-semibold">Generated description</CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="gap-1.5" onClick={handleCopy} disabled={!generatedText}><Copy className="size-4" /> Copy</Button>
              <Button variant="ghost" size="sm" className="gap-1.5" disabled={!generatedText}><Download className="size-4" /> Export</Button>
            </div>
          </CardHeader>
          <CardContent>
            {generateJD.isPending ? (
              <div className="flex flex-col items-center justify-center min-h-[520px] bg-secondary/10 rounded-md border border-dashed">
                <Loader2 className="size-8 text-primary animate-spin mb-4" />
                <p className="text-sm text-muted-foreground">Drafting your job description...</p>
              </div>
            ) : (
              <Textarea 
                className="min-h-[520px] resize-none border-border font-normal leading-relaxed" 
                value={generatedText}
                onChange={e => setGeneratedText(e.target.value)}
                placeholder="Your generated JD will appear here. Click generate to start."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}