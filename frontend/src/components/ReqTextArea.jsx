export function ReqTextArea({ value, onChange }) {
  return (
    <>
      <div className="panelHeader centeredHeader">
        <h2>Requirement</h2>
        <p className="panelSubtext">
          Paste a user story, acceptance criteria, or feature description
        </p>
      </div>

      <div className="formBlock">
        <textarea
          className="textarea"
          value={value}
          onChange={onChange}
          placeholder="Example: As a user, I want to reset my password via email so that I can regain access to my account."
        />
      </div>
    </>
  );
}