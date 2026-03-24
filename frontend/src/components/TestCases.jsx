export function TestCases({ testCases, expandedCases, onToggleCase }) {
  return (
    <div className="panel sectionPanel sectionAccentCyan">
      <div className="panelHeader">
        <div>
          <h2>Test Cases</h2>
          <span>
            AI-generated draft cases for QA review. Click a test case to view
            details.
          </span>
        </div>
      </div>

      {testCases?.length ? (
        testCases.map((tc, index) => {
          const isExpanded = expandedCases[index] ?? false;

          return (
            <div
              id={`testcase-TC-${index + 1}`}
              key={index}
              className={`testCaseCard ${isExpanded ? "expanded" : "collapsed"}`}
              onClick={() => onToggleCase(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onToggleCase(index);
                }
              }}
            >
              <div className="testCaseTop">
                <div className="testCaseMetaRow">
                  <span className="caseIndex">TC-{index + 1}</span>

                  <div className="pillRow">
                    <span className="pill pillType">{tc.type || "-"}</span>
                    <span className="pill pillPriority">
                      Priority: {tc.priority || "-"}
                    </span>
                    <span className="pill pillSeverity">
                      Severity: {tc.severity || "-"}
                    </span>
                  </div>
                </div>

                <div className="testCaseTitleRow">
                  <h3 className="testCaseTitle">{tc.title}</h3>
                </div>
              </div>

              {isExpanded && (
                <div
                  className="testCaseBody"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="contentBlock">
                    <span className="miniLabel">Preconditions</span>
                    {tc.preconditions?.length ? (
                      <ul>
                        {tc.preconditions.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>None</p>
                    )}
                  </div>

                  <div className="contentBlock">
                    <span className="miniLabel">Steps</span>
                    {tc.steps?.length ? (
                      <ol>
                        {tc.steps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    ) : (
                      <p>None</p>
                    )}
                  </div>

                  <div className="contentBlock">
                    <span className="miniLabel">Expected Result</span>
                    <p>{tc.expectedResult || "-"}</p>
                  </div>

                  <div className="contentBlock">
                    <span className="miniLabel">Regression</span>
                    <p>
                      Candidate:{" "}
                      {tc.regressionCandidate === true ? "Yes" : "No"}
                    </p>
                    <p>{tc.regressionReason || "No reason provided."}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })
      ) : (
        <p className="emptyState">No test cases generated.</p>
      )}
    </div>
  );
}
