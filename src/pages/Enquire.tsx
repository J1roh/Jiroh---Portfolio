import { contactContent, pagesContent } from "@content/index";
import { EnquiryForm } from "../features/enquiry-form";
import { PageMeta } from "../components/page-meta";
import "./enquire.css";

/** /enquire (Figma "Enquire · 1440"): the ask left, the form right. */
export function Enquire() {
  const t = pagesContent.enquire;
  return (
    <section className="container enquire" aria-labelledby="enquire-page-title">
      <PageMeta meta={pagesContent.meta.enquire} />
      <div className="enquire__text">
        <h1 id="enquire-page-title" className="enquire__title">{t.head}</h1>
        <p className="enquire__line">{t.line}</p>
        <p className="enquire__mail">{t.emailPrompt} <a href={`mailto:${contactContent.email}`}>{contactContent.email}</a></p>
      </div>
      <EnquiryForm content={t} email={contactContent.email} />
    </section>
  );
}
