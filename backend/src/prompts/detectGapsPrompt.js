export function buildDetectGapsPrompt(requirement, requirementType = "web") {
  const typeInstructions = {
    web: "Focus on missing UI behavior, validation, error handling, and user flow details.",
    api: "Focus on missing API request and response details, status codes, auth rules, validation, and error handling.",
    mobile: "Focus on missing mobile behavior, interruptions, orientation handling, and usability expectations.",
    admin: "Focus on missing permissions, role rules, audit requirements, validation, and restricted actions."
  };

  return `
You are a senior QA engineer reviewing a software requirement.

${typeInstructions[requirementType] || typeInstructions.web}

Analyze the requirement for missing information, ambiguities, and unclear edge cases.

Return JSON with this structure:

{
  "gaps": ["string"],
  "clarificationQuestions": ["string"]
}

Constraints:
- Generate 5 to 8 items in "gaps".
- Generate 5 to 8 items in "clarificationQuestions".
- "gaps" should be missing, unclear, or non-testable requirements.
- "clarificationQuestions" should be practical questions a QA engineer would ask before testing.
- Keep all items concise.
- Return valid JSON only.
- Do not use markdown fences.

Requirement:
${requirement}
`;
}