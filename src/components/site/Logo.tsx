import { Link } from "@tanstack/react-router";
import { Landmark } from "lucide-react";

export function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="SchemeSaathi home">
      <span
        className={`grid size-10 place-items-center rounded-md ${
          inverse ? "bg-ink-foreground text-ink" : "bg-primary text-primary-foreground"
        }`}
      >
        <Landmark className="size-5" aria-hidden />
      </span>
      <span className="whitespace-nowrap leading-tight">
        <span className={`font-display text-lg font-bold ${inverse ? "text-ink-foreground" : "text-primary"}`}>
          SchemeSaathi{" "}
          <span className={`hidden text-xs font-semibold sm:inline ${inverse ? "text-ink-muted" : "text-saffron-text"}`}>
            (योजना साथी)
          </span>
        </span>
        <span className={`block text-xs ${inverse ? "text-ink-muted" : "text-muted-foreground"}`}>
          Empowering Every Citizen
        </span>
      </span>
    </Link>
  );
}
