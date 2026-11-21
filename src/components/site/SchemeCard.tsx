import { Link } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SchemeSummary } from "@/lib/schemes.functions";
import { iconFor } from "./category-icons";
import { DbtBadge, LevelBadge } from "./SchemeBadges";

type Props = {
  scheme: SchemeSummary;
  saved: boolean;
  onToggleSave: (id: string) => void;
  matchLabel?: string | undefined;
  layout?: "grid" | "list";
};

export function SchemeCard({ scheme: s, saved, onToggleSave, matchLabel, layout = "grid" }: Props) {
  const Icon = iconFor(s.category);
  return (
    <article
      className={`civic-card civic-card-hover flex flex-col p-5 ${layout === "list" ? "md:flex-row md:gap-6" : ""}`}
    >
      <div className="flex flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-2">
          <LevelBadge level={s.level} stateCode={s.state_code} />
          {s.is_dbt && <DbtBadge />}
          {matchLabel && <Badge variant="ink">{matchLabel}</Badge>}
        </div>
        <p className="eyebrow mt-3 text-muted-foreground">{s.ministry}</p>
        <h3 className="mt-1 font-display text-lg font-bold leading-snug text-primary">
          <Link to="/schemes/$slug" params={{ slug: s.slug }} className="hover:underline">
            {s.name}
          </Link>
        </h3>
        <div className="mt-4 flex items-start gap-3 rounded-md bg-emerald-soft p-3.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-md bg-card text-emerald-text">
            <Icon className="size-4.5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-emerald-text">{s.benefit_label}</p>
            <p className="tabular font-display text-xl font-extrabold text-foreground">{s.benefit_headline}</p>
            {s.benefit_note && <p className="mt-0.5 text-xs text-muted-foreground">{s.benefit_note}</p>}
          </div>
        </div>
        <p className="mt-4 text-xs font-semibold text-foreground">Who can apply</p>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{s.eligibility_summary}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {s.tags.slice(0, 3).map((t) => (
            <Badge key={t} variant="pill">
              {t}
            </Badge>
          ))}
        </div>
        {s.deadline_note && (
          <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-saffron-text">
            <Clock className="size-3.5" aria-hidden /> {s.deadline_note}
          </p>
        )}
      </div>
      <div className={`mt-5 flex items-center gap-2 ${layout === "list" ? "md:mt-0 md:w-56 md:flex-col md:justify-center" : ""}`}>
        <Button asChild className="h-11 flex-1">
          <Link to="/schemes/$slug" params={{ slug: s.slug }}>
            View details
          </Link>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-11 shrink-0"
          aria-label={saved ? `Remove ${s.short_name ?? s.name} from saved` : `Save ${s.short_name ?? s.name}`}
          aria-pressed={saved}
          onClick={() => onToggleSave(s.id)}
        >
          {saved ? <BookmarkCheck className="text-saffron" /> : <Bookmark />}
        </Button>
      </div>
    </article>
  );
}
