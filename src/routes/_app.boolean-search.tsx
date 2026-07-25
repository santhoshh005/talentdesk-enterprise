import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, Sparkles, Loader2 } from "lucide-react";
import { useBooleanSearch } from "@/hooks/use-api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/boolean-search")({
  head: () => ({
    meta: [
      { title: "Boolean Search — TalentOS" },
      { name: "description", content: "Build powerful boolean queries for sourcing." },
    ],
  }),
  component: BoolSearch,
});

function BoolSearch() {
  const [role, setRole] = useState("Product Designer");
  const [mustHave, setMustHave] = useState("Figma, Design systems");
  const [niceToHave, setNiceToHave] = useState("B2B, SaaS");
  const [exclude, setExclude] = useState("agency, freelance");
  const [location, setLocation] = useState("Berlin OR Remote EU");
  
  const [generatedQuery, setGeneratedQuery] = useState("");
  const booleanSearch = useBooleanSearch();
  const searchResults = booleanSearch.data?.data?.results || [];

  const handleGenerate = async () => {
    // Generate simple boolean string client side
    const buildQuery = () => {
      let q = `("${role}")`;
      if (mustHave) {
        const musts = mustHave.split(',').map(s => `"${s.trim()}"`);
        q += ` AND (${musts.join(' AND ')})`;
      }
      if (niceToHave) {
        const nices = niceToHave.split(',').map(s => `"${s.trim()}"`);
        q += ` AND (${nices.join(' OR ')})`;
      }
      if (exclude) {
        const excludes = exclude.split(',').map(s => `"${s.trim()}"`);
        q += ` NOT (${excludes.join(' OR ')})`;
      }
      return q;
    };

    const queryStr = buildQuery();
    setGeneratedQuery(queryStr);

    try {
      await booleanSearch.mutateAsync({
        query: queryStr,
        location
      });
      toast.success("Search completed");
    } catch (err) {
      toast.error("Failed to execute search");
    }
  };

  const handleCopy = () => {
    if (!generatedQuery) return;
    navigator.clipboard.writeText(generatedQuery);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Boolean Search" description="Compose sourcing queries with natural language, then copy into LinkedIn or Google." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 shadow-xs h-fit">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Search builder</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Product Designer" />
            </div>
            <div className="space-y-1.5">
              <Label>Must include</Label>
              <Input value={mustHave} onChange={e => setMustHave(e.target.value)} placeholder="e.g. Figma, Design systems" />
            </div>
            <div className="space-y-1.5">
              <Label>Nice to have</Label>
              <Input value={niceToHave} onChange={e => setNiceToHave(e.target.value)} placeholder="e.g. B2B, SaaS" />
            </div>
            <div className="space-y-1.5">
              <Label>Exclude</Label>
              <Input value={exclude} onChange={e => setExclude(e.target.value)} placeholder="e.g. agency, freelance" />
            </div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Berlin OR Remote EU" />
            </div>
            <Button className="w-full gap-1.5" onClick={handleGenerate} disabled={booleanSearch.isPending}>
              {booleanSearch.isPending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} 
              Generate query
            </Button>
          </CardContent>
        </Card>
        
        <div className="lg:col-span-3 flex flex-col gap-4">
          <Card className="shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold">Generated query</CardTitle>
              <Button variant="ghost" size="sm" className="gap-1.5" onClick={handleCopy} disabled={!generatedQuery}><Copy className="size-4" /> Copy</Button>
            </CardHeader>
            <CardContent>
              {generatedQuery ? (
                <pre className="whitespace-pre-wrap rounded-md border border-border bg-secondary/50 p-4 font-mono text-[13px] leading-relaxed text-foreground">{generatedQuery}</pre>
              ) : (
                <div className="rounded-md border border-dashed border-border bg-secondary/20 p-8 text-center text-sm text-muted-foreground">
                  Your generated boolean string will appear here
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                Preview candidates {searchResults.length > 0 && <span className="text-muted-foreground ml-1">({searchResults.length})</span>}
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {booleanSearch.isPending ? (
                <div className="py-8 text-center text-sm text-muted-foreground flex flex-col items-center">
                  <Loader2 className="size-6 animate-spin mb-2" /> Searching database...
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                    <div>
                      <div className="text-sm font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.role} · {p.location || "Unknown"}</div>
                    </div>
                    <Badge variant="secondary" className="rounded-full text-[11px]">Preview</Badge>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  {generatedQuery ? "No candidates found matching this query." : "Run a query to see candidate previews here."}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}