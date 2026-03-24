import { useMemo, useState } from "react";
import api from "./api";
import "./App.css";
import { HeroHeader } from "./components/HeroHeader";
import { FieldCard } from "./components/FieldCard";
import { AppShellContainer } from "./components/AppShellContainer";
import { Loader } from "./components/Loader";
import { SectionTabs } from "./components/SectionTabs";
import { ReqTextArea } from "./components/ReqTextArea";
import { ActionButton } from "./components/ActionButton";
import { FeatureAnalysis } from "./components/FeatureAnalysis";
import { ReviewSummary } from "./components/ReviewSummary";
import { AttentionPoints } from "./components/AttentionPoints";

function App() {
  const [requirement, setRequirement] = useState("");
  const [mode, setMode] = useState("basic");
  const [requirementType, setRequirementType] = useState("web");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [expandedCases, setExpandedCases] = useState({});
  const [openSection, setOpenSection] = useState("testCases");

  const toggleSection = (sectionName) => {
    setOpenSection((prev) => (prev === sectionName ? null : sectionName));
  };

  const toggleCase = (index) => {
    setExpandedCases((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleGeneratePreview = async () => {
    if (!requirement.trim()) {
      setError("Requirement is required.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const endpoint =
        mode === "basic" ? "/generate-basic" : "/generate-premium";

      const response = await api.post(endpoint, {
        requirement,
        requirementType,
      });

      setResult(response.data);
      setExpandedCases({});
      setOpenSection("testCases");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.details ||
          err.response?.data?.error ||
          "Failed to generate preview.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = async () => {
    if (!requirement.trim()) {
      setError("Requirement is required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.post(
        "/generate-excel",
        {
          requirement,
          mode,
          requirementType,
          artifacts: result,
        },
        {
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "qa-test-artifacts.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.details ||
          err.response?.data?.error ||
          "Failed to download Excel.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoToTestCase = (tcId) => {
    // switch tab
    setOpenSection("testCases");

    // wait for render, then scroll
    setTimeout(() => {
      const el = document.getElementById(`testcase-${tcId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });

        // optional highlight
        el.classList.add("highlighted");
        setTimeout(() => el.classList.remove("highlighted"), 1500);
      }
    }, 100);
  };

  const summary = useMemo(() => {
    if (!result) return null;

    const requirementText = requirement.trim();

    const testCasesCount = result.testCases?.length || 0;
    const gapsCount = result.gaps?.length || 0;
    const questionsCount = result.clarificationQuestions?.length || 0;
    const risks = result.risks || [];
    const risksCount = risks.length;
    const testDataCount = result.testData?.length || 0;
    const nonFunctionalCount = result.nonFunctionalTests?.length || 0;

    const highRiskCount = risks.filter(
      (risk) => risk.impact?.toLowerCase() === "high",
    ).length;

    const mediumRiskCount = risks.filter(
      (risk) => risk.impact?.toLowerCase() === "medium",
    ).length;

    const lowRiskCount = risks.filter(
      (risk) => risk.impact?.toLowerCase() === "low",
    ).length;

    const hasExpectedResult =
      /should|then|must|displays?|returns?|shows?|allows?|prevents?/i.test(
        requirementText,
      );

    const hasBoundary =
      /max|min|limit|range|greater|less|between|at least|no more than/i.test(
        requirementText,
      );

    const isVeryShort = requirementText.length < 100;

    const hasIntegrationDependency =
      /email|payment|api|sync|role|permission|offline|background|queue|webhook|third-party|external/i.test(
        requirementText.toLowerCase(),
      );

    const highRisksDominate =
      (highRiskCount > 0 && highRiskCount > mediumRiskCount) ||
      highRiskCount == mediumRiskCount;

    const warnings = [];

    if (isVeryShort) {
      warnings.push(
        "Requirement may be incomplete due to limited input detail.",
      );
    }

    if (!hasExpectedResult) {
      warnings.push("Expected outcomes are not clearly defined.");
    }

    if (!hasBoundary) {
      warnings.push("Boundary conditions or limits are not clearly described.");
    }

    if (highRisksDominate || highRiskCount >= 3) {
      warnings.push(
        "Risk exposure is elevated and high-impact risks should be reviewed carefully.",
      );
    }

    if (hasIntegrationDependency) {
      warnings.push(
        "The feature depends on integration behavior that should be validated carefully.",
      );
    }

    let summaryTitle = "Review Summary";
    let tone = "positive";
    let insight =
      "Requirement appears comprehensive, with sufficient detail to support QA review and test preparation.";

    if (warnings.length >= 3) {
      tone = "warning";
      insight =
        "The requirement is testable at a high level, but several areas need closer review.";
    } else if (warnings.length >= 1) {
      tone = "neutral";
      insight =
        "The requirement is workable for QA review, with some areas needing refinement.";
    }

    return {
      summaryTitle,
      tone,
      insight,
      warnings,
      testCasesCount,
      gapsCount,
      questionsCount,
      risksCount,
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
      testDataCount,
      nonFunctionalCount,
    };
  }, [result, requirement]);

  return (
    <div className="page">
      <AppShellContainer>
        {loading && <Loader />}

        <HeroHeader />

        <section className="panel">
          <ReqTextArea
            value={requirement}
            onChange={(e) => setRequirement(e.target.value)}
          />

          <div className="controlsGrid">
            <FieldCard
              title="Mode"
              value={mode}
              onChange={(value) => {
                setMode(value);
                setResult(null);
                setExpandedCases({});
                setOpenSection("testCases");
                setError("");
              }}
              options={[
                { value: "basic", label: "Basic" },
                { value: "premium", label: "Premium" },
              ]}
              description="Basic = test cases only. Premium = full QA analysis."
            />

            <FieldCard
              title="Requirement Type"
              value={requirementType}
              onChange={(value) => {
                setRequirementType(value);
                setResult(null);
                setExpandedCases({});
                setOpenSection("testCases");
                setError("");
              }}
              options={[
                { value: "web", label: "Web UI" },
                { value: "api", label: "API" },
                { value: "mobile", label: "Mobile" },
                { value: "admin", label: "Admin / Back-office" },
              ]}
              description="Tailors the output to the selected product area."
            />
          </div>

          <ActionButton
            loading={loading}
            onGeneratePreview={handleGeneratePreview}
            onDownloadExcel={handleDownloadExcel}
          />
          
          {error && <div className="errorBox">{error}</div>}
        </section>

        {result && summary && (
          <section className="resultsSection">
            <div
              className={
                mode === "premium"
                  ? "executiveSummary executiveSummaryPremium"
                  : "executiveSummary executiveSummaryBasic"
              }
            >
              <FeatureAnalysis mode={mode} result={result} summary={summary} />
              {mode === "premium" && <ReviewSummary summary={summary} />}
            </div>

            {mode === "premium" && summary?.warnings?.length > 0 && (
              <AttentionPoints points={summary.warnings} />
            )}

            <SectionTabs
              mode={mode}
              openSection={openSection}
              onToggleSection={toggleSection}
            />

            {openSection === "testCases" && (
              <div className="panel sectionPanel sectionAccentCyan">
                <div className="panelHeader">
                  <div>
                    <h2>Test Cases</h2>
                    <span>
                      AI-generated draft cases for QA review. Click a test case
                      to view details.
                    </span>
                  </div>
                </div>

                {result.testCases?.length ? (
                  result.testCases.map((tc, index) => {
                    const isExpanded = expandedCases[index] ?? false;

                    return (
                      <div
                        id={`testcase-TC-${index + 1}`}
                        key={index}
                        className={`testCaseCard ${isExpanded ? "expanded" : "collapsed"}`}
                        onClick={() => toggleCase(index)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toggleCase(index);
                          }
                        }}
                      >
                        <div className="testCaseTop">
                          <div className="testCaseMetaRow">
                            <span className="caseIndex">TC-{index + 1}</span>

                            <div className="pillRow">
                              <span className="pill pillType">
                                {tc.type || "—"}
                              </span>
                              <span className="pill pillPriority">
                                Priority: {tc.priority || "—"}
                              </span>
                              <span className="pill pillSeverity">
                                Severity: {tc.severity || "—"}
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
                              <p>{tc.expectedResult || "—"}</p>
                            </div>

                            <div className="contentBlock">
                              <span className="miniLabel">Regression</span>
                              <p>
                                Candidate:{" "}
                                {tc.regressionCandidate === true ? "Yes" : "No"}
                              </p>
                              <p>
                                {tc.regressionReason || "No reason provided."}
                              </p>
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
            )}

            {mode === "premium" && openSection === "gaps" && (
              <div className="panel sectionPanel sectionAccentOrange">
                <div className="panelHeader">
                  <div>
                    <h2>Gaps</h2>
                    <span>Missing or ambiguous requirement details</span>
                  </div>
                </div>

                {result.gaps?.length ? (
                  <ul className="cleanList">
                    {result.gaps.map((gap, index) => (
                      <li key={index}>{gap}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="emptyState">No gaps found.</p>
                )}
              </div>
            )}

            {mode === "premium" && openSection === "clarificationQuestions" && (
              <div className="panel sectionPanel sectionAccentViolet">
                <div className="panelHeader">
                  <div>
                    <h2>Clarification Questions</h2>
                    <span>Questions to resolve before testing</span>
                  </div>
                </div>

                {result.clarificationQuestions?.length ? (
                  <ul className="cleanList">
                    {result.clarificationQuestions.map((question, index) => (
                      <li key={index}>{question}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="emptyState">No clarification questions.</p>
                )}
              </div>
            )}

            {mode === "premium" && openSection === "risks" && (
              <div className="panel sectionPanel sectionAccentRed">
                <div className="panelHeader">
                  <div>
                    <h2>Risks</h2>
                    <span>Potential issues impacting quality or delivery</span>
                  </div>
                </div>

                {result.risks?.length ? (
                  <div className="riskReviewList">
                    {result.risks.map((risk, index) => (
                      <div key={index} className="riskCard">
                        <div className="riskCardHeader">
                          <span
                            className={`riskLevel riskLevel-${risk.impact?.toLowerCase() || "default"}`}
                          >
                            {risk.impact || "Info"}
                          </span>

                          <h3 className="riskTitle">{risk.title}</h3>
                        </div>

                        <p className="riskDescription">{risk.description}</p>

                        {risk.suggestion && (
                          <div className="riskRecommendation">
                            <span className="riskRecommendationLabel">
                              Recommendation
                            </span>
                            <p>{risk.suggestion}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="emptyState">No risks identified.</p>
                )}
              </div>
            )}

            {mode === "premium" && openSection === "testData" && (
              <div className="panel sectionPanel sectionAccentBlue">
                <div className="panelHeader">
                  <div>
                    <h2>Test Data</h2>
                    <span>Suggested valid and invalid sample values</span>
                  </div>
                </div>

                {result.testData?.length ? (
                  <div className="dataSpecList">
                    {result.testData.map((item, index) => (
                      <div key={index} className="dataSpecCard">
                        <div className="dataSpecHeader">
                          <h3>{item.field}</h3>
                        </div>

                        <div className="dataSpecGrid">
                          <div className="dataSpecColumn">
                            <div className="dataSpecColumnHeader">
                              <span className="dataSpecBadge valid">Valid</span>
                            </div>

                            {item.validValues?.length ? (
                              <div className="dataSpecValues">
                                {item.validValues.map((value, i) => (
                                  <div key={i} className="dataSpecValueRow">
                                    <code>{String(value)}</code>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="emptyMini">No valid values</p>
                            )}
                          </div>

                          <div className="dataSpecColumn">
                            <div className="dataSpecColumnHeader">
                              <span className="dataSpecBadge invalid">
                                Invalid
                              </span>
                            </div>

                            {item.invalidValues?.length ? (
                              <div className="dataSpecValues">
                                {item.invalidValues.map((value, i) => (
                                  <div key={i} className="dataSpecValueRow">
                                    <code>{String(value)}</code>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="emptyMini">No invalid values</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="emptyState">No test data generated.</p>
                )}
              </div>
            )}

            {mode === "premium" && openSection === "nonFunctionalTests" && (
              <div className="panel sectionPanel sectionAccentPurple">
                <div className="panelHeader">
                  <div>
                    <h2>Non-Functional Tests</h2>
                    <span>
                      Performance, security, usability, accessibility, and
                      reliability checks
                    </span>
                  </div>
                </div>

                {result.nonFunctionalTests?.length ? (
                  <div className="nfrList">
                    {result.nonFunctionalTests.map((item, index) => (
                      <div key={index} className="nfrItem">
                        <div className="nfrHeader">
                          <span
                            className={`nfrBadge nfrBadge-${(
                              item.category || "general"
                            )
                              .toLowerCase()
                              .replace(/\s+/g, "-")}`}
                          >
                            {item.category || "General"}
                          </span>
                        </div>

                        <p className="nfrScenario">{item.scenario}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="emptyState">
                    No non-functional tests generated.
                  </p>
                )}
              </div>
            )}

            {mode === "premium" && openSection === "coverageMatrix" && (
              <div className="panel sectionPanel sectionAccentGreen">
                <div className="panelHeader">
                  <div>
                    <h2>Coverage Matrix</h2>
                    <span>
                      Traceability between requirement areas and test cases
                    </span>
                  </div>
                </div>

                {result.coverageMatrix?.length ? (
                  <div className="coverageTableWrapper">
                    <table className="coverageTable">
                      <thead>
                        <tr>
                          <th>Requirement Area</th>
                          <th>Covered By</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.coverageMatrix.map((row, index) => (
                          <tr key={index}>
                            <td>{row.requirementArea}</td>
                            <td>
                              <div className="coverageChips">
                                {row.coveredBy?.length ? (
                                  row.coveredBy.map((item, chipIndex) => (
                                    <span
                                      key={chipIndex}
                                      className="coverageChip clickable"
                                      onClick={() => handleGoToTestCase(item)}
                                    >
                                      {item}
                                    </span>
                                  ))
                                ) : (
                                  <span className="coverageEmpty">
                                    Not mapped
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="emptyState">No coverage matrix available.</p>
                )}
              </div>
            )}
          </section>
        )}
      </AppShellContainer>
    </div>
  );
}

export default App;
