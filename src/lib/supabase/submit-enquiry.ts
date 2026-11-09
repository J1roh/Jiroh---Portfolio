export type EnquiryFields = { name: string; email: string; company: string; timeline: string; message: string; website: string };
export type SubmitResult = "sent" | "mail" | "rate" | "invalid" | "failed";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** True when the site has Supabase keys; without them the form hands over to the visitor's mail app. */
export const canStoreEnquiries = Boolean(url && key);

/** Sends the fields to the submit-enquiry edge function. "mail" means: no keys, use the mailto fallback. */
export async function submitEnquiry(fields: EnquiryFields): Promise<SubmitResult> {
  if (!url || !key) return "mail";
  // A client per send: enquiries are rare, and the rules forbid module-level singletons.
  const { createClient } = await import("@supabase/supabase-js"); // loaded on first send, not with the page
  const client = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await client.functions.invoke("submit-enquiry", { body: { fields } });
  if (!error) return "sent";
  const status = (error as { context?: Response }).context?.status;
  if (status === 429) return "rate";
  if (status === 400) return "invalid";
  return "failed";
}
