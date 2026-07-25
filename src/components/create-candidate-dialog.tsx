import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCandidate } from "@/hooks/use-api";
import { toast } from "sonner";

export function CreateCandidateDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [skills, setSkills] = useState("");
  const [summary, setSummary] = useState("");

  const createCandidate = useCreateCandidate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email) {
      toast.error("First name, last name, and email are required.");
      return;
    }

    try {
      await createCandidate.mutateAsync({
        firstName,
        lastName,
        email,
        phone,
        location,
        currentRole,
        experienceYears: experienceYears ? Number(experienceYears) : undefined,
        skills: skills ? skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
        summary,
        status: "New",
      });
      toast.success("Candidate created successfully.");
      onOpenChange(false);
      
      // Reset form
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setLocation("");
      setCurrentRole("");
      setExperienceYears("");
      setSkills("");
      setSummary("");
    } catch (error) {
      toast.error("Failed to add candidate.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Candidate</DialogTitle>
          <DialogDescription>Manually add a new candidate to your database.</DialogDescription>
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
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. New York, NY" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="currentRole">Current Role</Label>
              <Input id="currentRole" value={currentRole} onChange={(e) => setCurrentRole(e.target.value)} placeholder="e.g. Software Engineer" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="experienceYears">Experience (Years)</Label>
              <Input id="experienceYears" type="number" min="0" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="c-skills">Skills (comma-separated)</Label>
            <Input id="c-skills" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="e.g. React, Python, AWS" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="summary">Summary</Label>
            <Textarea id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} placeholder="Brief summary of the candidate..." />
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
