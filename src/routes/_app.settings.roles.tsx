import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, Minus } from "lucide-react";

export const Route = createFileRoute("/_app/settings/roles")({
  component: RolesSettings,
});

const permissions = [
  "Manage jobs",
  "View candidates",
  "Edit pipeline",
  "Access AI tools",
  "Manage team",
  "View analytics",
  "Admin settings",
];

const roles = [
  { name: "Admin", perms: [true, true, true, true, true, true, true] },
  { name: "Recruiter", perms: [true, true, true, true, false, true, false] },
  { name: "Hiring Manager", perms: [false, true, true, true, false, false, false] },
  { name: "Viewer", perms: [false, true, false, false, false, false, false] },
];

function RolesSettings() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold">Roles & Permissions</h2>
        <p className="text-sm text-muted-foreground">View what each role is allowed to do in your workspace.</p>
      </div>

      <Card className="shadow-xs overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Permission</TableHead>
                {roles.map((r) => (
                  <TableHead key={r.name} className="text-center">{r.name}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.map((p, idx) => (
                <TableRow key={p}>
                  <TableCell className="font-medium">{p}</TableCell>
                  {roles.map((r) => (
                    <TableCell key={r.name} className="text-center">
                      {r.perms[idx] ? (
                        <Check className="size-4 mx-auto text-primary" />
                      ) : (
                        <Minus className="size-4 mx-auto text-muted-foreground/30" />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
