import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateCandidate } from "@/hooks/use-api";
import { toast } from "sonner";

export function CreateCandidateDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [experienceYears, setExperienceYears] = useState("3");
  const [skills, setSkills] = useState("");
  const [summary, setSummary] = useState("");

  const createCandidate = useCreateCandidate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Please enter candidate first and last name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid candidate email.");
      return;
    }
    if (!currentRole.trim()) {
      toast.error("Please enter candidate's target/current role.");
      return;
    }
    if (!skills.trim()) {
      toast.error("Please enter candidate skills.");
      return;
    }

    try {
      await createCandidate.mutateAsync({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        location: location.trim() || "Remote",
        currentRole: currentRole.trim(),
        experienceYears: Number(experienceYears) || 0,
        skills: skills ? skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
        summary: summary.trim(),
        status: "New",
      });
      toast.success(`Candidate ${firstName} ${lastName} added successfully.`);
      onOpenChange(false);
      
      // Reset form
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setLocation("");
      setCurrentRole("");
      setExperienceYears("3");
      setSkills("");
      setSummary("");
    } catch (error: any) {
      toast.error(error?.message || "Failed to add candidate.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Candidate</DialogTitle>
          <DialogDescription>Manually add a new candidate to your database. All fields marked with * are required.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First Name <span className="text-destructive">*</span></Label>
              <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last Name <span className="text-destructive">*</span></Label>
              <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="location">Location <span className="text-destructive">*</span></Label>
            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} required placeholder="e.g. New York, NY or Remote" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="currentRole">Target / Current Role <span className="text-destructive">*</span></Label>
              <Input id="currentRole" value={currentRole} onChange={(e) => setCurrentRole(e.target.value)} required placeholder="e.g. Software Engineer" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="experienceYears">Experience (Years) <span className="text-destructive">*</span></Label>
              <Select value={experienceYears} onValueChange={setExperienceYears}>
                <SelectTrigger id="experienceYears"><SelectValue placeholder="Select years..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 years (Entry)</SelectItem>
                  <SelectItem value="1">1 year</SelectItem>
                  <SelectItem value="2">2 years</SelectItem>
                  <SelectItem value="3">3 years</SelectItem>
                  <SelectItem value="4">4 years</SelectItem>
                  <SelectItem value="5">5+ years</SelectItem>
                  <SelectItem value="7">7+ years</SelectItem>
                  <SelectItem value="10">10+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="c-skills">Skills (comma-separated) <span className="text-destructive">*</span></Label>
            <Input id="c-skills" value={skills} onChange={(e) => setSkills(e.target.value)} required placeholder="e.g. React, Python, AWS" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="summary">Candidate Summary</Label>
            <Textarea id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} placeholder="Brief summary of candidate experience and background..." />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={createCandidate.isPending}>
              {createCandidate.isPending ? "Adding..." : "Add Candidate"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
