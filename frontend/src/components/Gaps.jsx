export function Gaps({ gaps }) {
  return (
    <div className="panel sectionPanel sectionAccentOrange">
      <div className="panelHeader">
        <div>
          <h2>Gaps</h2>
          <span>Missing or ambiguous requirement details</span>
        </div>
      </div>

      {gaps?.length ? (
        <ul className="cleanList">
          {gaps.map((gap, index) => (
            <li key={index}>{gap}</li>
          ))}
        </ul>
      ) : (
        <p className="emptyState">No gaps found.</p>
      )}
    </div>
  );
}
