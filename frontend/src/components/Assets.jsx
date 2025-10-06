// Assets.jsx - RIVISTO
import React, { useState } from "react";
import { cleanStr } from "./Contract";

function Assets(props) {
  const [input, setInput] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (input.trim()) {
      props.handleAdd(input);
      setInput("");
    }
  }

  return (
    // Utilizziamo la classe .form-card come contenitore principale
    <div>
      <div className="title">Assets</div>
    
      <ul>
        {props.value.map((element) => (
          <li key={element}>
            <span>{element}</span>
            <button
              className="btn-delete"
              onClick={() => props.deleteAsset(element)}
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
          placeholder="Add asset..."
          className="form-input" // Nuova classe per l'input
          required
        />
        <button type="submit" className="btn btn-primary">Add</button>
      </form>
    </div>
  );
}

export default Assets;