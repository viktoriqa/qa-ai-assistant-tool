export function AttentionPoints({ points }) {
  return (
    <div className="attentionSection">
      <div className="attentionHeader">
        <span className="sectionEyebrow">Attention Points</span>
      </div>

      <div className="attentionGrid">
        {points.map((point, index) => (
          <div key={index} className="attentionCard">
            {point}
          </div>
        ))}
      </div>
    </div>
  );
}
