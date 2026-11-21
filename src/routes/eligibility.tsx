import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowRight, Check, Info, Lock, RotateCcw, Save, Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { SchemeCard } from "@/components/site/SchemeCard";
import { useAuth } from "@/hooks/use-auth";
import { useSavedSchemes } from "@/hooks/use-saved";
import { getAccount, saveProfile } from "@/lib/account.functions";
import {
  HOUSING_OPTIONS,
  LAND_OPTIONS,
  OCCUPATIONS,
  SOCIAL_CATEGORIES,
  SPECIAL_FLAGS,
  STATES,
  formatINR,
} from "@/lib/constants";
import { matchAll, type Answers } from "@/lib/eligibility";
import { accountQuery, schemesQuery } from "@/lib/scheme-queries";

export const Route = createFileRoute("/eligibility")({
  loader: ({ context }) => context.queryClient.ensureQueryData(schemesQuery()),
  head: () => ({
    meta: [
      { title: "Check Your Scheme Eligibility — SchemeSaathi" },
      {
        name: "description",
        content: "Answer a few simple questions and instantly see which government welfare schemes you and your family may qualify for.",
      },
      { property: "og:title", content: "Check Your Scheme Eligibility — SchemeSaathi" },
      { property: "og:description", content: "A 2-minute quiz that matches you with government welfare schemes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EligibilityWizard,
});

const STEPS = ["Basic profile", "Income & work", "Family & social", "Matched benefits"];
const INCOME_MAX = 1_500_000;

function EligibilityWizard() {
  const { data: schemes } = useSuspenseQuery(schemesQuery());
  const { user } = useAuth();
  const { savedIds, toggle } = useSavedSchemes();
  const fetchAccount = useServerFn(getAccount);
  const save = useServerFn(saveProfile);
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answers>({});
  const [prefilled, setPrefilled] = useState(false);

  const account = useQuery({ ...accountQuery(), queryFn: () => fetchAccount(), enabled: !!user });

  useEffect(() => {
    const saved = account.data?.profile?.quiz_answers as Answers | null | undefined;
    if (!prefilled && saved && typeof saved === "object") {
      setA(saved);
      setPrefilled(true);
      toast("We filled in your saved answers", { description: "Change anything that's out of date." });
    }
  }, [account.data, prefilled]);

  const set = <K extends keyof Answers>(k: K, v: Answers[K]) => setA((p) => ({ ...p, [k]: v }));
  const allMatches = useMemo(() => matchAll(schemes, a), [schemes, a]);
  const answered = Object.values(a).some((v) => v !== undefined && !(Array.isArray(v) && v.length === 0));
  // Live view only counts schemes at least one answer supports; results show everything not ruled out.
  const live = allMatches.filter((m) => m.result.confidence > 0);
  const matches = step === 3 ? allMatches : live;
  const cash = live.reduce((sum, m) => sum + m.scheme.annual_cash, 0);
  const strong = matches.filter((m) => m.result.confidence >= 75);
  const possible = matches.filter((m) => m.result.confidence < 75);

  const go = (n: number) => {
    if (step === 2 && n > 2 && a.flags === undefined) set("flags", []);
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveAnswers = async () => {
    if (!user) {
      toast("Sign in to save your answers", { description: "We'll remember them for next time." });
      return;
    }
    try {
      await save({ data: { quiz_answers: a as Record<string, unknown>, ...(a.state ? { state_code: a.state } : {}) } });
      toast.success("Your answers are saved");
    } catch {
      toast.error("Couldn't save right now. Please try again.");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <section className="civic-card bg-hero p-6 md:p-8">
        <p className="inline-flex items-center gap-1.5 rounded bg-saffron-soft px-2.5 py-1 text-xs font-semibold text-saffron-text">
          <Zap className="size-3.5" aria-hidden /> Eligibility checker
        </p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-primary md:text-4xl">
              Find schemes you may qualify for
            </h1>
            <p className="mt-2 text-muted-foreground">
              Answer a few simple questions. We compare your answers with the official rules of {schemes.length}{" "}
              Central and State schemes. Skip anything you're unsure about.
            </p>
          </div>
          <p className="flex items-center gap-2 rounded-md bg-surface-high px-4 py-3 text-sm text-primary">
            <Lock className="size-4" aria-hidden /> Answers stay on this page unless you choose to save them.
          </p>
        </div>
        <ol className="mt-6 grid gap-2 md:grid-cols-4">
          {STEPS.map((label, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <li key={label}>
                <button
                  onClick={() => go(i)}
                  className={`flex w-full items-center gap-3 rounded-md p-2.5 text-left transition-colors ${active ? "bg-surface-high" : "hover:bg-surface-low"}`}
                  aria-current={active ? "step" : undefined}
                >
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-md font-display font-bold ${
                      done ? "bg-emerald text-emerald-foreground" : active ? "bg-saffron text-saffron-foreground" : "bg-card text-muted-foreground"
                    }`}
                  >
                    {done ? <Check className="size-4" /> : i + 1}
                  </span>
                  <span className="leading-tight">
                    <span className={`eyebrow block ${active ? "text-saffron-text" : "text-muted-foreground"}`}>
                      {done ? "Done" : active ? "In progress" : `Step ${i + 1}`}
                    </span>
                    <span className={`text-sm font-semibold ${active || done ? "text-primary" : "text-muted-foreground"}`}>{label}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-high">
          <div className="h-full rounded-full bg-saffron transition-all duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>
      </section>

      {step < 3 ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          <div className="civic-card p-5 md:p-7 lg:col-span-8">
            {step === 0 && (
              <div className="space-y-8">
                <Question n={1} title="How old are you?">
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={120}
                    value={a.age ?? ""}
                    onChange={(e) => set("age", e.target.value === "" ? undefined : Math.max(0, Math.min(120, Number(e.target.value))))}
                    placeholder="Age in years"
                    className="h-12 max-w-48 text-lg"
                    aria-label="Age in years"
                  />
                </Question>
                <Question n={2} title="Gender">
                  <OptionGrid
                    cols={3}
                    value={a.gender}
                    onChange={(v) => set("gender", v as Answers["gender"])}
                    options={[{ id: "female", label: "Female" }, { id: "male", label: "Male" }, { id: "other", label: "Transgender / Other" }]}
                  />
                </Question>
                <Question n={3} title="Which state do you live in?" hint="State schemes are matched only to residents.">
                  <Select value={a.state ?? ""} onValueChange={(v) => set("state", v)}>
                    <SelectTrigger className="h-12 max-w-sm" aria-label="State">
                      <SelectValue placeholder="Select your state" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATES.map((s) => <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Question>
                <Question n={4} title="Do you live in a village or a town / city?">
                  <OptionGrid
                    cols={2}
                    value={a.area}
                    onChange={(v) => set("area", v as Answers["area"])}
                    options={[{ id: "rural", label: "Village (rural)" }, { id: "urban", label: "Town / city (urban)" }]}
                  />
                </Question>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-8">
                <Question n={1} title="What is your main occupation?" hint="Select one">
                  <OptionGrid
                    cols={2}
                    value={a.occupation}
                    onChange={(v) => set("occupation", v)}
                    options={OCCUPATIONS.map((o) => ({ id: o.id, label: o.label, hint: o.hint }))}
                  />
                </Question>
                <Question n={2} title="Total yearly household income" hint="All earning members of your family, before tax.">
                  <div className="rounded-md border bg-surface-low p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Estimated income</span>
                      <span className="tabular rounded-md border bg-card px-3 py-1.5 font-display text-2xl font-extrabold text-saffron-text">
                        {a.income === undefined ? "—" : a.income >= INCOME_MAX ? "₹15 L+" : formatINR(a.income)}
                        <span className="ml-1 text-xs font-medium text-muted-foreground">/ year</span>
                      </span>
                    </div>
                    <Slider
                      className="mt-6"
                      min={0}
                      max={INCOME_MAX}
                      step={10000}
                      value={[a.income ?? 0]}
                      onValueChange={(v) => set("income", v[0])}
                      aria-label="Yearly household income"
                    />
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                      <span>₹0</span><span>₹2.5 L</span><span>₹5 L</span><span>₹10 L</span><span>₹15 L+</span>
                    </div>
                    <p className="mt-4 flex gap-2 rounded-md bg-card p-3 text-xs text-muted-foreground">
                      <Info className="size-4 shrink-0 text-primary" aria-hidden />
                      Many scholarships and state support schemes are for families earning up to ₹2.5 lakh a year.
                    </p>
                  </div>
                </Question>
                <Question n={3} title="Do you own farm land?">
                  <RadioList value={a.land} onChange={(v) => set("land", v as Answers["land"])} options={LAND_OPTIONS.map((o) => ({ id: o.id, label: o.label }))} />
                </Question>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <Question n={1} title="Your housing">
                  <RadioList value={a.housing} onChange={(v) => set("housing", v as Answers["housing"])} options={HOUSING_OPTIONS.map((o) => ({ id: o.id, label: o.label }))} />
                </Question>
                <Question n={2} title="Social category">
                  <OptionGrid cols={5} value={a.socialCategory} onChange={(v) => set("socialCategory", v)} options={SOCIAL_CATEGORIES.map((c) => ({ id: c.id, label: c.label }))} />
                </Question>
                <Question n={3} title="Does any of this apply to you or your family?" hint="Select all that apply">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {SPECIAL_FLAGS.map((f) => {
                      const checked = (a.flags ?? []).includes(f.id);
                      return (
                        <label key={f.id} className={`flex cursor-pointer gap-3 rounded-md border p-3.5 transition-colors ${checked ? "border-primary bg-surface-high" : "bg-surface-low hover:border-outline"}`}>
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => {
                              const cur = a.flags ?? [];
                              set("flags", checked ? cur.filter((x) => x !== f.id) : [...cur, f.id]);
                            }}
                            className="mt-0.5"
                          />
                          <span>
                            <span className="block text-sm font-semibold">{f.label}</span>
                            <span className="text-xs text-muted-foreground">{f.hint}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </Question>
              </div>
            )}

            <div className="mt-10 flex flex-wrap items-center gap-3 border-t pt-6">
              {step > 0 && (
                <Button variant="soft" size="xl" onClick={() => go(step - 1)}>
                  <ArrowLeft /> Previous
                </Button>
              )}
              <Button variant="ghost" onClick={saveAnswers}>
                <Save /> Save answers
              </Button>
              <Button variant="saffron" size="xl" className="ml-auto" onClick={() => go(step + 1)}>
                {step === 2 ? "See matched schemes" : "Next step"}
                <span className="tabular rounded bg-ink/25 px-2 py-0.5 text-sm">{matches.length}</span>
                <ArrowRight />
              </Button>
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="civic-card sticky top-24 overflow-hidden">
              <div className="bg-entitlement p-6 text-ink-foreground">
                <div className="flex items-center justify-between">
                  <span className="eyebrow flex items-center gap-1.5 text-ink-muted">
                    <span className="size-2 animate-pulse rounded-full bg-saffron" /> Live estimate
                  </span>
                  <span className="tabular rounded bg-ink-line px-2 py-0.5 text-xs font-semibold">{matches.length} matched</span>
                </div>
                <p className="mt-3 text-sm text-ink-muted">Indicative yearly cash support</p>
                <p className="tabular font-display text-4xl font-extrabold">{formatINR(cash)}</p>
                <p className="mt-1 text-xs text-ink-muted">Direct transfers only. Insurance, loans and subsidies are extra.</p>
              </div>
              <div className="p-4">
                {!answered && (
                  <p className="rounded-md bg-surface-low p-4 text-sm text-muted-foreground">
                    Start answering and matching schemes will appear here.
                  </p>
                )}
                {answered && <p className="eyebrow mb-2 text-muted-foreground">Top matches so far</p>}
                <ul className="space-y-2">
                  {matches.slice(0, 4).map(({ scheme: s, result }) => (
                    <li key={s.id} className="rounded-md border bg-surface-low p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-primary">{s.short_name ?? s.name}</p>
                        <span className={`tabular shrink-0 rounded px-1.5 py-0.5 text-xs font-bold ${result.confidence >= 75 ? "bg-emerald text-emerald-foreground" : "bg-surface-high text-primary"}`}>
                          {result.confidence}%
                        </span>
                      </div>
                      <p className="tabular mt-0.5 text-xs text-muted-foreground">{s.benefit_headline}</p>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 flex gap-2 text-xs text-muted-foreground">
                  <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                  The % shows how many of each scheme's rules your answers confirm. More answers = better accuracy.
                </p>
              </div>
            </div>
          </aside>
        </div>
      ) : (
        <section className="mt-6">
          <div className="civic-card flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="eyebrow flex items-center gap-1.5 text-emerald-text"><Sparkles className="size-3.5" /> Your results</p>
              <h2 className="mt-1 font-display text-2xl font-bold text-primary">
                You may qualify for {matches.length} {matches.length === 1 ? "scheme" : "schemes"}
                <span className="ml-2 align-middle text-sm font-semibold text-emerald-text">{strong.length} strong</span>
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Indicative yearly cash support: <strong className="tabular text-foreground">{formatINR(cash)}</strong>. Final
                eligibility is decided by the scheme's office after checking your documents.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => { setA({}); go(0); }}><RotateCcw /> Start over</Button>
              {user ? (
                <Button onClick={saveAnswers}><Save /> Save my answers</Button>
              ) : (
                <Button asChild><Link to="/auth" search={{ redirect: "/eligibility" }}>Sign in to save results</Link></Button>
              )}
            </div>
          </div>

          {strong.length > 0 && (
            <ResultGroup title="Strong matches" subtitle="Your answers meet most of the published rules.">
              {strong.map(({ scheme, result }) => (
                <SchemeCard key={scheme.id} scheme={scheme} saved={savedIds.has(scheme.id)} onToggleSave={toggle} matchLabel={`${result.confidence}% match`} />
              ))}
            </ResultGroup>
          )}
          {possible.length > 0 && (
            <ResultGroup title="Worth checking" subtitle="Nothing rules you out, but some details weren't answered.">
              {possible.map(({ scheme, result }) => (
                <SchemeCard key={scheme.id} scheme={scheme} saved={savedIds.has(scheme.id)} onToggleSave={toggle} matchLabel={`${result.confidence}% match`} />
              ))}
            </ResultGroup>
          )}
          {matches.length === 0 && (
            <div className="civic-card mt-6 p-10 text-center">
              <p className="font-display text-lg font-bold text-primary">No matching schemes found</p>
              <p className="mt-1 text-sm text-muted-foreground">Try changing an answer, or browse all schemes.</p>
              <Button asChild variant="civic" className="mt-4"><Link to="/">Browse all schemes</Link></Button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function Question({ n, title, hint, children }: { n: number; title: string; hint?: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="flex w-full flex-wrap items-baseline justify-between gap-2">
        <span className="font-display text-lg font-bold text-primary">{n}. {title}</span>
        {hint && <span className="text-xs font-medium text-muted-foreground">{hint}</span>}
      </legend>
      <div className="mt-3">{children}</div>
    </fieldset>
  );
}

function OptionGrid({
  options,
  value,
  onChange,
  cols,
}: {
  options: { id: string; label: string; hint?: string }[];
  value: string | undefined;
  onChange: (v: string) => void;
  cols: 2 | 3 | 5;
}) {
  const grid = cols === 5 ? "grid-cols-3 sm:grid-cols-5" : cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";
  return (
    <div className={`grid gap-2 ${grid}`} role="radiogroup">
      {options.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.id)}
            className={`rounded-md border p-3.5 text-left transition-colors ${active ? "border-2 border-primary bg-surface-high" : "bg-surface-low hover:border-outline"}`}
          >
            <span className="block text-sm font-semibold text-primary">{o.label}</span>
            {o.hint && <span className="text-xs text-muted-foreground">{o.hint}</span>}
          </button>
        );
      })}
    </div>
  );
}

function RadioList({ options, value, onChange }: { options: { id: string; label: string }[]; value: string | undefined; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2" role="radiogroup">
      {options.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.id)}
            className={`flex w-full items-center gap-3 rounded-md border p-3.5 text-left text-sm transition-colors ${active ? "border-primary bg-surface-high font-semibold" : "bg-surface-low hover:border-outline"}`}
          >
            <span className={`grid size-5 place-items-center rounded-full border-2 ${active ? "border-saffron" : "border-outline"}`}>
              {active && <span className="size-2.5 rounded-full bg-saffron" />}
            </span>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function ResultGroup({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="mt-8">
      <h3 className="font-display text-xl font-bold text-primary">{title}</h3>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </div>
  );
}
