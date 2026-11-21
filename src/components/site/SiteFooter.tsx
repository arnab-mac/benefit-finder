import { Link } from "@tanstack/react-router";
import { Headset, ShieldCheck } from "lucide-react";
import { Logo } from "./Logo";

const OFFICIAL = [
  { href: "https://www.india.gov.in", label: "National Portal of India" },
  { href: "https://www.myscheme.gov.in", label: "myScheme (Govt. of India)" },
  { href: "https://dbtbharat.gov.in", label: "DBT Bharat Mission" },
  { href: "https://www.mygov.in", label: "MyGov Citizen Engagement" },
  { href: "https://pgportal.gov.in", label: "Public Grievance Portal (CPGRAMS)" },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4 md:px-8">
        <div className="md:col-span-1">
          <Logo inverse />
          <p className="mt-4 text-sm text-ink-muted">
            A simple way to discover Central and State welfare schemes, check what you may qualify for, and keep
            track of your applications.
          </p>
          <a
            href="https://locator.csccloud.in"
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-3 rounded-md border border-ink-line px-4 py-3 text-sm hover:bg-ink-line"
          >
            <Headset className="size-5 text-ink-muted" aria-hidden />
            <span>
              <span className="block text-xs text-ink-muted">Need in-person help?</span>
              <span className="font-semibold">Find your nearest CSC</span>
            </span>
          </a>
        </div>
        <div>
          <h2 className="eyebrow text-ink-muted">Explore</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link to="/" className="hover:underline">Find schemes</Link></li>
            <li><Link to="/categories" className="hover:underline">Categories & sectors</Link></li>
            <li><Link to="/eligibility" className="hover:underline">Eligibility quiz</Link></li>
            <li><Link to="/tracker" className="hover:underline">Track my applications</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="eyebrow text-ink-muted">Official portals</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {OFFICIAL.map((o) => (
              <li key={o.href}>
                <a href={o.href} target="_blank" rel="noreferrer" className="hover:underline">
                  {o.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="eyebrow text-ink-muted">Please note</h2>
          <div className="mt-4 rounded-md border border-ink-line p-4 text-sm">
            <p className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="size-4" aria-hidden /> Independent guide
            </p>
            <p className="mt-2 text-ink-muted">
              SchemeSaathi is not a government website and never asks for fees. Benefit amounts and rules change —
              always confirm on the official scheme portal before applying.
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-ink-line">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-ink-muted md:px-8">
          © {new Date().getFullYear()} SchemeSaathi · Information compiled from official government sources.
        </p>
      </div>
    </footer>
  );
}
