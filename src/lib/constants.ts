export const STATES: { code: string; name: string }[] = [
  { code: "AN", name: "Andaman & Nicobar Islands" },
  { code: "AP", name: "Andhra Pradesh" },
  { code: "AR", name: "Arunachal Pradesh" },
  { code: "AS", name: "Assam" },
  { code: "BR", name: "Bihar" },
  { code: "CH", name: "Chandigarh" },
  { code: "CG", name: "Chhattisgarh" },
  { code: "DN", name: "Dadra & Nagar Haveli and Daman & Diu" },
  { code: "DL", name: "Delhi" },
  { code: "GA", name: "Goa" },
  { code: "GJ", name: "Gujarat" },
  { code: "HR", name: "Haryana" },
  { code: "HP", name: "Himachal Pradesh" },
  { code: "JK", name: "Jammu & Kashmir" },
  { code: "JH", name: "Jharkhand" },
  { code: "KA", name: "Karnataka" },
  { code: "KL", name: "Kerala" },
  { code: "LA", name: "Ladakh" },
  { code: "LD", name: "Lakshadweep" },
  { code: "MP", name: "Madhya Pradesh" },
  { code: "MH", name: "Maharashtra" },
  { code: "MN", name: "Manipur" },
  { code: "ML", name: "Meghalaya" },
  { code: "MZ", name: "Mizoram" },
  { code: "NL", name: "Nagaland" },
  { code: "OD", name: "Odisha" },
  { code: "PY", name: "Puducherry" },
  { code: "PB", name: "Punjab" },
  { code: "RJ", name: "Rajasthan" },
  { code: "SK", name: "Sikkim" },
  { code: "TN", name: "Tamil Nadu" },
  { code: "TS", name: "Telangana" },
  { code: "TR", name: "Tripura" },
  { code: "UP", name: "Uttar Pradesh" },
  { code: "UK", name: "Uttarakhand" },
  { code: "WB", name: "West Bengal" },
];

export const stateName = (code: string | null | undefined) =>
  STATES.find((s) => s.code === code)?.name ?? code ?? "";

export const CATEGORIES = [
  { id: "agriculture", label: "Agriculture & Farming", blurb: "Income support, crop insurance and farm credit" },
  { id: "health", label: "Healthcare & Wellness", blurb: "Free hospital treatment and health cover" },
  { id: "education", label: "Education & Skilling", blurb: "Scholarships, stipends and job training" },
  { id: "women", label: "Women & Child Welfare", blurb: "Maternity support, savings and monthly aid" },
  { id: "housing", label: "Housing & Shelter", blurb: "Grants to build or buy a pucca house" },
  { id: "business", label: "Business & Micro-Credit", blurb: "Collateral-free loans for small enterprises" },
  { id: "social_security", label: "Social Security & Pension", blurb: "Pensions, life and accident insurance" },
  { id: "employment", label: "Employment & Wages", blurb: "Guaranteed paid work for rural households" },
  { id: "energy", label: "Energy & Utilities", blurb: "Rooftop solar and clean cooking fuel" },
  { id: "food", label: "Food Security", blurb: "Free monthly ration through PDS shops" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];
export const categoryLabel = (id: string) => CATEGORIES.find((c) => c.id === id)?.label ?? id;

export const LEVELS = [
  { id: "central", label: "Central Government" },
  { id: "state", label: "State Government" },
  { id: "centrally_sponsored", label: "Centrally Sponsored" },
] as const;

export const BENEFIT_TYPES = [
  { id: "dbt", label: "Direct Cash Benefit (DBT)" },
  { id: "loan", label: "Loan / Credit" },
  { id: "subsidy", label: "Subsidy" },
  { id: "tuition", label: "Tuition & Fee Waiver" },
  { id: "in_kind", label: "Free Goods / Ration" },
  { id: "insurance", label: "Health & Life Insurance" },
  { id: "pension", label: "Pension" },
  { id: "training", label: "Skill Training" },
] as const;

export const OCCUPATIONS = [
  { id: "farmer", label: "Farmer / Cultivator", hint: "Smallholder, tenant, allied agriculture" },
  { id: "daily_wage", label: "Daily Wage / Unorganised", hint: "Construction, labour, domestic work" },
  { id: "self_employed", label: "Self-Employed / Vendor", hint: "Shop, small business, trade" },
  { id: "salaried", label: "Salaried (Govt / Private)", hint: "Formal contract employment" },
  { id: "student", label: "Student", hint: "School, college or skill course" },
  { id: "unemployed", label: "Job Seeker", hint: "Looking for work or training" },
  { id: "homemaker", label: "Homemaker", hint: "Managing the household" },
  { id: "senior", label: "Senior Citizen / Retired", hint: "Pensions and old-age support" },
] as const;

export const LAND_OPTIONS = [
  { id: "small", label: "Own farm land (up to 2 hectares / 5 acres)" },
  { id: "large", label: "Own farm land (more than 2 hectares)" },
  { id: "none", label: "No farm land" },
] as const;

export const HOUSING_OPTIONS = [
  { id: "pucca", label: "Own a pucca (brick / concrete) house" },
  { id: "kutcha", label: "Live in a kutcha / thatched / damaged house" },
  { id: "rented", label: "Live in a rented house" },
  { id: "homeless", label: "No house of my own" },
] as const;

export const SOCIAL_CATEGORIES = [
  { id: "general", label: "General" },
  { id: "obc", label: "OBC" },
  { id: "sc", label: "SC" },
  { id: "st", label: "ST" },
  { id: "ews", label: "EWS" },
] as const;

export const SPECIAL_FLAGS = [
  { id: "bpl", label: "BPL / NFSA ration card holder", hint: "Priority or Antyodaya ration card" },
  { id: "pwd", label: "Person with disability (40%+)", hint: "UDID card or disability certificate" },
  { id: "widow", label: "Widow / single woman", hint: "Widow, divorced or abandoned" },
  { id: "girl_child", label: "Have a daughter under 10", hint: "Savings and daughter-support schemes" },
  { id: "expecting_mother", label: "Pregnant or new mother", hint: "Maternity benefits" },
  { id: "shg_member", label: "Member of a self-help group", hint: "SHG under NRLM" },
  { id: "street_vendor", label: "Street vendor", hint: "Hawker, cart or roadside stall" },
  { id: "artisan", label: "Traditional artisan / craftsperson", hint: "Carpenter, potter, tailor, smith…" },
  { id: "no_lpg", label: "No LPG gas connection at home", hint: "Clean cooking fuel schemes" },
  { id: "income_taxpayer", label: "Someone in family pays income tax", hint: "Some schemes exclude taxpayers" },
  { id: "govt_employee", label: "Someone in family has a government job", hint: "Some schemes exclude them" },
] as const;

export const APPLICATION_STAGES = [
  "Submitted",
  "Document verification",
  "Approval",
  "Payment setup",
  "Benefit received",
] as const;

export const APPLICATION_STATUSES = [
  { id: "in_progress", label: "In progress" },
  { id: "action_needed", label: "Action needed" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
] as const;

export const formatINR = (n: number) =>
  "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

export const formatINRShort = (n: number) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(n % 10000000 === 0 ? 0 : 1)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`;
  return formatINR(n);
};
