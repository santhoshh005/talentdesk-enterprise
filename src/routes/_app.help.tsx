import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BookOpen, LifeBuoy, MessageCircle, Search, Video } from "lucide-react";

export const Route = createFileRoute("/_app/help")({
  head: () => ({
    meta: [
      { title: "Help — TalentOS" },
      { name: "description", content: "Docs, guides, and support." },
    ],
  }),
  component: HelpPage,
});

function HelpPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Help & docs" description="Answers, guides and human support when you need it." />
      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search the knowledge base…" className="h-11 pl-9" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: BookOpen, title: "Documentation", desc: "Getting started, guides & API refs." },
          { icon: Video, title: "Video tutorials", desc: "Short walkthroughs of every module." },
          { icon: MessageCircle, title: "Community", desc: "Ask other TalentOS teams." },
          { icon: LifeBuoy, title: "Contact support", desc: "24/7 for Enterprise plans." },
        ].map((c) => (
          <Card key={c.title} className="shadow-xs cursor-pointer transition hover:border-primary/30">
            <CardContent className="p-5">
              <div className="grid size-9 place-items-center rounded-md bg-primary/10 text-primary">
                <c.icon className="size-4" />
              </div>
              <div className="mt-3 text-sm font-semibold">{c.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">{c.desc}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}