<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules

- Scheme catalogue lives in the `schemes` table and is read through public server functions in `src/lib/schemes.functions.ts` (publishable key, anon SELECT policy) so pages can SSR and be shared.
- Eligibility matching is a pure function in `src/lib/eligibility.ts` (pass / fail / unknown per rule, derived flags for either-or rules); keep it UI-free and covered by `src/test/eligibility.test.ts`.
- Signed-in data (profiles, saved schemes, applications, benefit payments) goes only through `requireSupabaseAuth` server functions in `src/lib/account.functions.ts`; tables are owner-only via RLS.
- Signed-in pages live under `src/routes/_authenticated/`; public pages stay top-level.
- The site must state it is not an official government website and link users to official portals for applying.
