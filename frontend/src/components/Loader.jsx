export function Loader() {
  return (
    <div className="loadingOverlay">
      <div className="loadingCard">
        <div className="spinner" />
        <div className="loadingText">
          <h3>Generating artifacts...</h3>
          <p>Please wait while the AI prepares your QA output.</p>
        </div>
      </div>
    </div>
  );
}
