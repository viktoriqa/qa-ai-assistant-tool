export function CoverageMatrix({ coverageMatrix, onGoToTestCase }) {
  return (
    <div className="panel sectionPanel sectionAccentGreen">
      <div className="panelHeader">
        <div>
          <h2>Coverage Matrix</h2>
          <span>Traceability between requirement areas and test cases</span>
        </div>
      </div>

      {coverageMatrix?.length ? (
        <div className="coverageTableWrapper">
          <table className="coverageTable">
            <thead>
              <tr>
                <th>Requirement Area</th>
                <th>Covered By</th>
              </tr>
            </thead>
            <tbody>
              {coverageMatrix.map((row, index) => (
                <tr key={index}>
                  <td>{row.requirementArea}</td>
                  <td>
                    <div className="coverageChips">
                      {row.coveredBy?.length ? (
                        row.coveredBy.map((item, chipIndex) => (
                          <span
                            key={chipIndex}
                            className="coverageChip clickable"
                            onClick={() => onGoToTestCase(item)}
                          >
                            {item}
                          </span>
                        ))
                      ) : (
                        <span className="coverageEmpty">Not mapped</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="emptyState">No coverage matrix available.</p>
      )}
    </div>
  );
}
