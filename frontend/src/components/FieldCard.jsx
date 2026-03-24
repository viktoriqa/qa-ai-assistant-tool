export function FieldCard({ title, value, onChange, options, description }) {
  return (
    <div className="fieldCard">
      <label className="label">{title}</label>
      <select
        className="select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <small className="helperText">{description}</small>
    </div>
  );
}
