import type { EnquireField } from "@content/index";

type FieldProps = {
  name: string; field: EnquireField; value: string; onChange: (value: string) => void;
  error?: string; multiline: boolean; wide: boolean; required: boolean;
};

/** One labelled input or textarea; its error sits under it and is tied to it for screen readers. */
export function Field({ name, field, value, onChange, error, multiline, wide, required }: FieldProps) {
  const id = `enquiry-${name}`;
  const props = {
    id, name, value, required, placeholder: field.placeholder, maxLength: field.max,
    "aria-invalid": error ? true : undefined, "aria-describedby": error ? `${id}-error` : undefined,
    className: "enquiry-form__input",
  };
  return (
    <div className={`enquiry-form__field${wide ? " enquiry-form__field--wide" : ""}`}>
      <label htmlFor={id} className="enquiry-form__label">{field.label}</label>
      {multiline
        ? <textarea {...props} rows={6} onChange={(e) => onChange(e.target.value)} />
        : <input {...props} type={name === "email" ? "email" : "text"} autoComplete={name === "email" ? "email" : name === "name" ? "name" : name === "company" ? "organization" : "off"} onChange={(e) => onChange(e.target.value)} />}
      {error && <p id={`${id}-error`} className="enquiry-form__error">{error}</p>}
    </div>
  );
}
