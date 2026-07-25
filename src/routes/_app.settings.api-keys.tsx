import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Key } from "lucide-react";

export const Route = createFileRoute("/_app/settings/api-keys")({
  component: ApiKeysSettings,
});

function ApiKeysSettings() {
  const handleGenerate = () => {
    navigator.clipboard.writeText("sk_test_" + Math.random().toString(36).substring(2, 15));
    toast.success("New API key generated and copied to clipboard");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">API Keys</h2>
          <p className="text-sm text-muted-foreground">Manage keys for programmatic access to the TalentOS API.</p>
        </div>
        <Button onClick={handleGenerate} size="sm">
          <Key className="size-4 mr-2" />
          Generate API key
        </Button>
      </div>

      <Card className="shadow-xs">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Prefix</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No API keys generated yet.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
