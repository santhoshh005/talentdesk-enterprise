import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

export const Route = createFileRoute("/_app/settings/billing")({
  component: BillingSettings,
});

function BillingSettings() {
  return (
    <Card className="shadow-xs border-dashed">
      <CardContent className="flex flex-col items-center justify-center p-12 text-center">
        <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary mb-4">
          <CreditCard className="size-6" />
        </div>
        <h3 className="text-lg font-semibold">Billing & Subscriptions</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          Self-serve billing management is coming soon. Please contact your account manager to update your subscription or payment methods.
        </p>
      </CardContent>
    </Card>
  );
}
