export function buildGenerateTestCasesPrompt(
  requirement,
  requirementType = "web",
) {
  const typeInstructions = {
    web: "Focus on UI behavior, field validation, error messages, user flow, and edge cases.",
    api: "Focus on API request and response validation, status codes, authentication, payload validation, and error handling.",
    mobile:
      "Focus on mobile-specific behavior, interruptions, orientation changes, usability, and validation.",
    admin:
      "Focus on permissions, roles, admin workflows, validation, audit-related risks, and restricted actions.",
  };

  return `
You are a senior QA engineer.

${typeInstructions[requirementType] || typeInstructions.web}

Analyze the requirement and return JSON with this structure:

{
  "feature": "string",
  "testCases": [
    {
      "title": "string",
      "preconditions": ["string"],
      "steps": ["string"],
      "expectedResult": "string",
      "priority": "High | Medium | Low",
      "severity": "Critical | High | Medium | Low",
      "type": "Positive | Negative | Edge | Validation | Security | UI",
      "regressionCandidate": true,
      "regressionReason": "string"
    }
  ]
}

Rules:
- Generate full set of test cases structured, risk-prioritized, using ISTQB test design techniques.
- Focus on the most important functional, negative, validation, and edge cases.
- Every test case MUST include priority, severity, type, and clear preconditions (if needed), steps, and expected result.
- Every test case MUST include regressionCandidate (true/false) and regressionReason.
- Identify regressionCandidate according to ISTQB-style risk-based thinking:
  - true for stable, reusable, business-critical/high-risk, frequently used, or defect-prone flows.
  - false for one-off, low-risk, volatile, or mainly exploratory scenarios.
- regressionReason must be short and specific (one sentence).
- Priority is based on business importance.
- Severity is based on impact if the functionality fails.
- Keep titles and steps concise.
- Return valid JSON only.
- Do not use markdown fences.

Requirement:
${requirement}
`;
}
