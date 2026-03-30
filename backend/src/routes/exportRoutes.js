import express from "express";
import ExcelJS from "exceljs";
import { generateTestArtifacts } from "../services/aiService.js";

const router = express.Router();

function styleHeader(row) {
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };

    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4F81BD" },
    };

    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };

    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });
}

function styleCell(cell) {
  cell.alignment = { vertical: "top", wrapText: true };

  cell.border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };

  cell.fill = undefined;
}

function autoWidth(worksheet) {
  worksheet.columns.forEach((column) => {
    let maxLength = 10;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const value = cell.value ? cell.value.toString() : "";
      maxLength = Math.max(maxLength, value.length);
    });
    column.width = Math.min(maxLength + 2, 50);
  });
}

function addTestCasesSheet(workbook, testCases) {
  const tcSheet = workbook.addWorksheet("Test Cases");

  const tcHeaders = [
    "ID",
    "Title",
    "Preconditions",
    "Steps",
    "Expected Result",
    "Priority",
    "Severity",
    "Type",
    "Regression Candidate",
    "Regression Reason",
  ];

  tcSheet.addRow(tcHeaders);
  styleHeader(tcSheet.getRow(1));

  testCases.forEach((tc, index) => {
    const stepsText = (tc.steps || [])
      .map((s, i) => `${i + 1}. ${s}`)
      .join("\n");
    const preconditionsText = (tc.preconditions || [])
      .map((p, i) => `${i + 1}. ${p}`)
      .join("\n");

    const row = tcSheet.addRow([
      index + 1,
      tc.title || "",
      preconditionsText,
      stepsText,
      tc.expectedResult || "",
      tc.priority || "",
      tc.severity || "",
      tc.type || "",
      typeof tc.regressionCandidate === "boolean"
        ? tc.regressionCandidate
          ? "Yes"
          : "No"
        : "",
      tc.regressionReason || "",
    ]);

    row.eachCell((cell) => styleCell(cell));
  });

  autoWidth(tcSheet);
}

function addGapsSheet(workbook, gaps) {
  const gapsSheet = workbook.addWorksheet("Gaps");

  gapsSheet.addRow(["ID", "Gaps"]);
  styleHeader(gapsSheet.getRow(1));

  if (gaps.length === 0) {
    const row = gapsSheet.addRow(["", "No gaps found"]);
    row.eachCell(styleCell);
  } else {
    gaps.forEach((gap, index) => {
      const row = gapsSheet.addRow([index + 1, gap]);
      row.eachCell(styleCell);
    });
  }

  autoWidth(gapsSheet);
}

function addClarificationQuestionsSheet(workbook, questions) {
  const qSheet = workbook.addWorksheet("Clarification Questions");

  qSheet.addRow(["ID", "Clarification Questions"]);
  styleHeader(qSheet.getRow(1));

  if (questions.length === 0) {
    const row = qSheet.addRow(["", "No clarification questions"]);
    row.eachCell(styleCell);
  } else {
    questions.forEach((q, index) => {
      const row = qSheet.addRow([index + 1, q]);
      row.eachCell(styleCell);
    });
  }

  autoWidth(qSheet);
}

function addRisksSheet(workbook, risks) {
  const risksSheet = workbook.addWorksheet("Risks");

  risksSheet.addRow(["ID", "Title", "Impact", "Description", "Suggestion"]);
  styleHeader(risksSheet.getRow(1));

  if (risks.length === 0) {
    const row = risksSheet.addRow(["", "No risks generated", "", "", ""]);
    row.eachCell(styleCell);
  } else {
    risks.forEach((risk, index) => {
      const row = risksSheet.addRow([
        index + 1,
        risk?.title || "",
        risk?.impact || "",
        risk?.description || "",
        risk?.suggestion || "",
      ]);
      row.eachCell(styleCell);
    });
  }

  autoWidth(risksSheet);
}

function addTestDataSheet(workbook, testData) {
  const testDataSheet = workbook.addWorksheet("Test Data");

  testDataSheet.addRow(["ID", "Field", "Valid Values", "Invalid Values"]);
  styleHeader(testDataSheet.getRow(1));

  if (testData.length === 0) {
    const row = testDataSheet.addRow(["", "No test data generated", "", ""]);
    row.eachCell(styleCell);
  } else {
    testData.forEach((item, index) => {
      const validValues = Array.isArray(item?.validValues)
        ? item.validValues.join("\n")
        : "";
      const invalidValues = Array.isArray(item?.invalidValues)
        ? item.invalidValues.join("\n")
        : "";

      const row = testDataSheet.addRow([
        index + 1,
        item?.field || "",
        validValues,
        invalidValues,
      ]);
      row.eachCell(styleCell);
    });
  }

  autoWidth(testDataSheet);
}

function addNonFunctionalTestsSheet(workbook, nonFunctionalTests) {
  const nftSheet = workbook.addWorksheet("Nonfunctional Tests");

  nftSheet.addRow(["ID", "Category", "Scenario"]);
  styleHeader(nftSheet.getRow(1));

  if (nonFunctionalTests.length === 0) {
    const row = nftSheet.addRow(["", "", "No non-functional tests generated"]);
    row.eachCell(styleCell);
  } else {
    nonFunctionalTests.forEach((test, index) => {
      const row = nftSheet.addRow([
        index + 1,
        test?.category || "",
        test?.scenario || "",
      ]);
      row.eachCell(styleCell);
    });
  }

  autoWidth(nftSheet);
}

function addCoverageMatrixSheet(workbook, coverageMatrix) {
  const cmSheet = workbook.addWorksheet("Coverage Matrix");

  cmSheet.addRow(["ID", "Requirement Area", "Covered By"]);
  styleHeader(cmSheet.getRow(1));

  if (coverageMatrix.length === 0) {
    const row = cmSheet.addRow(["", "", "No coverage matrix generated"]);
    row.eachCell(styleCell);
  } else {
    coverageMatrix.forEach((entry, index) => {
      const coveredBy = Array.isArray(entry?.coveredBy)
        ? entry.coveredBy.join(", ")
        : "";
      const row = cmSheet.addRow([
        index + 1,
        entry?.requirementArea || "",
        coveredBy,
      ]);
      row.eachCell(styleCell);
    });
  }

  autoWidth(cmSheet);
}

router.post("/generate-excel", async (req, res) => {
  try {
    const {
      requirement,
      mode = "premium",
      requirementType = "web",
      artifacts,
    } = req.body;

    if (!requirement || !requirement.trim()) {
      return res.status(400).json({ error: "Requirement is required." });
    }

    const result =
      artifacts && typeof artifacts === "object"
        ? artifacts
        : await generateTestArtifacts({
            requirement,
            mode,
            requirementType,
          });
    const testCases = result.testCases || [];
    const gaps = result.gaps || [];
    const questions = result.clarificationQuestions || [];
    const risks = result.risks || [];
    const testData = result.testData || [];
    const nonFunctionalTests = result.nonFunctionalTests || [];
    const coverageMatrix = result.coverageMatrix || [];

    const workbook = new ExcelJS.Workbook();
    addTestCasesSheet(workbook, testCases);
    if (mode === "premium") {
      addGapsSheet(workbook, gaps);
      addClarificationQuestionsSheet(workbook, questions);
      addRisksSheet(workbook, risks);
      addTestDataSheet(workbook, testData);
      addNonFunctionalTestsSheet(workbook, nonFunctionalTests);
      addCoverageMatrixSheet(workbook, coverageMatrix);
    }

    // =========================
    // 📤 RESPONSE
    // =========================
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="qa-test-artifacts.xlsx"',
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Excel generation error:", error);
    res.status(500).json({
      error: "Failed to generate Excel",
      details: error.message,
    });
  }
});

export default router;
