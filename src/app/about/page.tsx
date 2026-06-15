export const dynamic = "force-static";

export const metadata = {
  title: "about / thebolanarchives",
  description: "How to read the anonymous archive and its status and confidence labels.",
};

export default function AboutPage() {
  return (
    <article className="content-page about-page">
      <header className="page-header">
        <p className="kicker">archive note</p>
        <h1>about</h1>
        <p className="lede">
          thebolanarchives is an anonymous archive of systems, prototypes, field notes, fragments,
          and things understood later.
        </p>
      </header>

      <div className="mdx-body">
        <h2>what this is</h2>
        <p>
          This is a public record of private work: tools being built, machines being observed,
          assumptions being tested, and ideas kept before they become polished.
        </p>

        <h2>what this is not</h2>
        <p>
          It is not a portfolio, launch page, personal brand, startup funnel, or proof that every
          note is finished. Rough edges are part of the record when they carry useful evidence.
        </p>

        <h2>why anonymous</h2>
        <p>
          The archive keeps the work in the foreground. Names, clients, operators, and identifying
          context are removed or blurred so the records can focus on systems and lessons rather
          than personal exposure.
        </p>

        <h2>status labels</h2>
        <p>
          Status describes maturity: fragment, sketch, working_note, field_tested,
          stable_artefact, or retired. It is a label for how formed the work is, not how valuable
          it is.
        </p>

        <h2>confidence labels</h2>
        <p>
          Confidence describes claim strength: low, partial, medium, high, or field_confirmed.
          Uncertainty is kept visible because the archive is more useful when it does not pretend
          every record is final.
        </p>
      </div>
    </article>
  );
}
