import type { EnquirePageContent } from "@content/index";
import type { EnquiryFields } from "../../lib/supabase/submit-enquiry";

export type Errors = Partial<Record<keyof EnquiryFields, string>>;

/** Same rule as the edge function's checks.ts: something@domain.tld, no spaces. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const REQUIRED = ["name", "email", "message"] as const;

/** Client-side checks that mirror the server's: required fields, lengths, email shape. */
export function validate(values: EnquiryFields, content: EnquirePageContent): Errors {
  const errors: Errors = {};
  for (const key of Object.keys(content.fields) as (keyof EnquirePageContent["fields"])[]) {
    const value = values[key].trim();
    const max = content.fields[key].max;
    if ((REQUIRED as readonly string[]).includes(key) && !value) errors[key] = content.errors.required;
    else if (value.length > max) errors[key] = content.errors.tooLong.replace("{max}", String(max));
  }
  if (!errors.email && !EMAIL.test(values.email.trim())) errors.email = content.errors.email;
  return errors;
}

/** The mail-app fallback: the same fields as a prefilled email. */
export function mailtoFor(values: EnquiryFields, to: string, subject: string): string {
  const body = [
    values.message.trim(), "",
    `${values.name.trim()} <${values.email.trim()}>`,
    values.company.trim(), values.timeline.trim(),
  ].filter((line, i) => i < 3 || line).join("\n");
  const s = subject.replace("{name}", values.name.trim());
  return `mailto:${to}?subject=${encodeURIComponent(s)}&body=${encodeURIComponent(body)}`;
}
