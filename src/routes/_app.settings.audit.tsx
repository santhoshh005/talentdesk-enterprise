import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/settings/audit")({
  component: AuditSettings,
});

const auditLogs = [
  { id: 1, user: "Alex Rivera", action: "Moved Candidate", entity: "John Doe (Interview)", timestamp: "2024-05-10T14:30:00Z", details: "Applied -> Interview" },
  { id: 2, user: "System", action: "Job Created", entity: "Senior Engineer", timestamp: "2024-05-09T09:15:00Z", details: "Department: Engineering" },
  { id: 3, user: "Alex Rivera", action: "Logged In", entity: "Web App", timestamp: "2024-05-08T08:00:00Z", details: "IP: 192.168.1.1" },
  { id: 4, user: "Jane Smith", action: "Updated Settings", entity: "Organization", timestamp: "2024-05-07T16:45:00Z", details: "Changed AI Provider to OpenAI" },
];

function AuditSettings() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold">Audit Logs</h2>
        <p className="text-sm text-muted-foreground">Track all activities and changes across your workspace.</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search logs..." className="pl-9" />
        </div>
        <Button variant="outline" size="icon">
          <CalendarIcon className="size-4" />
        </Button>
      </div>

      <Card className="shadow-xs overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="text-right">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.user}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.entity}</TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate">{log.details}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString()}
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
