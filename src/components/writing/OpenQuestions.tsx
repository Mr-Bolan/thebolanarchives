type OpenQuestionsProps = {
  questions?: string[];
};

export function OpenQuestions({ questions = [] }: OpenQuestionsProps) {
  if (questions.length === 0) {
    return null;
  }

  return (
    <section className="open-questions" aria-label="open questions">
      <ul>
        {questions.map((question) => (
          <li key={question}>{question}</li>
        ))}
      </ul>
    </section>
  );
}
