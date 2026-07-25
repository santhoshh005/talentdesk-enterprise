import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BookOpen, LifeBuoy, MessageCircle, Search, Video } from "lucide-react";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState } from "react";

export const Route = createFileRoute("/_app/help")({
  head: () => ({
    meta: [
      { title: "Help — TalentOS" },
      { name: "description", content: "Docs, guides, and support." },
    ],
  }),
  component: HelpPage,
});

const cards = [
  { icon: BookOpen, title: "Documentation", desc: "Getting started, guides & API refs.", action: () => toast("Documentation coming soon") },
  { icon: Video, title: "Video tutorials", desc: "Short walkthroughs of every module.", action: () => toast("Video tutorials coming soon") },
  { icon: MessageCircle, title: "Community", desc: "Ask other TalentOS teams.", action: () => toast("Community forum coming soon") },
  { icon: LifeBuoy, title: "Contact support", desc: "24/7 for Enterprise plans.", action: () => toast.success("Support request submitted") },
];

function HelpPage() {
  const [search, setSearch] = useState("");

  const filteredCards = cards.filter(
    (c) => c.title.toLowerCase().includes(search.toLowerCase()) || c.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Help & docs" description="Answers, guides and human support when you need it." />
      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input 
          placeholder="Search the knowledge base…" 
          className="h-11 pl-9" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filteredCards.map((c) => (
          <Card key={c.title} className="shadow-xs cursor-pointer transition hover:border-primary/30" onClick={c.action}>
            <CardContent className="p-5">
              <div className="grid size-9 place-items-center rounded-md bg-primary/10 text-primary">
                <c.icon className="size-4" />
              </div>
              <div className="mt-3 text-sm font-semibold">{c.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">{c.desc}</div>
            </CardContent>
          </Card>
        ))}
        {filteredCards.length === 0 && (
          <div className="col-span-full py-8 text-center text-muted-foreground">
            No categories match your search.
          </div>
        )}
      </div>

      <div className="mt-8 max-w-3xl">
        <h3 className="text-lg font-semibold mb-4">Frequently Asked Questions</h3>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>How do I connect my calendar?</AccordionTrigger>
            <AccordionContent>
              Go to Settings {'>'} Integrations and click "Connect" on either Google Calendar or Microsoft Outlook. You will be redirected to authenticate with your provider.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Can I invite team members?</AccordionTrigger>
            <AccordionContent>
              Yes! Only Admin roles can invite new team members. Navigate to Team in the sidebar, and click "Invite Member". You can assign them specific roles like Recruiter or Hiring Manager.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>How does the AI Resume Analyzer work?</AccordionTrigger>
            <AccordionContent>
              The AI Resume Analyzer extracts key skills, experience, and education from PDF or DOCX files. It then compares this data against your Job requirements to generate a match score and summary.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}