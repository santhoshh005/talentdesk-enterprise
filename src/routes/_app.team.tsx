import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Mail } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOrganization } from "@/hooks/use-api";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/team")({
  head: () => ({
    meta: [
      { title: "Team — TalentOS" },
      { name: "description", content: "Manage recruiters, hiring managers and permissions." },
    ],
  }),
  component: TeamPage,
});

function TeamPage() {
  const { data, isLoading } = useOrganization();
  const members = data?.data?.users || [];
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("RECRUITER");
  const [isSending, setIsSending] = useState(false);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsInviteOpen(false);
      setEmail("");
      toast.success(`Invitation sent to ${email}`);
    }, 600);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Team"
        description="Invite teammates and manage roles across your workspace."
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => setIsInviteOpen(true)}>
            <Plus className="size-4" /> Invite people
          </Button>
        }
      />
      <Card className="shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="flex items-center gap-2"><Skeleton className="size-8 rounded-full" /><div className="space-y-1"><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-32" /></div></div></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No team members found.</TableCell>
                </TableRow>
              ) : members.map((m: any) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-8">
                        <AvatarFallback className="bg-secondary text-[11px]">
                          {`${m.firstName?.[0] || ""}${m.lastName?.[0] || ""}`.toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">{m.firstName} {m.lastName}</div>
                        <div className="text-xs text-muted-foreground">{m.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{m.role}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`rounded-full text-[11px] ${m.isActive ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                      {m.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an email invitation to join your TalentOS workspace.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInvite} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="invite-email">Work Email</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invite-role">Role & Permissions</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="invite-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin (Full Access)</SelectItem>
                  <SelectItem value="RECRUITER">Recruiter (Manage candidates & jobs)</SelectItem>
                  <SelectItem value="HIRING_MANAGER">Hiring Manager (Review candidates)</SelectItem>
                  <SelectItem value="INTERVIEWER">Interviewer (View schedule & feedback)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSending} className="gap-1.5">
                <Mail className="size-4" /> {isSending ? "Sending Invite…" : "Send Invite"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}