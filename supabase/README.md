# Supabase setup (enquiry form)

The site works without this: with no keys, the form opens the visitor's mail app instead. To store enquiries:

1. Create a project at https://supabase.com (free plan is fine). Note its **project ref** and the **anon key** (Settings → API).
2. Run the migration: open SQL Editor, paste `supabase/migrations/0001_enquiries.sql`, run it.
3. Deploy the function (needs the Supabase CLI, `npx supabase login` once):
   ```
   npx supabase functions deploy submit-enquiry --project-ref <ref>
   npx supabase secrets set --project-ref <ref> SITE_URL=https://jiroh.works
   ```
4. Add the keys to the host (Vercel → Project → Settings → Environment Variables) and to a local `.env`:
   ```
   VITE_SUPABASE_URL=https://<ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon key>
   ```
5. Redeploy the site. Read enquiries in Table Editor → `enquiries` (a CMS inbox comes with v1.1).

Checks the function runs: honeypot, field lengths, disposable or dead email domains, at most 3 enquiries per email per 2 days.
`checks.ts`, `checks.test.ts` and `disposable.json` come from Robert - Portfolio; refresh `disposable.json` from
github.com/disposable-email-domains/disposable-email-domains now and then.
