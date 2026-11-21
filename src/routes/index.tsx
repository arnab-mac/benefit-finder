import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  LayoutGrid,
  List,
  MapPin,
  Search,
  SlidersHorizontal,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SchemeCard } from "@/components/site/SchemeCard";
import { HelpBanner } from "@/components/site/HelpBanner";
import { iconFor } from "@/components/site/category-icons";
import { useSavedSchemes } from "@/hooks/use-saved";
import { schemesQuery } from "@/lib/scheme-queries";
import { BENEFIT_TYPES, CATEGORIES, LEVELS, SOCIAL_CATEGORIES, STATES, categoryLabel, stateName } from "@/lib/constants";
import { INCOME_BRACKETS, TARGET_GROUPS, fitsIncome, inTargetGroup, matchesKeyword } from "@/lib/scheme-filters";
import type { SchemeSummary } from "@/lib/schemes.functions";

type Search = { q?: string | undefined; category?: string | undefined; state?: string | undefined };

export const Route = createFileRoute("/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s["q"] === "string" && s["q"] ? s["q"] : undefined,
    category: typeof s["category"] === "string" && s["category"] ? s["category"] : undefined,
    state: typeof s["state"] === "string" && s["state"] ? s["state"] : undefined,
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(schemesQuery()),
  head: () => ({
    meta: [
      { title: "Find Government Welfare Schemes — SchemeSaathi" },
      {
        name: "description",
        content:
          "Search Central and State welfare schemes by sector, benefit type, income and category. See benefits and who can apply.",
      },
      { property: "og:title", content: "Find Government Welfare Schemes — SchemeSaathi" },
      {
        property: "og:description",
        content: "Search Central and State welfare schemes and see who can apply, in plain language.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FindSchemes,
});

const PAGE_SIZE = 9;
type Sort = "popular" | "benefit" | "name";

function FindSchemes() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const { data: schemes } = useSuspenseQuery(schemesQuery());
  const { savedIds, toggle } = useSavedSchemes();

  const [keyword, setKeyword] = useState(search.q ?? "");
  const [levels, setLevels] = useState<string[]>([]);
  const [benefits, setBenefits] = useState<string[]>([]);
  const [income, setIncome] = useState<string | null>(null);
  const [social, setSocial] = useState<string | null>(null);
  const [pwdOnly, setPwdOnly] = useState(false);
  const [group, setGroup] = useState("all");
  const [sort, setSort] = useState<Sort>("popular");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);

  const category = search.category ?? null;
  const stateCode = search.state ?? "all";

  const base = useMemo(
    () =>
      schemes.filter(
        (s) =>
          matchesKeyword(s, search.q ?? "") &&
          (stateCode === "all" || s.level !== "state" || s.state_code === stateCode) &&
          inTargetGroup(s, group),
      ),
    [schemes, search.q, stateCode, group],
  );

  const passes = (s: SchemeSummary, skip?: "level" | "category") =>
    (skip === "level" || levels.length === 0 || levels.includes(s.level)) &&
    (skip === "category" || !category || s.category === category) &&
    (benefits.length === 0 || benefits.some((b) => s.benefit_types.includes(b))) &&
    (!income || fitsIncome(s, income)) &&
    (!social || s.social_categories.length === 0 || s.social_categories.includes(social)) &&
    (!pwdOnly || s.requires_flags.includes("pwd"));

  const filtered = useMemo(() => {
    const list = base.filter((s) => passes(s));
    const sorted = [...list];
    if (sort === "benefit") sorted.sort((a, b) => b.benefit_value - a.benefit_value);
    else if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    else sorted.sort((a, b) => b.popularity - a.popularity);
    return sorted;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, levels, category, benefits, income, social, pwdOnly, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const statesCovered = new Set(schemes.filter((s) => s.state_code).map((s) => s.state_code)).size;
  const dbtCount = schemes.filter((s) => s.is_dbt).length;
  const trending = [...schemes].sort((a, b) => b.popularity - a.popularity).slice(0, 6);

  const setSearch = (patch: Partial<Search>) => {
    setPage(1);
    void navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true, resetScroll: false });
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSearch({ q: keyword.trim() || undefined });
    document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleIn = (list: string[], v: string, set: (l: string[]) => void) => {
    setPage(1);
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  };

  const clearAll = () => {
    setLevels([]);
    setBenefits([]);
    setIncome(null);
    setSocial(null);
    setPwdOnly(false);
    setGroup("all");
    setKeyword("");
    setPage(1);
    void navigate({ search: {}, replace: true, resetScroll: false });
  };

  const chips: { label: string; clear: () => void }[] = [
    ...(search.q ? [{ label: `“${search.q}”`, clear: () => { setKeyword(""); setSearch({ q: undefined }); } }] : []),
    ...(category ? [{ label: categoryLabel(category), clear: () => setSearch({ category: undefined }) }] : []),
    ...(stateCode !== "all" ? [{ label: stateName(stateCode), clear: () => setSearch({ state: undefined }) }] : []),
    ...levels.map((l) => ({ label: LEVELS.find((x) => x.id === l)?.label ?? l, clear: () => toggleIn(levels, l, setLevels) })),
    ...benefits.map((b) => ({ label: BENEFIT_TYPES.find((x) => x.id === b)?.label ?? b, clear: () => toggleIn(benefits, b, setBenefits) })),
    ...(income ? [{ label: INCOME_BRACKETS.find((x) => x.id === income)?.label ?? "", clear: () => setIncome(null) }] : []),
    ...(social ? [{ label: social.toUpperCase(), clear: () => setSocial(null) }] : []),
    ...(pwdOnly ? [{ label: "PwD specific", clear: () => setPwdOnly(false) }] : []),
  ];

  const filters = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-primary">
          <SlidersHorizontal className="size-4" aria-hidden /> Filters
        </h2>
        {chips.length > 0 && (
          <button onClick={clearAll} className="text-xs font-semibold text-saffron-text hover:underline">
            Clear all
          </button>
        )}
      </div>
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 rounded-md bg-surface-low p-2">
          {chips.map((c) => (
            <button
              key={c.label}
              onClick={c.clear}
              className="inline-flex items-center gap-1 rounded border bg-card px-2 py-1 text-xs font-medium hover:border-primary"
            >
              {c.label} <X className="size-3" aria-label="remove" />
            </button>
          ))}
        </div>
      )}

      <FilterGroup title="Governing body">
        {LEVELS.map((l) => {
          const count = base.filter((s) => s.level === l.id && passes(s, "level")).length;
          return (
            <label key={l.id} className="flex cursor-pointer items-center justify-between gap-2 py-1.5 text-sm">
              <span className="flex items-center gap-2.5">
                <Checkbox checked={levels.includes(l.id)} onCheckedChange={() => toggleIn(levels, l.id, setLevels)} />
                {l.label}
              </span>
              <span className="tabular text-xs text-muted-foreground">{count}</span>
            </label>
          );
        })}
      </FilterGroup>

      <FilterGroup title="Sector & category">
        <div className="-mx-2 space-y-0.5">
          {CATEGORIES.map((c) => {
            const Icon = iconFor(c.id);
            const count = base.filter((s) => s.category === c.id && passes(s, "category")).length;
            const active = category === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSearch({ category: active ? undefined : c.id })}
                aria-pressed={active}
                className={`flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm transition-colors ${
                  active ? "bg-surface-high font-semibold text-primary" : "hover:bg-surface-low"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className={`size-4 ${active ? "text-saffron" : "text-muted-foreground"}`} aria-hidden />
                  {c.label}
                </span>
                <span className="tabular text-xs text-muted-foreground">{count}</span>
              </button>
            );
          })}
        </div>
      </FilterGroup>

      <FilterGroup title="Benefit type">
        {BENEFIT_TYPES.map((b) => (
          <label key={b.id} className="flex cursor-pointer items-center gap-2.5 py-1.5 text-sm">
            <Checkbox checked={benefits.includes(b.id)} onCheckedChange={() => toggleIn(benefits, b.id, setBenefits)} />
            {b.label}
          </label>
        ))}
      </FilterGroup>

      <FilterGroup title="Citizen demographics">
        <p className="mb-2 text-xs text-muted-foreground">Annual family income</p>
        <div className="grid grid-cols-2 gap-1.5">
          {INCOME_BRACKETS.map((b) => (
            <ToggleChip key={b.id} active={income === b.id} onClick={() => { setPage(1); setIncome(income === b.id ? null : b.id); }}>
              {b.label}
            </ToggleChip>
          ))}
        </div>
        <p className="mb-2 mt-4 text-xs text-muted-foreground">Category / reservation</p>
        <div className="flex flex-wrap gap-1.5">
          {SOCIAL_CATEGORIES.map((c) => (
            <ToggleChip key={c.id} active={social === c.id} onClick={() => { setPage(1); setSocial(social === c.id ? null : c.id); }}>
              {c.label}
            </ToggleChip>
          ))}
        </div>
        <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-sm">
          <Checkbox checked={pwdOnly} onCheckedChange={(v) => { setPage(1); setPwdOnly(v === true); }} />
          Divyangjan / PwD specific
        </label>
      </FilterGroup>

      <div className="rounded-lg bg-ink p-4 text-ink-foreground">
        <p className="flex items-center gap-2 font-display font-bold">
          <ClipboardCheck className="size-4" aria-hidden /> Unsure what you qualify for?
        </p>
        <p className="mt-1.5 text-xs text-ink-muted">
          Answer a few simple questions about your age, work, income and family to see matching schemes.
        </p>
        <Button asChild variant="saffron" className="mt-3 w-full">
          <Link to="/eligibility">Take the 2-minute quiz</Link>
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <section className="bg-hero border-b">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-8 md:px-8 md:pb-14">
          <nav className="text-xs text-muted-foreground" aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5">
              <li>Home</li>
              <li aria-hidden>›</li>
              <li className="font-semibold text-primary">Find Schemes</li>
            </ol>
          </nav>
          <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="eyebrow text-saffron-text">Citizen benefit finder</p>
              <h1 className="mt-3 font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-primary md:text-5xl">
                Discover welfare schemes tailored for you & your family
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Explore Central and State government schemes with plain-language eligibility, direct cash benefits
                (DBT), scholarships, pensions and subsidies — all in one place.
              </p>
            </div>
            <dl className="civic-card grid shrink-0 grid-cols-3 divide-x p-4">
              <Stat value={String(schemes.length)} label="Schemes listed" />
              <Stat value={String(dbtCount)} label="Direct cash (DBT)" tone="saffron" />
              <Stat value={String(statesCovered)} label="State programmes" tone="emerald" />
            </dl>
          </div>

          <form onSubmit={onSubmit} className="civic-card mt-8 p-3 md:p-4" role="search">
            <div className="grid gap-2 md:grid-cols-[1fr_220px_220px_auto]">
              <label className="relative">
                <span className="sr-only">Search by keyword</span>
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Search by keyword, scheme name, subsidy or ministry"
                  className="h-12 w-full rounded-md border border-input bg-card pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
                />
              </label>
              <Select value={stateCode} onValueChange={(v) => setSearch({ state: v === "all" ? undefined : v })}>
                <SelectTrigger className="h-12" aria-label="Jurisdiction">
                  <MapPin className="size-4 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All India + all states</SelectItem>
                  {STATES.map((s) => (
                    <SelectItem key={s.code} value={s.code}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={group} onValueChange={(v) => { setPage(1); setGroup(v); }}>
                <SelectTrigger className="h-12" aria-label="Target group">
                  <Users className="size-4 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TARGET_GROUPS.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" size="xl">
                <Search /> Search schemes
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 px-1 text-xs">
              <span className="flex items-center gap-1 text-muted-foreground">
                <TrendingUp className="size-3.5" aria-hidden /> Popular:
              </span>
              {trending.map((t) => (
                <Link
                  key={t.id}
                  to="/schemes/$slug"
                  params={{ slug: t.slug }}
                  className="rounded border bg-surface-low px-2 py-1 font-medium text-primary hover:border-primary"
                >
                  {t.short_name ?? t.name}
                </Link>
              ))}
            </div>
          </form>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:px-8 lg:grid-cols-12">
        <aside className="civic-card hidden self-start p-5 lg:col-span-3 lg:block">{filters}</aside>

        <section id="results" className="lg:col-span-9" aria-live="polite">
          <div className="civic-card flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <h2 className="font-display text-xl font-bold text-primary">
                Showing {filtered.length} {filtered.length === 1 ? "scheme" : "schemes"}
              </h2>
              {chips.length > 0 && (
                <p className="text-xs text-muted-foreground">{chips.length} filter{chips.length > 1 ? "s" : ""} applied</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <SlidersHorizontal /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[22rem] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="sr-only">Filters</SheetTitle>
                  </SheetHeader>
                  <div className="px-4 pb-6">{filters}</div>
                </SheetContent>
              </Sheet>
              <span className="hidden text-xs text-muted-foreground sm:inline">Sort by</span>
              <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
                <SelectTrigger className="h-10 w-48" aria-label="Sort by">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most popular</SelectItem>
                  <SelectItem value="benefit">Highest benefit amount</SelectItem>
                  <SelectItem value="name">Name (A–Z)</SelectItem>
                </SelectContent>
              </Select>
              <div className="hidden rounded-md border p-0.5 md:flex">
                <button
                  onClick={() => setLayout("grid")}
                  aria-label="Grid view"
                  aria-pressed={layout === "grid"}
                  className={`rounded p-1.5 ${layout === "grid" ? "bg-surface-high text-primary" : "text-muted-foreground"}`}
                >
                  <LayoutGrid className="size-4" />
                </button>
                <button
                  onClick={() => setLayout("list")}
                  aria-label="List view"
                  aria-pressed={layout === "list"}
                  className={`rounded p-1.5 ${layout === "list" ? "bg-surface-high text-primary" : "text-muted-foreground"}`}
                >
                  <List className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="civic-card mt-5 p-10 text-center">
              <p className="font-display text-lg font-bold text-primary">No schemes match these filters</p>
              <p className="mt-1 text-sm text-muted-foreground">Try removing a filter or searching a broader word.</p>
              <Button variant="civic" className="mt-4" onClick={clearAll}>
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className={`mt-5 grid gap-5 ${layout === "grid" ? "sm:grid-cols-2 xl:grid-cols-3" : ""}`}>
              {visible.map((s) => (
                <SchemeCard key={s.id} scheme={s} saved={savedIds.has(s.id)} onToggleSave={toggle} layout={layout} />
              ))}
            </div>
          )}

          {pages > 1 && (
            <div className="civic-card mt-5 flex items-center justify-between p-3 text-sm">
              <p className="text-muted-foreground">
                Showing {(current - 1) * PAGE_SIZE + 1}–{Math.min(current * PAGE_SIZE, filtered.length)} of{" "}
                <strong className="text-foreground">{filtered.length}</strong>
              </p>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" disabled={current === 1} onClick={() => setPage(current - 1)}>
                  <ChevronLeft /> Prev
                </Button>
                {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                  <Button
                    key={n}
                    size="sm"
                    variant={n === current ? "default" : "ghost"}
                    onClick={() => setPage(n)}
                    aria-current={n === current ? "page" : undefined}
                  >
                    {n}
                  </Button>
                ))}
                <Button variant="ghost" size="sm" disabled={current === pages} onClick={() => setPage(current + 1)}>
                  Next <ChevronRight />
                </Button>
              </div>
            </div>
          )}

          <div className="mt-10">
            <HelpBanner />
          </div>
        </section>
      </div>
    </>
  );
}

function Stat({ value, label, tone }: { value: string; label: string; tone?: "saffron" | "emerald" }) {
  const color = tone === "saffron" ? "text-saffron-text" : tone === "emerald" ? "text-emerald-text" : "text-primary";
  return (
    <div className="px-5 first:pl-1 last:pr-1">
      <dt className="order-2 text-xs text-muted-foreground">{label}</dt>
      <dd className={`tabular font-display text-2xl font-extrabold ${color}`}>{value}</dd>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="border-t pt-5">
      <legend className="eyebrow mb-3 text-foreground">{title}</legend>
      {children}
    </fieldset>
  );
}

function ToggleChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded border px-2.5 py-1.5 text-xs font-medium transition-colors ${
        active ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary"
      }`}
    >
      {children}
    </button>
  );
}
