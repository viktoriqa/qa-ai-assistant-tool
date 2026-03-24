export function ReviewSummary({ summary }) {
  return (
    <aside className="executiveSide">
      <div className="qaHeader">
        <div className="qaTitleWithInfo">
          <span className="sectionEyebrow">{summary.summaryTitle}</span>

          <div className="infoTooltip">
            <span className="infoIcon">i</span>
            <div className="tooltipContent">
              This summary is based on requirement completeness, expected
              outcomes, boundary conditions, risk distribution, and integration
              complexity.
            </div>
          </div>
        </div>
      </div>

      <p className="executiveAssessment">{summary.insight}</p>
    </aside>
  );
}