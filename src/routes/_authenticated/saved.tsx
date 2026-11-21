import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SchemeCard } from "@/components/site/SchemeCard";
import { useSavedSchemes } from "@/hooks/use-saved";
import { accountQuery, schemesQuery } from "@/lib/scheme-queries";

export const Route = createFileRoute("/_authenticated/saved")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(accountQuery()),
      context.queryClient.ensureQueryData(schemesQuery()),
    ]),
  head: () => ({
    meta: [
      { title: "Saved Schemes — SchemeSaathi" },
      { name: "description", content: "Your bookmarked government welfare schemes." },
      { property: "og:title", content: "Saved Schemes — SchemeSaathi" },
      { property: "og:description", content: "Your bookmarked government welfare schemes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const { data: account } = useSuspenseQuery(accountQuery());
  const { data: schemes } = useSuspenseQuery(schemesQuery());
  const { toggle } = useSavedSchemes();
  const ids = new Set(account.saved.map((r) => r.scheme?.id));
  const list = schemes.filter((s) => ids.has(s.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <p className="eyebrow text-saffron-text">Your list</p>
      <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-primary">Saved schemes</h1>
      <p className="mt-2 text-muted-foreground">Schemes you bookmarked to read or apply for later.</p>
      {list.length === 0 ? (
        <div className="civic-card mt-8 p-12 text-center">
          <Bookmark className="mx-auto size-10 text-muted-foreground" aria-hidden />
          <p className="mt-3 font-display text-lg font-bold text-primary">Nothing saved yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Tap the bookmark on any scheme to keep it here.</p>
          <div className="mt-5 flex justify-center gap-2">
            <Button asChild><Link to="/">Browse schemes</Link></Button>
            <Button asChild variant="civic"><Link to="/eligibility">Take the quiz</Link></Button>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => <SchemeCard key={s.id} scheme={s} saved onToggleSave={toggle} />)}
        </div>
      )}
    </div>
  );
}
