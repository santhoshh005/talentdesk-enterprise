import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Sparkles, Key, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAIConfig, useUpdateAIConfig } from "@/hooks/use-api";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({
    meta: [{ title: "User Profile & AI Settings — TalentOS" }],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("Hiring Manager");

  // AI Config States
  const [aiProvider, setAiProvider] = useState("gemini");
  const [geminiKeyInput, setGeminiKeyInput] = useState("");
  const [showKey, setShowKey] = useState(false);

  const { data: aiConfigRes, isLoading: configLoading } = useAIConfig();
  const updateAIConfigMutation = useUpdateAIConfig();

  const aiConfig = aiConfigRes?.data;

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const userInitials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U";
  const orgName = user?.organization?.name || "TalentOS Enterprise";

  const handleSaveProfile = () => {
    toast.success("Profile details updated");
  };

  const handleSaveAIKey = async () => {
    if (!geminiKeyInput.trim()) {
      toast.error("Please enter your Gemini API Key");
      return;
    }

    try {
      await updateAIConfigMutation.mutateAsync({
        apiKey: geminiKeyInput.trim(),
        provider: aiProvider,
      });
      setGeminiKeyInput("");
    } catch (err) {
      // Handled in hook
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <PageHeader title="User Profile & AI Settings" description="Manage your account details and configure AI provider API keys." />

      {/* AI Key Settings Card */}
      <Card className="shadow-xs border-primary/40 bg-gradient-to-br from-card via-card to-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  AI Integration & API Key Manager
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Update your Gemini or Custom AI API Key to power all resume analysis, matching, and generation tools.
                </CardDescription>
              </div>
            </div>
            {aiConfig?.hasCustomKey && (
              <Badge variant="secondary" className="gap-1 bg-success/10 text-success text-xs font-semibold rounded-full px-2.5 py-0.5">
                <CheckCircle2 className="size-3" /> Active ({aiConfig.keyPreview})
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="font-semibold">AI Provider</Label>
              <Select value={aiProvider} onValueChange={setAiProvider}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini">Google Gemini AI (Recommended)</SelectItem>
                  <SelectItem value="openai">OpenAI (GPT-4o)</SelectItem>
                  <SelectItem value="anthropic">Anthropic (Claude 3.5)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold">Active Status</Label>
              <div className="flex items-center gap-2 rounded-md border border-border bg-secondary/40 px-3 py-2 text-xs font-medium text-muted-foreground h-9">
                {configLoading ? <Loader2 className="size-3 animate-spin" /> : (
                  <>
                    <span className={`size-2 rounded-full ${aiConfig?.hasCustomKey ? 'bg-success animate-pulse' : 'bg-primary'}`} />
                    <span>{aiConfig?.status || 'Ready for API Key'}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="font-semibold">Gemini API Key</Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type={showKey ? "text" : "password"}
                placeholder={aiConfig?.hasCustomKey ? `Current Key: ${aiConfig.keyPreview}` : "Enter your Gemini API key (e.g. AIzaSy...)"}
                className="pl-9 pr-10 font-mono text-xs"
                value={geminiKeyInput}
                onChange={(e) => setGeminiKeyInput(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Don't have a key? Obtain a free Gemini API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-primary underline">Google AI Studio</a>.
            </p>
          </div>

          <div className="flex justify-end gap-2 border-t border-border/50 pt-3">
            <Button size="sm" className="gap-1.5" onClick={handleSaveAIKey} disabled={updateAIConfigMutation.isPending}>
              {updateAIConfigMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              Save API Key
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Profile Info Card */}
      <Card className="shadow-xs">
        <CardHeader className="pb-3">
          <div>
            <CardTitle className="text-base font-semibold">Account Information</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Your personal account details</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4 border-b border-border pb-5">
            <Avatar className="size-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">{userInitials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-base font-semibold text-foreground">{firstName} {lastName}</div>
              <div className="text-sm text-muted-foreground">{email}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{orgName}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>First name</Label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Last name</Label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Work email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Job title</Label>
              <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button size="sm" onClick={handleSaveProfile}>Save profile</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
