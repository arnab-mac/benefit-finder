import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import seedSchemesData from "@/data/seed-schemes.json";

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
  if (!url || !key) return null;
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
  try {
    const client = publicClient();
    if (client) {
      const { data, error } = await client
        .from("schemes")
        .select(LIST_COLUMNS)
        .order("popularity", { ascending: false });
      if (!error && data && data.length > 0) {
        return data as SchemeSummary[];
      }
      if (error) {
        console.warn("Supabase public.schemes query error, falling back to bundled dataset:", error.message);
      }
    }
  } catch (err) {
    console.warn("Backend unavailable, using bundled schemes dataset:", err);
  }
  return seedSchemesData as unknown as SchemeSummary[];
});

export const getScheme = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => ({ slug: String(input.slug).slice(0, 120) }))
  .handler(async ({ data }) => {
    try {
      const db = publicClient();
      if (db) {
        const { data: scheme, error } = await db.from("schemes").select("*").eq("slug", data.slug).maybeSingle();
        if (!error && scheme) {
          const { data: related } = await db
            .from("schemes")
            .select(LIST_COLUMNS)
            .eq("category", scheme.category)
            .neq("id", scheme.id)
            .order("popularity", { ascending: false })
            .limit(4);
          return { scheme, related: (related ?? []) as SchemeSummary[] };
        }
      }
    } catch (err) {
      console.warn("Database lookup error for slug, falling back to bundled dataset:", err);
    }

    const found = (seedSchemesData as unknown as SchemeRow[]).find((s) => s.slug === data.slug) ?? null;
    if (!found) return { scheme: null, related: [] as SchemeSummary[] };

    const related = (seedSchemesData as unknown as SchemeSummary[])
      .filter((s) => s.category === found.category && s.slug !== found.slug)
      .slice(0, 4);

    return { scheme: found, related };
  });
