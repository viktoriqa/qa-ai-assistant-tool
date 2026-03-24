export function buildGenerateRisksPrompt(requirement, requirementType = "web") {
  const typeInstructions = {
    web: "Focus on workflow, validation, permissions, UI behavior, and user-impact risks.",
    api: "Focus on API contract, auth, payload validation, rate limiting, and integration risks.",
    mobile: "Focus on device behavior, interruptions, offline behavior, and usability risks.",
    admin: "Focus on permissions, restricted actions, auditability, data integrity, and operational risks."
  };

  return `
You are a senior QA engineer.

${typeInstructions[requirementType] || typeInstructions.web}

Analyze the requirement and return valid JSON only with this structure:

{
  "risks": [
    {
      "title": "string",
      "impact": "High | Medium | Low",
      "description": "string",
      "suggestion": "string"
    }
  ]
}

Rules:
- Generate 5 to 10 practical, non-duplicate risks according to ISQB.
- "impact" means business/testing impact.
- Keep each item concise and specific.
- Return valid JSON only.
- Do not use markdown fences.

Requirement:
${requirement}
`;
}