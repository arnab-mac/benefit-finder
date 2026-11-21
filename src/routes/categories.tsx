import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, MapPin } from "lucide-react";
import { iconFor } from "@/components/site/category-icons";
import { CATEGORIES, stateName } from "@/lib/constants";
import { schemesQuery } from "@/lib/scheme-queries";

export const Route = createFileRoute("/categories")({
  loader: ({ context }) => context.queryClient.ensureQueryData(schemesQuery()),
  head: () => ({
    meta: [
      { title: "Scheme Categories & Sectors — SchemeSaathi" },
      {
        name: "description",
        content: "Browse welfare schemes by sector: agriculture, health, education, women, housing, pensions, business loans and more.",
      },
      { property: "og:title", content: "Scheme Categories & Sectors — SchemeSaathi" },
      { property: "og:description", content: "Browse government welfare schemes by sector and by state." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data: schemes } = useSuspenseQuery(schemesQuery());
  const stateCodes = [...new Set(schemes.filter((s) => s.state_code).map((s) => s.state_code as string))].sort();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <p className="eyebrow text-saffron-text">Browse by need</p>
      <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-primary">Categories & sectors</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Pick the area of life you need help with. Each sector lists Central and State schemes with what they give and
        who can apply.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((c) => {
          const Icon = iconFor(c.id);
          const list = schemes.filter((s) => s.category === c.id);
          return (
            <Link
              key={c.id}
              to="/"
              search={{ category: c.id }}
              className="civic-card civic-card-hover group flex flex-col p-6"
            >
              <div className="flex items-start justify-between">
                <span className="grid size-12 place-items-center rounded-md bg-surface-low text-primary group-hover:bg-saffron-soft group-hover:text-saffron-text">
                  <Icon className="size-6" aria-hidden />
                </span>
                <span className="tabular rounded-full bg-surface-low px-2.5 py-1 text-xs font-semibold text-primary">
                  {list.length} schemes
                </span>
              </div>
              <h2 className="mt-5 font-display text-xl font-bold text-primary">{c.label}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{c.blurb}</p>
              <ul className="mt-4 space-y-1 text-sm">
                {list.slice(0, 3).map((s) => (
                  <li key={s.id} className="truncate text-foreground">
                    · {s.short_name ?? s.name}
                  </li>
                ))}
              </ul>
              <span className="mt-auto flex items-center gap-1 pt-5 text-sm font-semibold text-primary">
                View schemes <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          );
        })}
      </div>

      <section className="mt-14">
        <h2 className="font-display text-2xl font-bold text-primary">State programmes</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          State-specific schemes we currently list. Central schemes apply in every state.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {stateCodes.map((code) => (
            <Link
              key={code}
              to="/"
              search={{ state: code }}
              className="civic-card civic-card-hover flex items-center gap-2 px-4 py-3 text-sm font-semibold text-primary"
            >
              <MapPin className="size-4 text-saffron" aria-hidden /> {stateName(code)}
              <span className="tabular text-xs font-medium text-muted-foreground">
                {schemes.filter((s) => s.state_code === code).length}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
