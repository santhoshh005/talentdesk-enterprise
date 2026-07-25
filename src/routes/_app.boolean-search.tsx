import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_app/boolean-search")({
  head: () => ({
    meta: [
      { title: "Boolean Search — TalentOS" },
      { name: "description", content: "Build powerful boolean queries for sourcing." },
    ],
  }),
  component: BoolSearch,
});

const preview = [
  { name: "Priya Menon", role: "Sr Product Designer", loc: "Berlin" },
  { name: "Sofia Alvarez", role: "Head of Data", loc: "London" },
  { name: "Liam O'Sullivan", role: "iOS Engineer", loc: "Dublin" },
];

const query = `("Product Designer" OR "Senior Product Designer")
  AND ("Figma" AND "Design systems")
  AND ("B2B" OR "SaaS")
  AND ("Berlin" OR "Remote EU")
  NOT ("agency" OR "freelance")`;

function BoolSearch() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Boolean Search" description="Compose sourcing queries with natural language, then copy into LinkedIn or Google." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 shadow-xs h-fit">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Search builder</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5"><Label>Role</Label><Input defaultValue="Product Designer" /></div>
            <div className="space-y-1.5"><Label>Must include</Label><Input defaultValue="Figma, Design systems" /></div>
            <div className="space-y-1.5"><Label>Nice to have</Label><Input defaultValue="B2B, SaaS" /></div>
            <div className="space-y-1.5"><Label>Exclude</Label><Input defaultValue="agency, freelance" /></div>
            <div className="space-y-1.5"><Label>Location</Label><Input defaultValue="Berlin OR Remote EU" /></div>
            <Button className="w-full gap-1.5"><Sparkles className="size-4" /> Generate query</Button>
          </CardContent>
        </Card>
        <div className="lg:col-span-3 flex flex-col gap-4">
          <Card className="shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold">Generated query</CardTitle>
              <Button variant="ghost" size="sm" className="gap-1.5"><Copy className="size-4" /> Copy</Button>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap rounded-md border border-border bg-secondary/50 p-4 font-mono text-[13px] leading-relaxed text-foreground">{query}</pre>
            </CardContent>
          </Card>
          <Card className="shadow-xs">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Preview candidates</CardTitle></CardHeader>
            <CardContent className="divide-y divide-border">
              {preview.map((p) => (
                <div key={p.name} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                  <div>
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.role} · {p.loc}</div>
                  </div>
                  <Badge variant="secondary" className="rounded-full text-[11px]">Preview</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}