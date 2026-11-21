import type { SchemeSummary } from "./schemes.functions";

export const TARGET_GROUPS = [
  { id: "all", label: "All beneficiaries" },
  { id: "farmers", label: "Farmers" },
  { id: "women", label: "Women & girls" },
  { id: "students", label: "Students" },
  { id: "seniors", label: "Senior citizens" },
  { id: "workers", label: "Workers & labourers" },
  { id: "entrepreneurs", label: "Small business owners" },
] as const;

export function inTargetGroup(s: SchemeSummary, group: string) {
  switch (group) {
    case "farmers":
      return s.occupations.includes("farmer") || s.category === "agriculture";
    case "women":
      return s.genders.includes("female") || s.category === "women";
    case "students":
      return s.occupations.includes("student") || s.category === "education";
    case "seniors":
      return (s.min_age ?? 0) >= 60 || s.occupations.includes("senior");
    case "workers":
      return s.category === "employment" || s.occupations.includes("daily_wage");
    case "entrepreneurs":
      return s.category === "business";
    default:
      return true;
  }
}

export const INCOME_BRACKETS = [
  { id: "lt150", label: "< ₹1.5 L/yr", min: 0 },
  { id: "150to300", label: "₹1.5L – ₹3L", min: 150000 },
  { id: "300to800", label: "₹3L – ₹8L", min: 300000 },
  { id: "any", label: "No ceiling", min: Infinity },
] as const;

/** Schemes a household in this income bracket can still fall under. */
export function fitsIncome(s: SchemeSummary, bracketId: string) {
  if (bracketId === "any") return s.max_income === null;
  const b = INCOME_BRACKETS.find((x) => x.id === bracketId);
  if (!b) return true;
  return s.max_income === null || s.max_income >= b.min;
}

export function matchesKeyword(s: SchemeSummary, q: string) {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return [s.name, s.short_name, s.local_name, s.ministry, s.summary, s.eligibility_summary, s.benefit_label, ...s.tags]
    .filter(Boolean)
    .some((v) => (v as string).toLowerCase().includes(needle));
}
