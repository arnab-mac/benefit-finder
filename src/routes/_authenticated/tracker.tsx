import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertCircle,
  Bookmark,
  Check,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  Landmark,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addPayment, deleteApplication, deletePayment, saveProfile, updateApplication } from "@/lib/account.functions";
import { APPLICATION_STAGES, APPLICATION_STATUSES, STATES, formatINR, stateName } from "@/lib/constants";
import { accountQuery, schemesQuery } from "@/lib/scheme-queries";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/tracker")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(accountQuery()),
      context.queryClient.ensureQueryData(schemesQuery()),
    ]),
  head: () => ({
    meta: [
      { title: "My Applications & Benefits — SchemeSaathi" },
      { name: "description", content: "Track your welfare scheme applications, saved schemes and the benefits you've received." },
      { property: "og:title", content: "My Applications & Benefits — SchemeSaathi" },
      { property: "og:description", content: "Track your welfare scheme applications in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TrackerPage,
});

type Account = Awaited<ReturnType<NonNullable<ReturnType<typeof accountQuery>["queryFn"]>>>;
type App = Account["applications"][number];

const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

function TrackerPage() {
  const { data } = useSuspenseQuery(accountQuery());
  const { user } = useAuth();
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: ["account"] });

  const name = data.profile?.full_name || (user?.user_metadata?.["full_name"] as string | undefined) || user?.email?.split("@")[0] || "Citizen";
  const active = data.applications.filter((a) => a.status === "in_progress" || a.status === "action_needed");
  const actionNeeded = data.applications.filter((a) => a.status === "action_needed");
  const received = data.payments.reduce((s, p) => s + p.amount, 0);

  return (
    <>
      {actionNeeded.length > 0 && (
        <div className="bg-saffron text-saffron-foreground">
          <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2.5 text-sm font-semibold md:px-8">
            <AlertCircle className="size-4 shrink-0" aria-hidden />
            Action needed on {actionNeeded.length} application{actionNeeded.length > 1 ? "s" : ""}:{" "}
            {actionNeeded.map((a) => a.scheme?.short_name ?? a.scheme?.name).join(", ")}
          </div>
        </div>
      )}
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <section className="civic-card flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between md:p-7">
          <div className="flex items-center gap-4">
            <span className="grid size-16 place-items-center rounded-md bg-surface-high font-display text-2xl font-extrabold text-primary">
              {name.slice(0, 1).toUpperCase()}
            </span>
            <div>
              <h1 className="font-display text-2xl font-extrabold tracking-tight text-primary md:text-3xl">Welcome back, {name}</h1>
              <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span>{user?.email}</span>
                {data.profile?.state_code && (
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3.5" aria-hidden /> {stateName(data.profile.state_code)}
                    {data.profile.district ? ` (${data.profile.district})` : ""}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <ProfileDialog profile={data.profile} fallbackName={name} onSaved={refresh} />
            <Button asChild>
              <Link to="/eligibility"><RefreshCw /> Re-check eligibility</Link>
            </Button>
          </div>
        </section>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={ClipboardList} label="Active applications" value={`${active.length} in progress`} note={`${data.applications.length} tracked in total`} />
          <StatCard icon={Wallet} label="Benefits received" value={formatINR(received)} note={`${data.payments.length} payments logged`} />
          <StatCard icon={Bookmark} label="Saved schemes" value={`${data.saved.length} bookmarked`} note="Ready when you are" />
          <StatCard icon={AlertCircle} label="Action pending" value={`${actionNeeded.length} required`} note={actionNeeded.length ? "Check the highlighted application" : "Nothing pending"} alert={actionNeeded.length > 0} />
        </div>

        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-bold text-primary">
              Application tracking{" "}
              <span className="tabular ml-1 rounded-full bg-surface-high px-2.5 py-0.5 align-middle text-xs font-semibold">{data.applications.length} tracked</span>
            </h2>
            <Button asChild variant="civic"><Link to="/"><Plus /> Add from a scheme page</Link></Button>
          </div>
          {data.applications.length === 0 ? (
            <div className="civic-card mt-4 p-10 text-center">
              <ClipboardList className="mx-auto size-10 text-muted-foreground" aria-hidden />
              <p className="mt-3 font-display text-lg font-bold text-primary">No applications tracked yet</p>
              <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                After applying on an official portal or at a CSC, open the scheme here and press “Track my application” to keep your reference number and progress.
              </p>
              <Button asChild className="mt-5"><Link to="/">Find a scheme</Link></Button>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {data.applications.map((a) => <ApplicationCard key={a.id} app={a} onChanged={refresh} />)}
            </div>
          )}
        </section>

        <div className="mt-10 grid gap-8 lg:grid-cols-12">
          <section className="lg:col-span-7">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-xl font-bold text-primary">
                <Landmark className="size-5" aria-hidden /> Benefit passbook
              </h2>
              <PaymentDialog onSaved={refresh} />
            </div>
            <div className="civic-card mt-4 overflow-hidden">
              {data.payments.length === 0 ? (
                <p className="p-8 text-center text-sm text-muted-foreground">
                  Log money you receive from schemes (from your bank SMS or passbook) to keep a simple record.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-surface-low text-left">
                      <tr className="eyebrow text-muted-foreground">
                        <th className="px-4 py-3">Date & details</th>
                        <th className="px-4 py-3">Bank / reference</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                        <th className="px-2 py-3"><span className="sr-only">Actions</span></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {data.payments.map((p) => (
                        <tr key={p.id}>
                          <td className="px-4 py-3">
                            <p className="font-semibold">{fmtDate(p.received_on)}</p>
                            <p className="text-muted-foreground">{p.title}</p>
                            {p.scheme && (
                              <Badge variant={p.scheme.level === "state" ? "state" : "central"} className="mt-1">
                                {p.scheme.level === "state" ? `${p.scheme.state_code} State` : "Central"}
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            <p>{p.bank ?? "—"}</p>
                            {p.reference && <p className="font-mono text-xs">{p.reference}</p>}
                          </td>
                          <td className="tabular px-4 py-3 text-right font-display text-lg font-extrabold text-emerald-text">
                            +{formatINR(p.amount)}
                          </td>
                          <td className="px-2 py-3">
                            <DeletePaymentButton id={p.id} onDone={refresh} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          <section className="lg:col-span-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-xl font-bold text-primary">
                <Bookmark className="size-5" aria-hidden /> Saved schemes
              </h2>
              <Link to="/saved" className="text-sm font-semibold text-primary hover:underline">View all</Link>
            </div>
            <div className="mt-4 space-y-3">
              {data.saved.length === 0 && (
                <div className="civic-card p-6 text-center text-sm text-muted-foreground">
                  Tap the bookmark on any scheme to save it here.
                </div>
              )}
              {data.saved.slice(0, 3).map((row) =>
                row.scheme ? (
                  <div key={row.id} className="civic-card p-5">
                    <div className="flex flex-wrap gap-2">
                      {row.scheme.deadline_note && <Badge variant="saffron">{row.scheme.deadline_note}</Badge>}
                    </div>
                    <Link to="/schemes/$slug" params={{ slug: row.scheme.slug }} className="mt-1 block font-display text-lg font-bold text-primary hover:underline">
                      {row.scheme.name}
                    </Link>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{row.scheme.summary}</p>
                    <div className="mt-3 flex items-center justify-between rounded-md bg-emerald-soft px-3 py-2 text-sm">
                      <span className="text-emerald-text">{row.scheme.benefit_label}</span>
                      <strong className="tabular">{row.scheme.benefit_headline}</strong>
                    </div>
                    <Button asChild className="mt-3 w-full">
                      <Link to="/schemes/$slug" params={{ slug: row.scheme.slug }}>
                        Begin application <ChevronRight />
                      </Link>
                    </Button>
                  </div>
                ) : null,
              )}
            </div>
          </section>
        </div>

        <section className="mt-10 flex flex-col items-start gap-4 rounded-lg border bg-surface-low p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-lg font-bold text-primary">Application stuck or rejected?</p>
            <p className="text-sm text-muted-foreground">Call the scheme helpline, visit your nearest CSC, or file a grievance with the government.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="civic"><a href="https://pgportal.gov.in" target="_blank" rel="noreferrer">File a grievance (CPGRAMS)</a></Button>
            <Button asChild><a href="https://locator.csccloud.in" target="_blank" rel="noreferrer">Find nearest CSC</a></Button>
          </div>
        </section>
      </div>
    </>
  );
}

function StatCard({ icon: I, label, value, note, alert }: { icon: typeof Wallet; label: string; value: string; note: string; alert?: boolean }) {
  return (
    <div className={`rounded-lg border p-5 ${alert ? "border-saffron/40 bg-saffron-soft" : "civic-card"}`}>
      <div className="flex items-start justify-between">
        <p className={`eyebrow ${alert ? "text-saffron-text" : "text-muted-foreground"}`}>{label}</p>
        <span className={`grid size-9 place-items-center rounded-md ${alert ? "bg-saffron text-saffron-foreground" : "bg-surface-high text-primary"}`}>
          <I className="size-4" aria-hidden />
        </span>
      </div>
      <p className={`tabular mt-2 font-display text-2xl font-extrabold ${alert ? "text-saffron-text" : "text-primary"}`}>{value}</p>
      <p className={`text-sm ${alert ? "text-saffron-text" : "text-muted-foreground"}`}>{note}</p>
    </div>
  );
}

function ApplicationCard({ app, onChanged }: { app: App; onChanged: () => void }) {
  const update = useServerFn(updateApplication);
  const remove = useServerFn(deleteApplication);
  const [busy, setBusy] = useState(false);
  const status = APPLICATION_STATUSES.find((s) => s.id === app.status);

  const run = async (fn: () => Promise<unknown>, msg: string) => {
    setBusy(true);
    try {
      await fn();
      toast.success(msg);
      onChanged();
    } catch {
      toast.error("Couldn't update. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const statusVariant = app.status === "action_needed" ? "saffron" : app.status === "approved" ? "dbt" : app.status === "rejected" ? "destructive" : "central";

  return (
    <article className={`civic-card overflow-hidden ${app.status === "action_needed" ? "border-saffron/50" : ""}`}>
      <div className="flex flex-col gap-4 bg-surface-low p-5 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="ink">{app.scheme?.level === "state" ? `${app.scheme.state_code} State` : "Central sector"}</Badge>
            {app.scheme?.ministry && <Badge variant="central">{app.scheme.ministry}</Badge>}
            <Badge variant={statusVariant}>{status?.label}</Badge>
          </div>
          <h3 className="mt-2 font-display text-xl font-bold text-primary">
            {app.scheme ? <Link to="/schemes/$slug" params={{ slug: app.scheme.slug }} className="hover:underline">{app.scheme.name}</Link> : "Scheme"}
          </h3>
          <p className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
            <span>Ref: <strong className="font-mono text-foreground">{app.reference_no ?? "—"}</strong></span>
            {app.lodged_via && <span>Via: <strong className="text-foreground">{app.lodged_via}</strong></span>}
            <span>Filed: <strong className="text-foreground">{fmtDate(app.applied_on)}</strong></span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={app.status} onValueChange={(v) => run(() => update({ data: { id: app.id, status: v as "in_progress" | "action_needed" | "approved" | "rejected" } }), "Status updated")}>
            <SelectTrigger className="h-10 w-40 bg-card" aria-label="Application status"><SelectValue /></SelectTrigger>
            <SelectContent>
              {APPLICATION_STATUSES.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Remove application"
            disabled={busy}
            onClick={() => { if (window.confirm("Remove this application from your tracker?")) void run(() => remove({ data: { id: app.id } }), "Application removed"); }}
          >
            <Trash2 />
          </Button>
        </div>
      </div>

      <ol className="grid grid-cols-5 gap-1 px-3 pb-2 pt-6 md:px-8">
        {APPLICATION_STAGES.map((label, i) => {
          const n = i + 1;
          const done = n < app.stage || (n === app.stage && app.status === "approved");
          const current = n === app.stage && !done;
          return (
            <li key={label} className="relative flex flex-col items-center text-center">
              {i > 0 && <span className={`absolute right-1/2 top-5 h-0.5 w-full -translate-y-1/2 ${n <= app.stage ? "bg-emerald" : "bg-surface-high"}`} aria-hidden />}
              <span
                className={`relative z-10 grid size-10 place-items-center rounded-full font-display text-sm font-bold ${
                  done ? "bg-emerald text-emerald-foreground" : current ? (app.status === "action_needed" ? "bg-saffron text-saffron-foreground" : "bg-primary text-primary-foreground") : "bg-surface-high text-muted-foreground"
                }`}
              >
                {done ? <Check className="size-4" /> : n}
              </span>
              <span className={`mt-2 text-xs font-semibold md:text-sm ${current || done ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
              {current && <span className={`text-xs ${app.status === "action_needed" ? "text-saffron-text" : "text-muted-foreground"}`}>{app.status === "action_needed" ? "Action needed" : "Current stage"}</span>}
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t px-5 py-3">
        <p className="text-xs text-muted-foreground">Update the stage when you get an SMS or check the official status page.</p>
        <div className="flex flex-wrap gap-2">
          {app.stage > 1 && (
            <Button variant="ghost" size="sm" disabled={busy} onClick={() => run(() => update({ data: { id: app.id, stage: app.stage - 1 } }), "Stage updated")}>
              Back a stage
            </Button>
          )}
          {app.stage < 5 && (
            <Button size="sm" disabled={busy} onClick={() => run(() => update({ data: { id: app.id, stage: app.stage + 1, status: "in_progress" } }), "Moved to next stage")}>
              Mark “{APPLICATION_STAGES[app.stage - 1]}” done
            </Button>
          )}
          {app.stage === 5 && app.status !== "approved" && (
            <Button variant="emerald" size="sm" disabled={busy} onClick={() => run(() => update({ data: { id: app.id, status: "approved" } }), "Marked as received")}>
              Benefit received
            </Button>
          )}
          {app.scheme && (
            <Button asChild variant="soft" size="sm">
              <Link to="/schemes/$slug" params={{ slug: app.scheme.slug }}>Scheme details <ExternalLink /></Link>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

function ProfileDialog({ profile, fallbackName, onSaved }: { profile: Account["profile"]; fallbackName: string; onSaved: () => void }) {
  const save = useServerFn(saveProfile);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(profile?.full_name ?? fallbackName);
  const [state, setState] = useState(profile?.state_code ?? "");
  const [district, setDistrict] = useState(profile?.district ?? "");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await save({ data: { full_name: name, state_code: state || null, district: district || null } });
      toast.success("Profile updated");
      setOpen(false);
      onSaved();
    } catch {
      toast.error("Couldn't save your profile");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="soft"><Pencil /> Edit profile</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle className="font-display">Your profile</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="pname">Full name</Label>
            <Input id="pname" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>State</Label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                <SelectContent>{STATES.map((s) => <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="district">District</Label>
              <Input id="district" value={district} onChange={(e) => setDistrict(e.target.value)} maxLength={80} />
            </div>
          </div>
          <DialogFooter><Button type="submit">Save profile</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PaymentDialog({ onSaved }: { onSaved: () => void }) {
  const add = useServerFn(addPayment);
  const { data: schemes } = useSuspenseQuery(schemesQuery());
  const [open, setOpen] = useState(false);
  const [schemeId, setSchemeId] = useState<string>("none");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [bank, setBank] = useState("");
  const [reference, setReference] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const amt = Math.round(Number(amount));
    if (!amt || amt <= 0) { toast.error("Enter the amount received"); return; }
    const scheme = schemes.find((s) => s.id === schemeId);
    try {
      await add({
        data: {
          scheme_id: scheme?.id ?? null,
          title: title.trim() || (scheme ? `${scheme.short_name ?? scheme.name} payment` : "Benefit payment"),
          amount: amt,
          received_on: date,
          bank,
          reference,
        },
      });
      toast.success("Payment logged");
      setOpen(false);
      setTitle(""); setAmount(""); setBank(""); setReference(""); setSchemeId("none");
      onSaved();
    } catch {
      toast.error("Couldn't log this payment");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="civic" size="sm"><Plus /> Log a payment</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle className="font-display">Log a benefit payment</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Scheme</Label>
            <Select value={schemeId} onValueChange={setSchemeId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Other / not listed</SelectItem>
                {schemes.map((s) => <SelectItem key={s.id} value={s.id}>{s.short_name ?? s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ptitle">Description</Label>
            <Input id="ptitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 19th instalment" maxLength={120} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input id="amount" type="number" inputMode="numeric" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pdate">Received on</Label>
              <Input id="pdate" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bank">Bank</Label>
              <Input id="bank" value={bank} onChange={(e) => setBank(e.target.value)} placeholder="e.g. State Bank of India" maxLength={80} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pref">UTR / reference</Label>
              <Input id="pref" value={reference} onChange={(e) => setReference(e.target.value)} maxLength={60} />
            </div>
          </div>
          <DialogFooter><Button type="submit">Save payment</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeletePaymentButton({ id, onDone }: { id: string; onDone: () => void }) {
  const remove = useServerFn(deletePayment);
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Delete payment"
      onClick={async () => {
        if (!window.confirm("Delete this payment record?")) return;
        try { await remove({ data: { id } }); toast.success("Payment deleted"); onDone(); } catch { toast.error("Couldn't delete"); }
      }}
    >
      <Trash2 />
    </Button>
  );
}
