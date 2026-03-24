export function buildGenerateTestDataPrompt(requirement, requirementType = "web") {
  const typeInstructions = {
    web: "Focus on UI field values, valid and invalid inputs, lengths, formats, and boundary data.",
    api: "Focus on request payload values, valid and invalid field combinations, nulls, limits, and malformed data.",
    mobile: "Focus on user input, device state data, and practical valid and invalid values.",
    admin: "Focus on role-related input, operational data, limits, and invalid combinations."
  };

  return `
You are a senior QA engineer.

${typeInstructions[requirementType] || typeInstructions.web}

Analyze the requirement and return valid JSON only with this structure:

{
  "testData": [
    {
      "field": "string",
      "validValues": ["string"],
      "invalidValues": ["string"]
    }
  ]
}

Rules:
- Generate 4 to 8 useful test data entries according to ISQB.
- Keep them practical and concise.
- Return valid JSON only.
- Do not use markdown fences.

Requirement:
${requirement}
`;
}