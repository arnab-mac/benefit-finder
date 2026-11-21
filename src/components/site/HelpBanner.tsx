import { HelpCircle, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HelpBanner() {
  return (
    <section className="flex flex-col items-start gap-5 rounded-lg bg-ink p-6 text-ink-foreground md:flex-row md:items-center md:p-8">
      <span className="grid size-12 shrink-0 place-items-center rounded-md bg-saffron-soft text-saffron-text">
        <HelpCircle className="size-6" aria-hidden />
      </span>
      <div className="flex-1">
        <h2 className="font-display text-xl font-bold">Need help finding or applying?</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Visit your nearest Common Service Centre (CSC / Jan Seva Kendra) with your Aadhaar, bank passbook and ration
          card. Operators can apply on your behalf for most schemes.
        </p>
      </div>
      <Button asChild variant="inverse" size="lg">
        <a href="https://locator.csccloud.in" target="_blank" rel="noreferrer">
          <Navigation /> Find nearest CSC
        </a>
      </Button>
    </section>
  );
}
