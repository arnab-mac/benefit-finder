import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

const SIZES = [14, 16, 18] as const;

export function TopBar() {
  const [size, setSize] = useState<number>(16);

  useEffect(() => {
    const saved = Number(window.localStorage.getItem("ss-text-size"));
    if (SIZES.includes(saved as (typeof SIZES)[number])) setSize(saved);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--base-size", `${size}px`);
    window.localStorage.setItem("ss-text-size", String(size));
  }, [size]);

  return (
    <div className="bg-ink text-ink-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded focus:bg-card focus:px-3 focus:py-2 focus:text-primary"
      >
        Skip to main content
      </a>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5 text-xs md:px-8">
        <p className="flex items-center gap-2 truncate">
          <ShieldCheck className="size-3.5 shrink-0 text-ink-muted" aria-hidden />
          <span className="truncate">Citizen guide to Indian government welfare schemes</span>
          <span className="hidden text-ink-muted sm:inline">· Not an official government website</span>
        </p>
        <div className="flex items-center gap-1" role="group" aria-label="Text size">
          <span className="mr-1 hidden text-ink-muted sm:inline">Text size</span>
          {SIZES.map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              aria-pressed={size === s}
              aria-label={["Smaller text", "Default text", "Larger text"][i]}
              className={`rounded px-1.5 py-0.5 font-semibold transition-colors ${
                size === s ? "bg-ink-foreground text-ink" : "hover:bg-ink-line"
              }`}
            >
              {["A-", "A", "A+"][i]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
