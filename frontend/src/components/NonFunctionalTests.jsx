export function NonFunctionalTests({ nonFunctionalTests }) {
  return (
    <div className="panel sectionPanel sectionAccentPurple">
      <div className="panelHeader">
        <div>
          <h2>Non-Functional Tests</h2>
          <span>
            Performance, security, usability, accessibility, and reliability
            checks
          </span>
        </div>
      </div>

      {nonFunctionalTests?.length ? (
        <div className="nfrList">
          {nonFunctionalTests.map((item, index) => (
            <div key={index} className="nfrItem">
              <div className="nfrHeader">
                <span
                  className={`nfrBadge nfrBadge-${(item.category || "general").toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {item.category || "General"}
                </span>
              </div>

              <p className="nfrScenario">{item.scenario}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="emptyState">No non-functional tests generated.</p>
      )}
    </div>
  );
}
