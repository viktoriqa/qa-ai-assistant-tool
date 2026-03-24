export function ClarificationQuestions({ questions }) {
  return (
    <div className="panel sectionPanel sectionAccentViolet">
      <div className="panelHeader">
        <div>
          <h2>Clarification Questions</h2>
          <span>Questions to resolve before testing</span>
        </div>
      </div>

      {questions?.length ? (
        <ul className="cleanList">
          {questions.map((question, index) => (
            <li key={index}>{question}</li>
          ))}
        </ul>
      ) : (
        <p className="emptyState">No clarification questions.</p>
      )}
    </div>
  );
}
