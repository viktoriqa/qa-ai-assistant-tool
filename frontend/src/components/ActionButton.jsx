export function ActionButton({
  loading,
  onGeneratePreview,
  onDownloadExcel,
}) {
  return (
    <div className="buttonRow">
      <button
        className="primaryButton"
        onClick={onGeneratePreview}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Preview"}
      </button>

      <button
        className="secondaryButton"
        onClick={onDownloadExcel}
        disabled={loading}
      >
        Download Excel
      </button>
    </div>
  );
}