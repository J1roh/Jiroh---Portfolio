import type { PageMeta as Meta } from "@content/index";

/** The page's <title> and description; React 19 hoists both into <head>. */
export function PageMeta({ meta }: { meta: Meta }) {
  return (
    <>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
    </>
  );
}
