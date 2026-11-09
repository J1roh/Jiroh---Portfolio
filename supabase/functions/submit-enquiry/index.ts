// The only way enquiries get saved (the table has RLS on and no public policies): checks a contact-form submission,
// then stores it with the service role. Order: honeypot → field limits → email domain (not disposable, can receive
// mail) → at most 3 enquiries per email per 2 days → insert. Ported from Robert - Portfolio (no Turnstile here).
//
// Setup (see supabase/README.md):
//   npx supabase functions deploy submit-enquiry --project-ref <ref>
//   npx supabase secrets set --project-ref <ref> SITE_URL=https://jiroh.works
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided to every function automatically.
import { canReceiveMail, cleanFields, emailDomain, isDisposable } from './checks.ts'
import disposableList from './disposable.json' with { type: 'json' }

declare const Deno: { env: { get(name: string): string | undefined }; serve(handler: (req: Request) => Response | Promise<Response>): void }

const disposable = new Set<string>(disposableList as string[])
const PER_EMAIL = 3
const WINDOW_MS = 2 * 24 * 60 * 60 * 1000

// The site's own pages only: local dev, Vercel previews, and the live site (SITE_URL).
function allowedOrigin(origin: string | null) {
  if (!origin) return null
  const site = Deno.env.get('SITE_URL')
  const ok =
    /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin) ||
    /^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin) ||
    (!!site && origin === new URL(site).origin)
  return ok ? origin : null
}

Deno.serve(async (req) => {
  const origin = allowedOrigin(req.headers.get('origin'))
  const cors = {
    ...(origin ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {}),
    'Access-Control-Allow-Headers': 'authorization, apikey, x-client-info, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
  const reply = (status: number, body: Record<string, unknown>) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

  if (req.method === 'OPTIONS') return new Response(null, { status: origin ? 204 : 403, headers: cors })
  if (req.method !== 'POST' || !origin) return reply(403, { error: 'forbidden' })

  const body = (await req.json().catch(() => null)) as { fields?: Record<string, unknown> } | null
  // Honeypot: a hidden field only bots fill. Pretend success so they don't adapt.
  if (body?.fields?.website) return reply(200, { ok: true })

  const fields = cleanFields(body?.fields)
  if (!fields) return reply(400, { error: 'invalid' })

  const domain = emailDomain(fields.email)
  if (isDisposable(domain, disposable) || !(await canReceiveMail(domain, fetch))) return reply(400, { error: 'bad_email' })

  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const rest = `${Deno.env.get('SUPABASE_URL')}/rest/v1/enquiries`
  const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }

  const since = new Date(Date.now() - WINDOW_MS).toISOString()
  const recent = await fetch(`${rest}?select=id&email=eq.${encodeURIComponent(fields.email)}&created_at=gte.${since}`, {
    headers: { ...headers, Prefer: 'count=exact', Range: '0-0' },
  })
  const count = Number(recent.headers.get('content-range')?.split('/')[1] ?? 0)
  if (count >= PER_EMAIL) return reply(429, { error: 'rate' })

  const res = await fetch(rest, { method: 'POST', headers: { ...headers, Prefer: 'return=minimal' }, body: JSON.stringify(fields) })
  if (res.ok) return reply(200, { ok: true })
  console.error('insert failed', res.status, await res.text())
  return reply(500, { error: 'server' })
})
