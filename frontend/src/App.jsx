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
import { TestCases } from "./components/TestCases";
import { Gaps } from "./components/Gaps";
import { ClarificationQuestions } from "./components/ClarificationQuestions";
import { Risks } from "./components/Risks";
import { TestData } from "./components/TestData";
import { NonFunctionalTests } from "./components/NonFunctionalTests";
import { CoverageMatrix } from "./components/CoverageMatrix";

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
    setOpenSection("testCases");
    setTimeout(() => {
      const el = document.getElementById(`testcase-${tcId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
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
              <TestCases
                testCases={result.testCases}
                expandedCases={expandedCases}
                onToggleCase={toggleCase}
              />
            )}

            {mode === "premium" && openSection === "gaps" && (
              <Gaps gaps={result.gaps} />
            )}

            {mode === "premium" && openSection === "clarificationQuestions" && (
              <ClarificationQuestions
                questions={result.clarificationQuestions}
              />
            )}

            {mode === "premium" && openSection === "risks" && (
              <Risks risks={result.risks} />
            )}

            {mode === "premium" && openSection === "testData" && (
              <TestData testData={result.testData} />
            )}

            {mode === "premium" && openSection === "nonFunctionalTests" && (
              <NonFunctionalTests
                nonFunctionalTests={result.nonFunctionalTests}
              />
            )}

            {mode === "premium" && openSection === "coverageMatrix" && (
              <CoverageMatrix
                coverageMatrix={result.coverageMatrix}
                onGoToTestCase={handleGoToTestCase}
              />
            )}
          </section>
        )}
      </AppShellContainer>
    </div>
  );
}

export default App;
