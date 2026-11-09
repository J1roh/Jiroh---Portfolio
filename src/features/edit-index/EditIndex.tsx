import type { EditsContent } from "@content/index";
import { SectionHead } from "../../components/section-head";
import "./edit-index.css";

/** The edited videos as an index: project, form and where to watch it. */
export function EditIndex({ content }: { content: EditsContent }) {
  return (
    <section id="video" className="section section--l edit-index" aria-labelledby="video-title">
      <div className="container">
        <SectionHead id="video-title" content={content} />
        <table className="edit-index__table">
          <thead>
            <tr>
              <th scope="col">{content.columns.title}</th>
              <th scope="col">{content.columns.form}</th>
              <th scope="col"><span className="visually-hidden">{content.watch}</span></th>
            </tr>
          </thead>
          <tbody>
            {content.rows.map((row) => (
              <tr key={row.title}>
                <th scope="row">{row.title}</th>
                <td>{row.form}</td>
                <td className="edit-index__action">
                  <a className="edit-index__link" href={row.href} target="_blank" rel="noopener">
                    {content.watch}<span className="visually-hidden">: {row.title}</span>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
