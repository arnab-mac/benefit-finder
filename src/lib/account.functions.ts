import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Json } from "@/integrations/supabase/types";

const SCHEME_BRIEF = "id, slug, name, short_name, ministry, category, level, state_code, benefit_headline, benefit_label, summary, deadline_note, apply_mode";

export const getAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [profile, saved, apps, payments] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase
        .from("saved_schemes")
        .select(`id, created_at, scheme:schemes(${SCHEME_BRIEF})`)
        .order("created_at", { ascending: false }),
      supabase
        .from("applications")
        .select(`*, scheme:schemes(${SCHEME_BRIEF})`)
        .order("updated_at", { ascending: false }),
      supabase
        .from("benefit_payments")
        .select("*, scheme:schemes(id, name, short_name, level, state_code)")
        .order("received_on", { ascending: false }),
    ]);
    for (const r of [profile, saved, apps, payments]) if (r.error) throw new Error(r.error.message);
    return {
      profile: profile.data,
      saved: saved.data ?? [],
      applications: apps.data ?? [],
      payments: payments.data ?? [],
    };
  });

export const getSavedIds = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("saved_schemes").select("scheme_id");
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => r.scheme_id);
  });

export const toggleSaved = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { schemeId: string }) => z.object({ schemeId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: existing } = await supabase
      .from("saved_schemes")
      .select("id")
      .eq("scheme_id", data.schemeId)
      .maybeSingle();
    if (existing) {
      const { error } = await supabase.from("saved_schemes").delete().eq("id", existing.id);
      if (error) throw new Error(error.message);
      return { saved: false };
    }
    const { error } = await supabase.from("saved_schemes").insert({ user_id: userId, scheme_id: data.schemeId });
    if (error) throw new Error(error.message);
    return { saved: true };
  });

const profileSchema = z.object({
  full_name: z.string().trim().max(100).optional(),
  state_code: z.string().trim().max(4).nullable().optional(),
  district: z.string().trim().max(80).nullable().optional(),
  quiz_answers: z.record(z.unknown()).nullable().optional(),
});

export const saveProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.input<typeof profileSchema>) => profileSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const patch: { user_id: string; full_name?: string; state_code?: string | null; district?: string | null; quiz_answers?: Json } = { user_id: userId };
    if (data.full_name !== undefined) patch.full_name = data.full_name;
    if (data.state_code !== undefined) patch.state_code = data.state_code;
    if (data.district !== undefined) patch.district = data.district;
    if (data.quiz_answers !== undefined) patch.quiz_answers = data.quiz_answers as Json;
    const { error } = await supabase.from("profiles").upsert(patch, { onConflict: "user_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const createAppSchema = z.object({
  schemeId: z.string().uuid(),
  reference_no: z.string().trim().max(60).optional(),
  applied_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  lodged_via: z.string().trim().max(120).optional(),
});

export const createApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.input<typeof createAppSchema>) => createAppSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("applications")
      .insert({
        user_id: userId,
        scheme_id: data.schemeId,
        reference_no: data.reference_no || null,
        applied_on: data.applied_on,
        lodged_via: data.lodged_via || null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

const updateAppSchema = z.object({
  id: z.string().uuid(),
  stage: z.number().int().min(1).max(5).optional(),
  status: z.enum(["in_progress", "action_needed", "approved", "rejected"]).optional(),
  note: z.string().trim().max(300).nullable().optional(),
});

export const updateApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.input<typeof updateAppSchema>) => updateAppSchema.parse(input))
  .handler(async ({ data, context }) => {
    const patch: { stage?: number; status?: string; note?: string | null } = {};
    if (data.stage !== undefined) patch.stage = data.stage;
    if (data.status !== undefined) patch.status = data.status;
    if (data.note !== undefined) patch.note = data.note;
    const { error } = await context.supabase.from("applications").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("applications").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const paymentSchema = z.object({
  scheme_id: z.string().uuid().nullable().optional(),
  title: z.string().trim().min(1).max(120),
  amount: z.number().int().positive().max(100_000_000),
  received_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  bank: z.string().trim().max(80).optional(),
  reference: z.string().trim().max(60).optional(),
});

export const addPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.input<typeof paymentSchema>) => paymentSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("benefit_payments").insert({
      user_id: context.userId,
      scheme_id: data.scheme_id ?? null,
      title: data.title,
      amount: data.amount,
      received_on: data.received_on,
      bank: data.bank || null,
      reference: data.reference || null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deletePayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("benefit_payments").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
