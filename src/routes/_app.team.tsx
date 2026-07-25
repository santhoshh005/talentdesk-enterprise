import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_app/team")({
  head: () => ({
    meta: [
      { title: "Team — TalentOS" },
      { name: "description", content: "Manage recruiters, hiring managers and permissions." },
    ],
  }),
  component: TeamPage,
});

const members = [
  { name: "Alex Rivera", email: "alex@acmecorp.com", role: "Owner", team: "People", status: "Active" },
  { name: "Jordan Lee", email: "jordan@acmecorp.com", role: "Admin", team: "Engineering", status: "Active" },
  { name: "Maya Chen", email: "maya@acmecorp.com", role: "Recruiter", team: "People", status: "Active" },
  { name: "Sam Wu", email: "sam@acmecorp.com", role: "Hiring manager", team: "Design", status: "Active" },
  { name: "Elena Rossi", email: "elena@acmecorp.com", role: "Interviewer", team: "Product", status: "Invited" },
];

function TeamPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Team"
        description="Invite teammates and manage roles across your workspace."
        actions={<Button size="sm" className="gap-1.5"><Plus className="size-4" /> Invite people</Button>}
      />
      <Card className="shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.email}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-8"><AvatarFallback className="bg-secondary text-[11px]">{m.name.split(" ").map(n=>n[0]).join("")}</AvatarFallback></Avatar>
                      <div>
                        <div className="text-sm font-medium">{m.name}</div>
                        <div className="text-xs text-muted-foreground">{m.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{m.role}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{m.team}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`rounded-full text-[11px] ${m.status === "Active" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                      {m.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}