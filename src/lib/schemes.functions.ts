import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type SchemeRow = Database["public"]["Tables"]["schemes"]["Row"];

export const LIST_COLUMNS =
  "id, slug, name, local_name, short_name, ministry, level, state_code, category, benefit_types, benefit_label, benefit_headline, benefit_note, benefit_value, annual_cash, summary, eligibility_summary, tags, min_age, max_age, max_income, genders, occupations, land_statuses, housing_statuses, social_categories, areas, requires_flags, excludes_flags, is_dbt, deadline_note, popularity, apply_mode" as const;

export type SchemeSummary = Pick<
  SchemeRow,
  | "id" | "slug" | "name" | "local_name" | "short_name" | "ministry" | "level" | "state_code" | "category"
  | "benefit_types" | "benefit_label" | "benefit_headline" | "benefit_note" | "benefit_value" | "annual_cash"
  | "summary" | "eligibility_summary" | "tags" | "min_age" | "max_age" | "max_income" | "genders"
  | "occupations" | "land_statuses" | "housing_statuses" | "social_categories" | "areas"
  | "requires_flags" | "excludes_flags" | "is_dbt" | "deadline_note" | "popularity" | "apply_mode"
>;

function publicClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Backend is not configured");
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const listSchemes = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("schemes")
    .select(LIST_COLUMNS)
    .order("popularity", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as SchemeSummary[];
});

export const getScheme = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => ({ slug: String(input.slug).slice(0, 120) }))
  .handler(async ({ data }) => {
    const db = publicClient();
    const { data: scheme, error } = await db.from("schemes").select("*").eq("slug", data.slug).maybeSingle();
    if (error) throw new Error(error.message);
    if (!scheme) return { scheme: null, related: [] as SchemeSummary[] };
    const { data: related } = await db
      .from("schemes")
      .select(LIST_COLUMNS)
      .eq("category", scheme.category)
      .neq("id", scheme.id)
      .order("popularity", { ascending: false })
      .limit(4);
    return { scheme, related: (related ?? []) as SchemeSummary[] };
  });
