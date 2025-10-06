import React, { useState } from "react";
import { cleanStr } from "./Contract";
function Fields(props) {
  const [input, setInput] = useState("");
  function handleSubmit(e) {
    props.handleAdd(input);
    e.preventDefault();
    setInput("");
  }
  return (
    <div>
      <div className="title">Fields</div>
      <ul>
        {props.value.map((element) => (
          <li key={element}>
            <span>{element}</span>
            <button
              className="btn-delete"
              onClick={() => props.deleteField(element)}
              title={`Delete ${element}`}
            >
              &times;
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit} className="add-item-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(cleanStr(e.target.value))}
          placeholder="Add field..."
          className="form-input"
          required
        />
        <button type="submit" className="btn btn-primary">Add</button>
      </form>
      </div>
  );
}
export default Fields;
