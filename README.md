# SchemeSaathi — Welfare Scheme Finder

A web app that helps citizens discover Indian government welfare schemes and see which ones fit their circumstances.

## Features
- **Find Schemes** — search and filter 33 Central and State schemes by sector, governing body, benefit type, income and social category.
- **Eligibility quiz** — 4-step questionnaire with a live rules engine that matches answers against each scheme's published criteria.
- **Scheme details** — benefits, eligibility & exclusions, document checklist, step-by-step application, FAQs, helplines and official links.
- **Accounts** — email/password, Google and Lovable sign-in; save schemes, store quiz answers, track applications through 5 stages and log benefit payments.

## Tech stack
- TanStack Start (React 19, file-based routing, server functions), Vite, Tailwind CSS v4, shadcn/ui
- Lovable Cloud (Postgres + Auth) with row-level security
- Vitest for the eligibility rule tests

## Project structure
```
src/routes/                 pages (index, categories, eligibility, schemes.$slug, auth, _authenticated/*)
src/lib/eligibility.ts      matching rules engine
src/lib/schemes.functions.ts  public catalogue server functions
src/lib/account.functions.ts  signed-in server functions
src/components/site/        header, footer, scheme card, dialogs
drizzle/migrations/         database schema + scheme seed data
```

## Running locally
```bash
bun install
cp .env.example .env   # add your backend URL and publishable key
bun run dev
bun run test
```

> SchemeSaathi is an independent guide, not an official government website. Always confirm details on the official scheme portal.
