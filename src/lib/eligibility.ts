/**
 * Rules engine that matches a citizen's answers against each scheme's criteria.
 * Each rule is pass / fail / unknown. A scheme is a match only when no rule fails;
 * confidence is the share of applicable rules the person's answers confirm.
 */
export type Answers = {
  age?: number | undefined;
  gender?: "female" | "male" | "other" | undefined;
  state?: string | undefined;
  area?: "rural" | "urban" | undefined;
  occupation?: string | undefined;
  income?: number | undefined;
  land?: "small" | "large" | "none" | undefined;
  housing?: "pucca" | "kutcha" | "rented" | "homeless" | undefined;
  socialCategory?: string | undefined;
  flags?: string[] | undefined;
};

export type SchemeCriteria = {
  id: string;
  level: string;
  state_code: string | null;
  min_age: number | null;
  max_age: number | null;
  max_income: number | null;
  genders: string[];
  occupations: string[];
  land_statuses: string[];
  housing_statuses: string[];
  social_categories: string[];
  areas: string[];
  requires_flags: string[];
  excludes_flags: string[];
};

export type RuleResult = { rule: string; label: string; status: "pass" | "fail" | "unknown" };

export type MatchResult = {
  eligible: boolean;
  confidence: number;
  rules: RuleResult[];
  failed: RuleResult[];
};

/** Flags derived from other answers, so schemes can express simple "either / or" rules. */
export function derivedFlags(a: Answers): string[] {
  const flags = new Set(a.flags ?? []);
  if (a.gender === "female" || a.socialCategory === "sc" || a.socialCategory === "st") {
    flags.add("women_or_sc_st");
  }
  return [...flags];
}

const FLAG_LABELS: Record<string, string> = {
  bpl: "BPL / ration card",
  pwd: "Disability",
  widow: "Widow / single woman",
  girl_child: "Daughter under 10",
  expecting_mother: "Pregnant or new mother",
  shg_member: "SHG member",
  street_vendor: "Street vendor",
  artisan: "Traditional artisan",
  no_lpg: "No LPG connection",
  income_taxpayer: "Income taxpayer in family",
  govt_employee: "Government employee in family",
  women_or_sc_st: "Woman or SC/ST",
};

export function matchScheme(s: SchemeCriteria, a: Answers): MatchResult {
  const rules: RuleResult[] = [];
  const add = (rule: string, label: string, status: RuleResult["status"]) =>
    rules.push({ rule, label, status });
  const inList = (list: string[], v: string | undefined, rule: string, label: string) => {
    if (list.length === 0) return;
    add(rule, label, v === undefined ? "unknown" : list.includes(v) ? "pass" : "fail");
  };

  if (s.level === "state" && s.state_code) {
    add("state", "State of residence", a.state ? (a.state === s.state_code ? "pass" : "fail") : "unknown");
  }
  if (s.min_age !== null || s.max_age !== null) {
    const ok =
      a.age === undefined
        ? undefined
        : (s.min_age === null || a.age >= s.min_age) && (s.max_age === null || a.age <= s.max_age);
    add("age", "Age", ok === undefined ? "unknown" : ok ? "pass" : "fail");
  }
  if (s.max_income !== null) {
    add("income", "Household income", a.income === undefined ? "unknown" : a.income <= s.max_income ? "pass" : "fail");
  }
  inList(s.genders, a.gender, "gender", "Gender");
  inList(s.occupations, a.occupation, "occupation", "Occupation");
  inList(s.land_statuses, a.land, "land", "Land ownership");
  inList(s.housing_statuses, a.housing, "housing", "Housing");
  inList(s.social_categories, a.socialCategory, "category", "Social category");
  inList(s.areas, a.area, "area", "Rural / urban area");

  const flags = derivedFlags(a);
  const answeredFlags = a.flags !== undefined;
  for (const f of s.requires_flags) {
    const has = flags.includes(f);
    add(`requires:${f}`, FLAG_LABELS[f] ?? f, has ? "pass" : answeredFlags || f === "women_or_sc_st" ? "fail" : "unknown");
  }
  for (const f of s.excludes_flags) {
    if (flags.includes(f)) add(`excludes:${f}`, `Not for: ${FLAG_LABELS[f] ?? f}`, "fail");
  }

  const failed = rules.filter((r) => r.status === "fail");
  const applicable = rules.length;
  const passed = rules.filter((r) => r.status === "pass").length;
  return {
    eligible: failed.length === 0,
    confidence: applicable === 0 ? 100 : Math.round((passed / applicable) * 100),
    rules,
    failed,
  };
}

export function matchAll<T extends SchemeCriteria>(schemes: T[], a: Answers) {
  return schemes
    .map((scheme) => ({ scheme, result: matchScheme(scheme, a) }))
    .filter((m) => m.result.eligible)
    .sort((x, y) => y.result.confidence - x.result.confidence);
}
