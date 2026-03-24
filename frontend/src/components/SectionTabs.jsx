export function SectionTabs({ mode, openSection, onToggleSection }) {
  const tabs = [
    { id: "testCases", label: "Test Cases", premiumOnly: false },
    { id: "gaps", label: "Gaps", premiumOnly: true },
    { id: "clarificationQuestions", label: "Clarification Questions", premiumOnly: true },
    { id: "risks", label: "Risks", premiumOnly: true },
    { id: "testData", label: "Test Data", premiumOnly: true },
    { id: "nonFunctionalTests", label: "Non-Functional", premiumOnly: true },
    { id: "coverageMatrix", label: "Coverage", premiumOnly: true },
  ];

  return (
    <div className="sectionTabs">
      {tabs.map((tab) => {
        if (tab.premiumOnly && mode !== "premium") return null;

        return (
          <button
            key={tab.id}
            className={
              openSection === tab.id
                ? "sectionTab active"
                : "sectionTab"
            }
            onClick={() => onToggleSection(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}