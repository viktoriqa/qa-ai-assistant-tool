import OpenAI from "openai";
import { buildGenerateTestCasesPrompt } from "../prompts/generateTestCasesPrompt.js";
import { buildDetectGapsPrompt } from "../prompts/detectGapsPrompt.js";
import { buildGenerateRisksPrompt } from "../prompts/generateRisksPrompt.js";
import { buildGenerateTestDataPrompt } from "../prompts/generateTestDataPrompt.js";
import { buildGenerateNonFunctionalTestsPrompt } from "../prompts/generateNonFunctionalTestsPrompt.js";
import { buildGenerateCoverageMatrixPrompt } from "../prompts/generateCoverageMatrixPrompt.js";

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is missing. Check your .env file and dotenv loading.",
    );
  }

  return new OpenAI({ apiKey });
}

function extractResponseText(response) {
  if (
    typeof response?.output_text === "string" &&
    response.output_text.trim()
  ) {
    return response.output_text;
  }

  if (!Array.isArray(response?.output)) return "";

  const textParts = [];
  for (const item of response.output) {
    if (!Array.isArray(item?.content)) continue;
    for (const content of item.content) {
      if (typeof content?.text === "string") {
        textParts.push(content.text);
      }
    }
  }

  return textParts.join("\n").trim();
}

function tryParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function parseModelJson(rawText) {
  const text = String(rawText || "").trim();
  if (!text) {
    throw new Error("Model returned empty output");
  }

  const direct = tryParseJson(text);
  if (direct) return direct;

  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) {
    const parsedFenced = tryParseJson(fencedMatch[1].trim());
    if (parsedFenced) return parsedFenced;
  }

  const firstObject = text.indexOf("{");
  const lastObject = text.lastIndexOf("}");
  if (firstObject !== -1 && lastObject > firstObject) {
    const parsedObject = tryParseJson(text.slice(firstObject, lastObject + 1));
    if (parsedObject) return parsedObject;
  }

  const firstArray = text.indexOf("[");
  const lastArray = text.lastIndexOf("]");
  if (firstArray !== -1 && lastArray > firstArray) {
    const parsedArray = tryParseJson(text.slice(firstArray, lastArray + 1));
    if (parsedArray) return parsedArray;
  }

  throw new Error("Model returned invalid JSON");
}

async function callModel(client, prompt) {
  console.time("OpenAI call");

  const response = await client.responses.create({
    model: "gpt-4o-mini",
    input: prompt,
  });

  console.timeEnd("OpenAI call");

  try {
    const outputText = extractResponseText(response);
    return parseModelJson(outputText);
  } catch (error) {
    console.error("Invalid JSON from model:", response?.output_text);
    throw new Error(error?.message || "Model returned invalid JSON");
  }
}

async function safeCallModel(client, prompt, fallbackValue, sectionName) {
  try {
    return await callModel(client, prompt);
  } catch (error) {
    console.warn(`Falling back for ${sectionName}:`, error.message);
    return fallbackValue;
  }
}

function normalizeTestCase(testCase) {
  const normalizePriority = (value) => {
    const v = String(value || "").toLowerCase();
    if (v === "high") return "High";
    if (v === "medium") return "Medium";
    if (v === "low") return "Low";
    return "Medium";
  };

  const normalizeSeverity = (value) => {
    const v = String(value || "").toLowerCase();
    if (v === "critical") return "Critical";
    if (v === "high") return "High";
    if (v === "medium") return "Medium";
    if (v === "low") return "Low";
    return "Medium";
  };

  const normalizeType = (value) => {
    const allowed = [
      "Positive",
      "Negative",
      "Edge",
      "Validation",
      "Security",
      "UI",
    ];
    const found = allowed.find(
      (item) => item.toLowerCase() === String(value || "").toLowerCase(),
    );
    return found || "Positive";
  };

  const normalizeRegressionCandidate = (value) => {
    if (typeof value === "boolean") return value;

    const v = String(value || "")
      .trim()
      .toLowerCase();
    if (["true", "yes", "1"].includes(v)) return true;
    if (["false", "no", "0"].includes(v)) return false;
    return null;
  };

  const deriveRegressionCandidate = (priority, severity, type) => {
    const highRisk =
      priority === "High" || severity === "Critical" || severity === "High";
    const stableCoreType = ["Positive", "Validation", "Security"].includes(
      type,
    );
    return highRisk || stableCoreType;
  };

  const deriveRegressionReason = (isCandidate, priority, severity, type) => {
    if (isCandidate) {
      return `Include in regression: ${priority} priority, ${severity} severity, and ${type} coverage for a reusable core flow.`;
    }

    return "Exclude from core regression: lower-risk or specialized scenario better suited to targeted testing.";
  };

  const priority = normalizePriority(testCase?.priority);
  const severity = normalizeSeverity(testCase?.severity);
  const type = normalizeType(testCase?.type);
  const normalizedCandidate = normalizeRegressionCandidate(
    testCase?.regressionCandidate,
  );
  const regressionCandidate =
    normalizedCandidate ?? deriveRegressionCandidate(priority, severity, type);
  const regressionReason =
    typeof testCase?.regressionReason === "string" &&
    testCase.regressionReason.trim()
      ? testCase.regressionReason.trim()
      : deriveRegressionReason(regressionCandidate, priority, severity, type);

  return {
    title: testCase?.title || "Untitled test case",
    preconditions: Array.isArray(testCase?.preconditions)
      ? testCase.preconditions
      : [],
    steps: Array.isArray(testCase?.steps) ? testCase.steps : [],
    expectedResult: testCase?.expectedResult || "",
    priority,
    severity,
    type,
    regressionCandidate,
    regressionReason,
  };
}

export async function generateBasicArtifacts({
  requirement,
  requirementType = "web",
}) {
  return generateTestArtifacts({
    requirement,
    mode: "basic",
    requirementType,
  });
}

export async function generatePremiumArtifacts({
  requirement,
  requirementType = "web",
}) {
  return generateTestArtifacts({
    requirement,
    mode: "premium",
    requirementType,
  });
}

export async function generateTestCases(requirement, requirementType = "web") {
  const result = await callModel(
    getClient(),
    buildGenerateTestCasesPrompt(requirement, requirementType),
  );

  return {
    feature: result?.feature || "Untitled Feature",
    testCases: Array.isArray(result?.testCases)
      ? result.testCases.map(normalizeTestCase)
      : [],
  };
}

export async function detectGaps(requirement, requirementType = "web") {
  const result = await callModel(
    getClient(),
    buildDetectGapsPrompt(requirement, requirementType),
  );

  return result;
}

export async function generateTestArtifacts({
  requirement,
  mode = "basic",
  requirementType = "web",
}) {
  const client = getClient();

  if (mode === "basic") {
    const testCasesResult = await callModel(
      client,
      buildGenerateTestCasesPrompt(requirement, requirementType),
    );

    return {
      feature: testCasesResult?.feature || "Untitled Feature",
      testCases: Array.isArray(testCasesResult?.testCases)
        ? testCasesResult.testCases.map(normalizeTestCase)
        : [],
    };
  }

  // Start all calls immediately in parallel.
  const testCasesPromise = safeCallModel(
    client,
    buildGenerateTestCasesPrompt(requirement, requirementType),
    { feature: "Untitled Feature", testCases: [] },
    "testCases",
  );

  const coverageMatrixPromise = testCasesPromise.then((testCasesResultRaw) => {
    const earlyTestCases = Array.isArray(testCasesResultRaw?.testCases)
      ? testCasesResultRaw.testCases.map(normalizeTestCase)
      : [];
    return safeCallModel(
      client,
      buildGenerateCoverageMatrixPrompt(requirement, earlyTestCases),
      { coverageMatrix: [] },
      "coverageMatrix",
    );
  });

  const [
    testCasesResultRaw,
    gapsResultRaw,
    risksResultRaw,
    testDataResultRaw,
    nonFunctionalTestsResultRaw,
    coverageMatrixResultRaw,
  ] = await Promise.all([
    testCasesPromise,
    safeCallModel(
      client,
      buildDetectGapsPrompt(requirement, requirementType),
      { gaps: [], clarificationQuestions: [] },
      "gaps",
    ),
    safeCallModel(
      client,
      buildGenerateRisksPrompt(requirement, requirementType),
      { risks: [] },
      "risks",
    ),
    safeCallModel(
      client,
      buildGenerateTestDataPrompt(requirement, requirementType),
      { testData: [] },
      "testData",
    ),
    safeCallModel(
      client,
      buildGenerateNonFunctionalTestsPrompt(requirement, requirementType),
      { nonFunctionalTests: [] },
      "nonFunctionalTests",
    ),
    coverageMatrixPromise,
  ]);

  const testCases = Array.isArray(testCasesResultRaw?.testCases)
    ? testCasesResultRaw.testCases.map(normalizeTestCase)
    : [];

  const gapsResult = gapsResultRaw;

  return {
    feature: testCasesResultRaw?.feature || "Untitled Feature",
    testCases,
    gaps: gapsResult.gaps,
    clarificationQuestions: gapsResult.clarificationQuestions,
    risks: Array.isArray(risksResultRaw?.risks) ? risksResultRaw.risks : [],
    testData: Array.isArray(testDataResultRaw?.testData)
      ? testDataResultRaw.testData
      : [],
    nonFunctionalTests: Array.isArray(
      nonFunctionalTestsResultRaw?.nonFunctionalTests,
    )
      ? nonFunctionalTestsResultRaw.nonFunctionalTests
      : [],
    coverageMatrix: Array.isArray(coverageMatrixResultRaw?.coverageMatrix)
      ? coverageMatrixResultRaw.coverageMatrix
      : [],
  };
}
