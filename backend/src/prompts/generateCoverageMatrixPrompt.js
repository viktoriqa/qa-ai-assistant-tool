export function buildGenerateCoverageMatrixPrompt(requirement, testCases) {
  return `
You are a senior QA engineer.

Using the requirement and the generated test cases below, return valid JSON only with this structure:

{
  "coverageMatrix": [
    {
      "requirementArea": "string",
      "coveredBy": ["TC-1", "TC-2"]
    }
  ]
}

Rules:
- Break the requirement into meaningful requirement areas.
- Map each area to one or more test case IDs.
- Use only these test case IDs: ${testCases.map((_, i) => `TC-${i + 1}`).join(", ")}.
- Keep entries concise.
- Return valid JSON only.
- Do not use markdown fences.

Requirement:
${requirement}

Test Cases:
${JSON.stringify(testCases, null, 2)}
`;
}
