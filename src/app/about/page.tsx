export const dynamic = "force-static";

export const metadata = {
  title: "about / thebolanarchives",
  description:
    "Why the anonymous archive exists: a record of systems, AI-assisted work, and unfinished evidence.",
};

export default function AboutPage() {
  return (
    <article className="content-page about-page">
      <header className="page-header">
        <p className="kicker">archive note</p>
        <h1>about</h1>
        <p className="lede">
          thebolanarchives is an anonymous archive of systems, prototypes, field notes, fragments,
          and the working practice that grew around AI-assisted tools.
        </p>
      </header>

      <div className="mdx-body">
        <h2>what this is</h2>
        <p>
          This is a public record of private work: tools being built, machines being observed,
          assumptions being tested, and ideas kept before they become polished. Some records are
          finished enough to use. Some are only evidence that a problem existed and was worth
          following.
        </p>

        <h2>why it exists</h2>
        <p>
          When the first useful LLMs stopped feeling like demos and started feeling like working
          material, the question changed. It was no longer whether AI was impressive. It was whether
          I could make it part of daily work before everyone around me had a settled language for
          what was happening.
        </p>
        <p>
          So I started routing ordinary work through automation: notes, reports, decisions,
          messages, small tools, broken scripts, and all the boring glue between an idea and a thing
          that actually helps. The useful part was not magic. It was practice, taste, verification,
          and learning where the machine was confidently wrong.
        </p>

        <h2>what changed</h2>
        <p>
          A conventional work path was narrowing at the same time. The lesson was plain enough: if
          the work mattered, it needed to survive outside the system that happened to contain it.
          The archive is the trail left by that shift, kept as systems and lessons rather than as a
          personal chronology.
        </p>

        <h2>what this is not</h2>
        <p>
          It is not a portfolio, launch page, personal brand, startup funnel, or proof that every
          note is finished. Rough edges are part of the record when they carry useful evidence.
        </p>

        <h2>why anonymous</h2>
        <p>
          The archive keeps the work in the foreground. Names, clients, operators, and identifying
          context are removed or blurred. The useful thing is the system under observation, not the
          private biography around it.
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
