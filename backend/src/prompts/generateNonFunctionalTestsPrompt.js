export function buildGenerateNonFunctionalTestsPrompt(requirement, requirementType = "web") {
  const typeInstructions = {
    web: "Focus on usability, accessibility, performance, reliability, and security.",
    api: "Focus on performance, reliability, security, scalability, and resilience.",
    mobile: "Focus on performance, battery/network behavior, usability, accessibility, and reliability.",
    admin: "Focus on security, auditability, reliability, performance, and operational stability."
  };

  return `
You are a senior QA engineer.

${typeInstructions[requirementType] || typeInstructions.web}

Analyze the requirement and return valid JSON only with this structure:

{
  "nonFunctionalTests": [
    {
      "category": "Performance | Security | Usability | Reliability | Accessibility",
      "scenario": "string"
    }
  ]
}

Rules:
- Generate 4 to 8 practical non-functional test scenarios according to ISQB.
- Keep them concise and relevant.
- Return valid JSON only.
- Do not use markdown fences.

Requirement:
${requirement}
`;
}