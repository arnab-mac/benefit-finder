import { describe, expect, it } from "vitest";
import { matchScheme, type SchemeCriteria } from "@/lib/eligibility";

const base: SchemeCriteria = {
  id: "x",
  level: "central",
  state_code: null,
  min_age: null,
  max_age: null,
  max_income: null,
  genders: [],
  occupations: [],
  land_statuses: [],
  housing_statuses: [],
  social_categories: [],
  areas: [],
  requires_flags: [],
  excludes_flags: [],
};

const pmKisan: SchemeCriteria = {
  ...base,
  min_age: 18,
  occupations: ["farmer"],
  land_statuses: ["small", "large"],
  excludes_flags: ["income_taxpayer", "govt_employee"],
};

describe("eligibility rules", () => {
  it("matches a landholding farmer for PM-KISAN", () => {
    const r = matchScheme(pmKisan, { age: 40, occupation: "farmer", land: "small", flags: [] });
    expect(r.eligible).toBe(true);
    expect(r.confidence).toBe(100);
  });

  it("excludes farmer families with an income taxpayer from PM-KISAN", () => {
    const r = matchScheme(pmKisan, { age: 40, occupation: "farmer", land: "small", flags: ["income_taxpayer"] });
    expect(r.eligible).toBe(false);
  });

  it("excludes landless farmers from PM-KISAN", () => {
    expect(matchScheme(pmKisan, { age: 40, occupation: "farmer", land: "none", flags: [] }).eligible).toBe(false);
  });

  it("Atal Pension Yojana is only for ages 18 to 40", () => {
    const apy = { ...base, min_age: 18, max_age: 40 };
    expect(matchScheme(apy, { age: 40 }).eligible).toBe(true);
    expect(matchScheme(apy, { age: 41 }).eligible).toBe(false);
    expect(matchScheme(apy, { age: 17 }).eligible).toBe(false);
  });

  it("post-matric SC scholarship income cap is ₹2.5 lakh", () => {
    const pms = { ...base, max_income: 250000, social_categories: ["sc"], occupations: ["student"] };
    expect(matchScheme(pms, { income: 250000, socialCategory: "sc", occupation: "student" }).eligible).toBe(true);
    expect(matchScheme(pms, { income: 250001, socialCategory: "sc", occupation: "student" }).eligible).toBe(false);
  });

  it("state schemes only match residents of that state", () => {
    const orunodoi = { ...base, level: "state", state_code: "AS" };
    expect(matchScheme(orunodoi, { state: "AS" }).eligible).toBe(true);
    expect(matchScheme(orunodoi, { state: "UP" }).eligible).toBe(false);
  });

  it("Stand-Up India accepts women or SC/ST applicants", () => {
    const sui = { ...base, requires_flags: ["women_or_sc_st"] };
    expect(matchScheme(sui, { gender: "female", socialCategory: "general" }).eligible).toBe(true);
    expect(matchScheme(sui, { gender: "male", socialCategory: "st" }).eligible).toBe(true);
    expect(matchScheme(sui, { gender: "male", socialCategory: "general" }).eligible).toBe(false);
  });

  it("unanswered questions lower confidence instead of failing", () => {
    const r = matchScheme(pmKisan, { occupation: "farmer" });
    expect(r.eligible).toBe(true);
    expect(r.confidence).toBe(33);
  });
});
