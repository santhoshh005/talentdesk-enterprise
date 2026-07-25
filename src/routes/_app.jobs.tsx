import { createFileRoute } from "@tanstack/react-router";
import { Plus, Filter, MoreHorizontal, MapPin, Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_app/jobs")({
  head: () => ({
    meta: [
      { title: "Jobs — TalentOS" },
      { name: "description", content: "Manage open positions and requisitions." },
    ],
  }),
  component: JobsPage,
});

const jobs = [
  { title: "Senior Product Designer", dept: "Design", location: "Remote · EU", applicants: 84, status: "Open", opened: "Jul 12" },
  { title: "Staff Backend Engineer", dept: "Engineering", location: "New York, NY", applicants: 132, status: "Open", opened: "Jul 09" },
  { title: "Head of Data", dept: "Data", location: "London, UK", applicants: 41, status: "Interviewing", opened: "Jun 28" },
  { title: "Engineering Manager, Platform", dept: "Engineering", location: "Remote · US", applicants: 58, status: "Open", opened: "Jul 02" },
  { title: "Product Manager, Growth", dept: "Product", location: "San Francisco, CA", applicants: 96, status: "Open", opened: "Jul 15" },
  { title: "Customer Success Lead", dept: "CS", location: "Austin, TX", applicants: 22, status: "Draft", opened: "—" },
  { title: "Sr. Recruiter", dept: "People", location: "Remote", applicants: 67, status: "Closed", opened: "May 21" },
];

const statusColor: Record<string, string> = {
  Open: "bg-success/10 text-success",
  Interviewing: "bg-primary/10 text-primary",
  Draft: "bg-secondary text-secondary-foreground",
  Closed: "bg-muted text-muted-foreground",
};

function JobsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Jobs"
        description="Open positions and requisitions across your organization."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5"><Filter className="size-4" /> Filter</Button>
            <Button size="sm" className="gap-1.5"><Plus className="size-4" /> New job</Button>
          </>
        }
      />
      <div className="flex items-center gap-2">
        <Input placeholder="Search jobs by title, department, location…" className="max-w-md" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Open", 34, "text-success"],
          ["Interviewing", 18, "text-primary"],
          ["Draft", 6, "text-muted-foreground"],
          ["Closed this quarter", 12, "text-muted-foreground"],
        ].map(([label, n, cls]) => (
          <Card key={label as string} className="shadow-xs">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">{label as string}</div>
              <div className={`mt-1 text-2xl font-semibold tabular-nums ${cls as string}`}>{n as number}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Position</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Applicants</TableHead>
                <TableHead className="text-right">Opened</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((j) => (
                <TableRow key={j.title}>
                  <TableCell className="font-medium">{j.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{j.dept}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5" />{j.location}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusColor[j.status]}`}>
                      {j.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    <span className="inline-flex items-center gap-1.5"><Users className="size-3.5 text-muted-foreground" />{j.applicants}</span>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground tabular-nums">{j.opened}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="size-8"><MoreHorizontal className="size-4" /></Button>
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