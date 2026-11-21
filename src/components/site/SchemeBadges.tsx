import { BadgeCheck, Building2, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function LevelBadge({ level, stateCode }: { level: string; stateCode: string | null }) {
  if (level === "state")
    return (
      <Badge variant="state" className="gap-1">
        <MapPin className="size-3" aria-hidden /> {stateCode} State
      </Badge>
    );
  return (
    <Badge variant="central" className="gap-1">
      <Building2 className="size-3" aria-hidden />
      {level === "centrally_sponsored" ? "Central + State" : "Central Govt"}
    </Badge>
  );
}

export function DbtBadge() {
  return (
    <Badge variant="dbt" className="gap-1">
      <BadgeCheck className="size-3" aria-hidden /> Direct DBT
    </Badge>
  );
}
