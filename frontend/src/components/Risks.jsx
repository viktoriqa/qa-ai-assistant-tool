export function Risks({ risks }) {
  return (
    <div className="panel sectionPanel sectionAccentRed">
      <div className="panelHeader">
        <div>
          <h2>Risks</h2>
          <span>Potential issues impacting quality or delivery</span>
        </div>
      </div>

      {risks?.length ? (
        <div className="riskReviewList">
          {risks.map((risk, index) => (
            <div key={index} className="riskCard">
              <div className="riskCardHeader">
                <span
                  className={`riskLevel riskLevel-${risk.impact?.toLowerCase() || "default"}`}
                >
                  {risk.impact || "Info"}
                </span>

                <h3 className="riskTitle">{risk.title}</h3>
              </div>

              <p className="riskDescription">{risk.description}</p>

              {risk.suggestion && (
                <div className="riskRecommendation">
                  <span className="riskRecommendationLabel">
                    Recommendation
                  </span>
                  <p>{risk.suggestion}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="emptyState">No risks identified.</p>
      )}
    </div>
  );
}
