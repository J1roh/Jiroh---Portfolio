import { useState, type FormEvent } from "react";
import type { EnquirePageContent } from "@content/index";
import { submitEnquiry, type EnquiryFields } from "../../lib/supabase/submit-enquiry";
import { Field } from "./Field";
import { mailtoFor, validate, type Errors } from "./validate";
import "./enquiry-form.css";

type Status = "idle" | "sending" | "sent" | "mail" | "error";
const EMPTY: EnquiryFields = { name: "", email: "", company: "", timeline: "", message: "", website: "" };

/**
 * The enquiry form (inputs after Robert - Portfolio; design is Figma "Enquire · 1440"): name, email, optional company
 * and timeline, free-text project. Validates inline, sends through Supabase, or hands over to the mail app.
 */
export function EnquiryForm({ content, email }: { content: EnquirePageContent; email: string }) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [failure, setFailure] = useState("");
  const set = (key: keyof EnquiryFields) => (value: string) => setValues((v) => ({ ...v, [key]: value }));

  const send = async (event: FormEvent) => {
    event.preventDefault();
    const found = validate(values, content);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const form = event.currentTarget as HTMLFormElement;
      requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    setStatus("sending");
    const result = await submitEnquiry(values);
    if (result === "sent") return setStatus("sent");
    if (result === "mail") { window.location.href = mailtoFor(values, email, content.mailSubject); return setStatus("mail"); }
    setFailure(result === "rate" ? content.errors.rate : content.errors.failed);
    setStatus("error");
  };

  if (status === "sent" || status === "mail") {
    return (
      <div className="enquiry-form enquiry-form--done" role="status">
        <h2 className="enquiry-form__done-title">{content.sent.head}</h2>
        <p>{status === "mail" ? content.mailNote : content.sent.line}</p>
      </div>
    );
  }

  const field = (key: Exclude<keyof EnquiryFields, "website">, multiline = false, wide = false) => (
    <Field
      name={key} field={content.fields[key]} value={values[key]} onChange={set(key)}
      error={errors[key]} multiline={multiline} wide={wide} required={key === "name" || key === "email" || key === "message"}
    />
  );

  return (
    <form className="enquiry-form" onSubmit={send} noValidate>
      {field("name")}{field("email")}
      {field("company", false, true)}{field("timeline", false, true)}
      {field("message", true, true)}
      <label className="enquiry-form__trap" aria-hidden="true">
        {content.honeypot}
        <input tabIndex={-1} autoComplete="off" value={values.website} onChange={(e) => set("website")(e.target.value)} />
      </label>
      <div className="enquiry-form__foot">
        <p className="enquiry-form__reply">{content.reply}</p>
        <button type="submit" className="button button--solid button--arrow" disabled={status === "sending"}>
          <span className="button__label">{status === "sending" ? content.sending : content.submit}</span>
          <span className="button__chip" aria-hidden="true">↗</span>
        </button>
      </div>
      {status === "error" && <p className="enquiry-form__failure" role="alert">{failure}</p>}
      <p className="enquiry-form__privacy">{content.privacy}</p>
    </form>
  );
}
