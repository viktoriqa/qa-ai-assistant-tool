# QA AI Generator

An AI-powered QA analysis tool that transforms raw feature requirements into structured test artifacts — test cases, gap reports, risk assessments, test data specs, non-functional checks, and coverage matrices.

---

## Features

- **Export to Excel** — Download the full test suite as a formatted `.xlsx` file
- **Requirement Type Support** — Web, Mobile, API, Admin
- **Basic Mode** — Generates a structured set of test cases from a requirement
- **Premium Mode** — Full QA analysis suite including:
  - Test Cases (with preconditions, steps, expected results, regression notes)
  - Gap Detection (missing or ambiguous requirement details)
  - Clarification Questions (open questions to raise with stakeholders)
  - Risk Assessment (high/medium/low risk items with recommendations)
  - Test Data Specifications (valid and invalid data sets per field)
  - Non-Functional Tests (performance, security, accessibility, usability, reliability)
  - Coverage Matrix (feature area coverage overview)
  - **Feature Analysis** — At-a-glance summary panel displayed alongside premium results, including:
  - Total test case count
  - Gap count
  - Clarification question count
  - Risk count (with high/medium/low breakdown)
  - Review Summary — overall quality assessment of the requirement (tone: positive / neutral / warning) with a short insight
  - Attention Points — auto-detected warnings about requirement completeness, boundary coverage, and risk exposure

---

## Tech Stack

| Layer    | Technology                       |
| -------- | -------------------------------- |
| Frontend | React 19, Vite, Axios            |
| Backend  | Node.js, Express 5               |
| AI       | OpenAI API (`gpt-4o-mini`)       |
| Export   | ExcelJS                          |
| Styling  | Plain CSS (custom design system) |
| Font     | Plus Jakarta Sans                |

---

## Project Structure

```
qa-ai-generator/
├── backend/
│   └── src/
│       ├── index.js                  # Express server entry point
│       ├── routes/
│       │   ├── testCaseRoutes.js     # /api/generate-basic, /api/generate-premium
│       │   └── exportRoutes.js       # /api/export-excel
│       ├── services/
│       │   └── aiService.js          # OpenAI integration
│       └── prompts/
│           ├── generateTestCasesPrompt.js
│           ├── detectGapsPrompt.js
│           ├── generateRisksPrompt.js
│           ├── generateTestDataPrompt.js
│           ├── generateNonFunctionalTestsPrompt.js
│           └── generateCoverageMatrixPrompt.js
└── frontend/
    └── src/
        ├── App.jsx                   # Main app logic and state
        ├── api.js                    # Axios instance
        └── components/               # UI components
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- An OpenAI API key

### Installation

```bash
# Clone the repo
git clone <your-repo-url>
cd qa-ai-generator

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### Running Locally

```bash
# Start the backend (from /backend)
npm run dev

# Start the frontend (from /frontend)
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend on `http://localhost:3001`.

---

## API Endpoints

| Method | Endpoint                | Description                     |
| ------ | ----------------------- | ------------------------------- |
| POST   | `/api/generate-basic`   | Generate test cases only        |
| POST   | `/api/generate-premium` | Generate full QA analysis suite |
| POST   | `/api/export-excel`     | Export test artifacts to Excel  |

### Request Body (`generate-basic` / `generate-premium`)

```json
{
  "requirement": "string", // required
  "requirementType": "web | mobile | api | admin" // optional
}
```

---

## Usage

1. Paste your feature requirement into the text area
2. Select the **Requirement Type** (Web / Mobile / API / Admin)
3. Select the **Mode** (Basic or Premium)
4. Click **Generate Preview** to see the full analysis
5. Click **Download Excel** to export the test suite

---

## Output Sections

| Tab                         | Description                                                                                     |
| --------------------------- | ----------------------------------------------------------------------------------------------- |
| **Feature Analysis**        | Summary panel with artifact counts, Review Summary, and Attention Points (premium only)         |
| **Test Cases**              | Structured test cases with preconditions, steps, expected results, type, priority, and severity |
| **Gaps**                    | Missing, ambiguous, or underspecified areas in the requirement                                  |
| **Clarification Questions** | Open questions to raise with stakeholders before testing begins                                 |
| **Risks**                   | Identified risk areas rated high/medium/low with mitigation recommendations                     |
| **Test Data**               | Valid and invalid data sets per input field for boundary and negative testing                   |
| **Non-Functional**          | Checks for performance, security, accessibility, usability, and reliability                     |
| **Coverage**                | A matrix showing which feature areas are covered by the generated test cases                    |
