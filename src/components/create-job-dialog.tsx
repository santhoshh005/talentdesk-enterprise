import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateJob } from "@/hooks/use-api";
import { toast } from "sonner";

export function CreateJobDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [type, setType] = useState("Full-time");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [skills, setSkills] = useState("");

  const createJob = useCreateJob();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required.");
      return;
    }

    try {
      await createJob.mutateAsync({
        title: title.trim(),
        type: type || "Full-time",
        location: location.trim() || "Remote",
        description: description.trim(),
        minSalary: minSalary ? Number(minSalary) : undefined,
        maxSalary: maxSalary ? Number(maxSalary) : undefined,
        skills: skills ? skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
      });
      toast.success(`Job position "${title}" created successfully.`);
      onOpenChange(false);
      
      // Reset form
      setTitle("");
      setDepartment("");
      setType("Full-time");
      setLocation("");
      setDescription("");
      setMinSalary("");
      setMaxSalary("");
      setSkills("");
    } catch (error: any) {
      toast.error(error?.message || "Failed to create job.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Job</DialogTitle>
          <DialogDescription>Add a new job opening to your workspace.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Job Title <span className="text-destructive">*</span></Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Senior Frontend Engineer" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="department">Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger id="department"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Product">Product</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Remote, San Francisco" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} placeholder="Job description..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="minSalary">Min Salary ($)</Label>
              <Input id="minSalary" type="number" value={minSalary} onChange={(e) => setMinSalary(e.target.value)} placeholder="e.g. 100000" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="maxSalary">Max Salary ($)</Label>
              <Input id="maxSalary" type="number" value={maxSalary} onChange={(e) => setMaxSalary(e.target.value)} placeholder="e.g. 150000" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="skills">Skills (comma-separated)</Label>
            <Input id="skills" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="e.g. React, TypeScript, Node.js" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={createJob.isPending}>
              {createJob.isPending ? "Creating..." : "Create Job"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
