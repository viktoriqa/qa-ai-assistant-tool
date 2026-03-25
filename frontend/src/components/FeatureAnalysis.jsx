export function FeatureAnalysis({ mode, result, summary }) {
  const premiumMetaItems = [
    { value: summary.gapsCount, label: "gaps" },
    { value: summary.questionsCount, label: "questions" },
    { value: summary.risksCount, label: "risks" },
    { value: summary.testDataCount, label: "test data sets" },
    { value: summary.nonFunctionalCount, label: "non-functional checks" },
  ];

  return (
    <div
      className={`executiveMain ${mode === "basic" ? "centered" : "executiveMainPremium"}`}
    >
      <div className="executiveHeader">
        <div className="executiveHeaderMain">
          <div className="sectionEyebrow">Feature Analysis</div>

          <h2 className="executiveTitle">
            {result.feature || "Untitled Feature"}
          </h2>

          <p className="executiveDescription">
            {mode === "premium"
              ? "Premium QA review with identified gaps, risks, and other supporting artifacts."
              : "Basic QA review focused on executable test case generation."}
          </p>
        </div>
      </div>

      <div className="executiveMetaRow">
        <span>
          <strong>{summary.testCasesCount}</strong> test cases
        </span>

        {mode === "premium" && (
          <>
            {premiumMetaItems.map((item) => (
              <span key={item.label}>
                <strong>{item.value}</strong> {item.label}
              </span>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
