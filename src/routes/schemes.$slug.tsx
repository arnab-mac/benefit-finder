import type { ReactNode } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ExternalLink,
  FileText,
  Headset,
  IndianRupee,
  Landmark,
  MapPin,
  Phone,
  ShieldX,
  Users,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { iconFor } from "@/components/site/category-icons";
import { DbtBadge, LevelBadge } from "@/components/site/SchemeBadges";
import { HelpBanner } from "@/components/site/HelpBanner";
import { TrackApplicationDialog } from "@/components/site/TrackApplicationDialog";
import { useSavedSchemes } from "@/hooks/use-saved";
import { categoryLabel, stateName } from "@/lib/constants";
import { schemeQuery } from "@/lib/scheme-queries";

type Point = { title: string; detail: string };
type Doc = { name: string; detail: string };
type Faq = { q: string; a: string };

export const Route = createFileRoute("/schemes/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(schemeQuery(params.slug));
    if (!data.scheme) throw notFound();
    return { name: data.scheme.name, summary: data.scheme.summary, short: data.scheme.short_name };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.short ?? loaderData.name} — Benefits & Eligibility | SchemeSaathi` : "Scheme | SchemeSaathi";
    const desc = loaderData?.summary ?? "Government welfare scheme details, eligibility and how to apply.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(loaderData ? [] : [{ name: "robots", content: "noindex" }]),
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-bold text-primary">Scheme not found</h1>
      <p className="mt-2 text-muted-foreground">This scheme may have been renamed or removed.</p>
      <Button asChild className="mt-6">
        <Link to="/">Browse all schemes</Link>
      </Button>
    </div>
  ),
  component: SchemePage,
});

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "eligibility", label: "Eligibility & exclusions" },
  { id: "documents", label: "Required documents" },
  { id: "apply", label: "How to apply" },
  { id: "faqs", label: "FAQs" },
];

const APPLY_MODE: Record<string, string> = {
  online: "Apply online",
  offline: "Apply in person",
  both: "Online or at CSC",
};

function SchemePage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(schemeQuery(slug));
  const { savedIds, toggle } = useSavedSchemes();
  const s = data.scheme!;
  const points = (s.eligibility_points as Point[]) ?? [];
  const docs = (s.documents as Doc[]) ?? [];
  const steps = (s.steps as Point[]) ?? [];
  const faqs = (s.faqs as Faq[]) ?? [];
  const saved = savedIds.has(s.id);
  const Icon = iconFor(s.category);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
      <nav className="text-xs text-muted-foreground" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link to="/" className="hover:underline">Find Schemes</Link></li>
          <li aria-hidden>›</li>
          <li><Link to="/" search={{ category: s.category }} className="hover:underline">{categoryLabel(s.category)}</Link></li>
          <li aria-hidden>›</li>
          <li className="font-semibold text-primary">{s.short_name ?? s.name}</li>
        </ol>
      </nav>

      <section className="civic-card mt-4 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 bg-ink px-5 py-2.5 text-xs font-semibold text-ink-foreground">
          <span className="flex items-center gap-2 uppercase tracking-wider">
            <Landmark className="size-3.5" aria-hidden /> {s.ministry}
          </span>
          <span className="text-ink-muted">
            {s.level === "state" ? `${stateName(s.state_code)} state scheme` : s.level === "centrally_sponsored" ? "Centrally sponsored scheme" : "Central sector scheme"}
          </span>
        </div>
        <div className="grid gap-6 p-5 md:p-7 lg:grid-cols-[1fr_auto]">
          <div className="flex gap-4">
            <span className="hidden size-14 shrink-0 place-items-center rounded-md bg-surface-low text-primary sm:grid">
              <Icon className="size-7" aria-hidden />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <LevelBadge level={s.level} stateCode={s.state_code} />
                {s.is_dbt && <DbtBadge />}
                {s.short_name && <Badge variant="pill">{s.short_name}</Badge>}
              </div>
              <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight text-primary md:text-4xl">
                {s.name}
              </h1>
              {s.local_name && <p className="mt-1 font-display text-lg font-semibold text-saffron-text">{s.local_name}</p>}
              <p className="mt-3 max-w-3xl text-muted-foreground">{s.summary}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 lg:w-64">
            <Button asChild size="xl">
              <a href={s.official_url} target="_blank" rel="noreferrer">
                Apply on official portal <ExternalLink />
              </a>
            </Button>
            <TrackApplicationDialog schemeId={s.id} schemeName={s.short_name ?? s.name}>
              <Button variant="saffron" size="xl">Track my application</Button>
            </TrackApplicationDialog>
            <Button variant="civic" onClick={() => toggle(s.id)} aria-pressed={saved}>
              {saved ? <BookmarkCheck className="text-saffron" /> : <Bookmark />}
              {saved ? "Saved" : "Save scheme"}
            </Button>
          </div>
        </div>
        <dl className="grid border-t sm:grid-cols-2 lg:grid-cols-4">
          <Fact icon={IndianRupee} label={s.benefit_label} value={s.benefit_headline} note={s.benefit_note} tone="emerald" />
          <Fact icon={Users} label="Who it's for" value={s.tags[0] ?? categoryLabel(s.category)} note={s.tags.slice(1).join(" · ")} />
          <Fact icon={MapPin} label="How to apply" value={APPLY_MODE[s.apply_mode] ?? "Apply"} note={new URL(s.official_url).hostname.replace("www.", "")} />
          <Fact icon={Phone} label="Helpline" value={s.helpline ?? "See official portal"} note="Toll-free where available" />
        </dl>
      </section>

      {s.deadline_note && (
        <div className="mt-4 flex items-center gap-3 rounded-md border border-saffron/40 bg-saffron-soft px-4 py-3 text-sm">
          <AlertTriangle className="size-4 shrink-0 text-saffron-text" aria-hidden />
          <p><strong className="text-saffron-text">Timeline:</strong> {s.deadline_note}</p>
        </div>
      )}

      <nav className="sticky top-[73px] z-30 mt-6 -mx-4 overflow-x-auto border-b bg-background/95 px-4 backdrop-blur md:mx-0 md:px-0" aria-label="Sections">
        <ul className="flex gap-1">
          {SECTIONS.map((sec) => (
            <li key={sec.id}>
              <a href={`#${sec.id}`} className="block whitespace-nowrap border-b-2 border-transparent px-3 py-3 text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary">
                {sec.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <Section id="overview" title="About the scheme">
            <p className="leading-relaxed text-foreground">{s.description}</p>
            <div className="mt-5 rounded-md bg-emerald-soft p-4">
              <p className="text-xs font-semibold text-emerald-text">{s.benefit_label}</p>
              <p className="tabular font-display text-3xl font-extrabold">{s.benefit_headline}</p>
              {s.benefit_note && <p className="mt-1 text-sm text-muted-foreground">{s.benefit_note}</p>}
            </div>
          </Section>

          <Section id="eligibility" title="Who can apply" subtitle={s.eligibility_summary}>
            {points.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {points.map((p) => (
                  <div key={p.title} className="rounded-md border bg-surface-low p-4">
                    <p className="flex items-center gap-2 font-semibold text-primary">
                      <CheckCircle2 className="size-4 text-emerald" aria-hidden /> {p.title}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{p.detail}</p>
                  </div>
                ))}
              </div>
            )}
            {s.exclusions.length > 0 && (
              <div className="mt-5 rounded-md border border-destructive/25 bg-destructive/5 p-4">
                <p className="flex items-center gap-2 font-semibold text-destructive">
                  <ShieldX className="size-4" aria-hidden /> Not eligible
                </p>
                <ul className="mt-2 grid gap-1.5 text-sm sm:grid-cols-2">
                  {s.exclusions.map((x) => (
                    <li key={x} className="flex gap-2"><span className="text-destructive">•</span>{x}</li>
                  ))}
                </ul>
              </div>
            )}
            <Button asChild variant="soft" className="mt-5">
              <Link to="/eligibility">Check all schemes I may qualify for</Link>
            </Button>
          </Section>

          <Section id="documents" title="Documents checklist">
            <ul className="divide-y rounded-md border">
              {docs.map((d) => (
                <li key={d.name} className="flex items-start gap-3 p-4">
                  <FileText className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                  <div>
                    <p className="font-semibold">{d.name}</p>
                    <p className="text-sm text-muted-foreground">{d.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Section>

          <Section id="apply" title="Step-by-step application">
            <ol className="grid gap-3 md:grid-cols-2">
              {steps.map((st, i) => (
                <li key={st.title} className={`rounded-md border p-4 ${i === steps.length - 1 ? "bg-ink text-ink-foreground" : "bg-card"}`}>
                  <span className={`grid size-8 place-items-center rounded font-display font-bold ${i === steps.length - 1 ? "bg-saffron text-saffron-foreground" : "bg-surface-high text-primary"}`}>
                    {i + 1}
                  </span>
                  <p className="mt-3 font-semibold">{st.title}</p>
                  <p className={`mt-1 text-sm ${i === steps.length - 1 ? "text-ink-muted" : "text-muted-foreground"}`}>{st.detail}</p>
                </li>
              ))}
            </ol>
          </Section>

          <Section id="faqs" title="Frequently asked questions">
            {faqs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                For detailed questions, visit the official portal or call the helpline{s.helpline ? ` ${s.helpline}` : ""}.
              </p>
            ) : (
              <Accordion type="single" collapsible>
                {faqs.map((f) => (
                  <AccordionItem key={f.q} value={f.q}>
                    <AccordionTrigger className="text-left font-semibold">{f.q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </Section>
        </div>

        <aside className="space-y-5 lg:col-span-4">
          <div className="civic-card p-5">
            <h2 className="font-display text-lg font-bold text-primary">Official portal & tools</h2>
            <ul className="mt-4 space-y-2 text-sm">
              <SideLink href={s.official_url} label={new URL(s.official_url).hostname.replace("www.", "")} hint="Official scheme website" />
              <SideLink href="https://locator.csccloud.in" label="Find nearest CSC" hint="Get help applying in person" />
              <SideLink href="https://pgportal.gov.in" label="File a grievance (CPGRAMS)" hint="If your application is stuck" />
            </ul>
          </div>
          {s.helpline && (
            <div className="rounded-lg bg-ink p-5 text-ink-foreground">
              <p className="eyebrow flex items-center gap-2 text-ink-muted"><Headset className="size-4" /> Scheme helpline</p>
              <p className="tabular mt-2 font-display text-3xl font-extrabold">{s.helpline}</p>
              <p className="mt-1 text-sm text-ink-muted">Call for status, eligibility and complaints.</p>
            </div>
          )}
          {data.related.length > 0 && (
            <div className="civic-card p-5">
              <h2 className="font-display text-lg font-bold text-primary">Related schemes</h2>
              <ul className="mt-3 space-y-2">
                {data.related.map((r) => (
                  <li key={r.id}>
                    <Link to="/schemes/$slug" params={{ slug: r.slug }} className="block rounded-md border bg-surface-low p-3 hover:border-primary">
                      <p className="font-semibold text-primary">{r.short_name ?? r.name}</p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">{r.summary}</p>
                      <p className="tabular mt-1 text-xs font-semibold text-emerald-text">{r.benefit_headline}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="rounded-md border border-dashed p-4 text-xs text-muted-foreground">
            Amounts and rules are summarised from official sources and can change. Always confirm on the official portal
            before applying. SchemeSaathi never charges fees.
          </p>
        </aside>
      </div>

      <div className="mt-12">
        <HelpBanner />
      </div>
    </div>
  );
}

function Fact({ icon: I, label, value, note, tone }: { icon: typeof Users; label: string; value: string; note?: string | null; tone?: "emerald" }) {
  return (
    <div className="flex gap-3 border-b p-5 last:border-b-0 sm:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:last:border-r-0">
      <span className={`grid size-10 shrink-0 place-items-center rounded-md ${tone === "emerald" ? "bg-emerald-soft text-emerald-text" : "bg-surface-low text-primary"}`}>
        <I className="size-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <dt className="eyebrow text-muted-foreground">{label}</dt>
        <dd className="tabular font-display text-lg font-bold text-foreground">{value}</dd>
        {note && <dd className="truncate text-xs text-muted-foreground">{note}</dd>}
      </div>
    </div>
  );
}

function Section({ id, title, subtitle, children }: { id: string; title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section id={id} className="civic-card scroll-mt-36 p-5 md:p-7">
      <h2 className="font-display text-xl font-bold text-primary">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SideLink({ href, label, hint }: { href: string; label: string; hint: string }) {
  return (
    <li>
      <a href={href} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-md border bg-surface-low p-3 hover:border-primary">
        <span>
          <span className="block font-semibold text-primary">{label}</span>
          <span className="text-xs text-muted-foreground">{hint}</span>
        </span>
        <ExternalLink className="size-4 text-muted-foreground" aria-hidden />
      </a>
    </li>
  );
}
