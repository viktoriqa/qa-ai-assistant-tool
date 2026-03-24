export function TestData({ testData }) {
  return (
    <div className="panel sectionPanel sectionAccentBlue">
      <div className="panelHeader">
        <div>
          <h2>Test Data</h2>
          <span>Suggested valid and invalid sample values</span>
        </div>
      </div>

      {testData?.length ? (
        <div className="dataSpecList">
          {testData.map((item, index) => (
            <div key={index} className="dataSpecCard">
              <div className="dataSpecHeader">
                <h3>{item.field}</h3>
              </div>

              <div className="dataSpecGrid">
                <div className="dataSpecColumn">
                  <div className="dataSpecColumnHeader">
                    <span className="dataSpecBadge valid">Valid</span>
                  </div>

                  {item.validValues?.length ? (
                    <div className="dataSpecValues">
                      {item.validValues.map((value, i) => (
                        <div key={i} className="dataSpecValueRow">
                          <code>{String(value)}</code>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="emptyMini">No valid values</p>
                  )}
                </div>

                <div className="dataSpecColumn">
                  <div className="dataSpecColumnHeader">
                    <span className="dataSpecBadge invalid">Invalid</span>
                  </div>

                  {item.invalidValues?.length ? (
                    <div className="dataSpecValues">
                      {item.invalidValues.map((value, i) => (
                        <div key={i} className="dataSpecValueRow">
                          <code>{String(value)}</code>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="emptyMini">No invalid values</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="emptyState">No test data generated.</p>
      )}
    </div>
  );
}
