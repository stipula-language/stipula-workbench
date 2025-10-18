import React, { useState, useEffect } from "react";
import { ActionsList } from "./ActionView";
import { cleanStr } from "./Contract";

function FunctionEditor({
  functionData, 
  onSave,
  onClose,
  parties,
  HOinputs,
}) {
  const [currentFunction, setCurrentFunction] = useState(functionData.data);

  const [inputField, setInputField] = useState("");
  const [inputAsset, setInputAsset] = useState("");
  const [fromState, setFromState] = useState("");

  useEffect(() => {
    setCurrentFunction(functionData.data);
  }, [functionData.data]);

  const handleChange = (key, value) => {
    setCurrentFunction((prev) => ({ ...prev, [key]: value }));
  };

  const handleListAdd = (listName, newItem) => {
    if (newItem && !currentFunction[listName].includes(newItem)) {
      setCurrentFunction((prev) => ({
        ...prev,
        [listName]: [...prev[listName], newItem],
      }));
    }
  };

  const handleCallerAdd = (newItem) => {
    if (newItem) {
      if (newItem === "~") {
        setCurrentFunction((prev) => ({ ...prev, caller: ["~"] }));
      } else {
        const filteredCallers = currentFunction.caller.filter((c) => c !== "~");
        if (!filteredCallers.includes(newItem)) {
          setCurrentFunction((prev) => ({
            ...prev,
            caller: [...filteredCallers, newItem],
          }));
        }
      }
    }
  };

  const handleListDelete = (listName, itemToDelete) => {
    setCurrentFunction((prev) => ({
      ...prev,
      [listName]: prev[listName].filter((item) => item !== itemToDelete),
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content form-card">
        <div className="modal-header">
          <h3>
            {/* Ora usiamo 'functionData.isNew' per la condizione e 'currentFunction.name' per il titolo */}
            {functionData.isNew
              ? "Create New Function"
              : `Edit Function: ${currentFunction.name || "Untitled"}`}
          </h3>
          <button onClick={onClose} className="btn-delete">
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="function-name">Name:</label>
              <input
                id="function-name"
                type="text"
                className="form-input"
                value={currentFunction.name}
                onChange={(e) => handleChange("name", cleanStr(e.target.value))}
              />
            </div>
            <div className="form-group-checkbox">
              <input
                type="checkbox"
                id="isHO-checkbox"
                checked={currentFunction.isHO}
                onChange={(e) => handleChange("isHO", e.target.checked)}
              />
              <label htmlFor="isHO-checkbox">Higher-order function</label>
            </div>
          </div>
          
          {currentFunction.isHO && (
             <div className="form-group" style={{marginBottom: "20px"}}>
              <label>Input Code:</label>
              <select
                className="form-input"
                value={currentFunction.HOinput}
                onChange={(e) => handleChange('HOinput', e.target.value)}
              >
                <option value="" disabled>Select input code...</option>
                {HOinputs.map((v, i) => (
                  <option key={i} value={`input_code_${i + 1}`}>input_code_{i + 1}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-row">
            <div className="form-group list-box">
              <label>From state:</label>
              <ul>
                {currentFunction.fromState.map((element) => (
                  <li key={element}>
                    {element}
                    <button className="btn-delete" onClick={() => handleListDelete("fromState", element)}>&times;</button>
                  </li>
                ))}
              </ul>
              <form
                onSubmit={(e) => { e.preventDefault(); handleListAdd("fromState", fromState); setFromState(""); }}
                className="add-item-form"
              >
                <input value={fromState} onChange={(e) => setFromState(cleanStr(e.target.value))} type="text" className="form-input" placeholder="Add state..." required />
                <button type="submit" className="btn btn-primary">Add</button>
              </form>
            </div>
            <div className="form-group list-box">
              <label>Formal parameters:</label>
              <ul>
                {currentFunction.fields.map((element) => (
                  <li key={element}>
                    {element}
                    <button className="btn-delete" onClick={() => handleListDelete("fields", element)}>&times;</button>
                  </li>
                ))}
              </ul>
              <form
                onSubmit={(e) => { e.preventDefault(); handleListAdd("fields", inputField); setInputField(""); }}
                className="add-item-form"
              >
                <input value={inputField} onChange={(e) => setInputField(cleanStr(e.target.value))} type="text" className="form-input" placeholder="Add parameter..." required />
                <button type="submit" className="btn btn-primary">Add</button>
              </form>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group list-box">
              <label>Assets parameters:</label>
              <ul>
                {currentFunction.assets.map((element) => (
                  <li key={element}>
                    {element}
                    <button className="btn-delete" onClick={() => handleListDelete("assets", element)}>&times;</button>
                  </li>
                ))}
              </ul>
              <form
                onSubmit={(e) => { e.preventDefault(); handleListAdd("assets", inputAsset); setInputAsset(""); }}
                className="add-item-form"
              >
                <input value={inputAsset} onChange={(e) => setInputAsset(cleanStr(e.target.value))} type="text" className="form-input" placeholder="Add asset..." required />
                <button type="submit" className="btn btn-primary">Add</button>
              </form>
            </div>
            <div className="form-group list-box">
              <label>Who can call it?</label>
               <ul>
                {currentFunction.caller.map((element) => (
                  <li key={element}>
                    {element}
                    <button className="btn-delete" onClick={() => handleListDelete("caller", element)}>&times;</button>
                  </li>
                ))}
              </ul>
              <select className="form-input" onChange={(e) => handleCallerAdd(e.target.value)} value="">
                 <option value="" disabled>Select a party...</option>
                 <option value="~">All Parties</option>
                 {parties.map((p) => (<option key={p} value={p}>{p}</option>))}
              </select>
            </div>
          </div>
            
           {!currentFunction.isHO && (
            <>
              <div className="form-group" style={{marginTop: '20px'}}>
                  <label htmlFor="function-to-state">To state:</label>
                   <input
                    id="function-to-state"
                    type="text"
                    className="form-input"
                    value={currentFunction.toState}
                    onChange={(e) => handleChange("toState", cleanStr(e.target.value))}
                    />
              </div>
               <div className="form-group" style={{marginTop: '20px'}}>
                  <label>Actions:</label>
                  <ActionsList
                    actions={currentFunction.actions}
                    setActions={(newActions) => handleChange('actions', newActions)}
                    father={1}
                  />
               </div>
            </>
           )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={() => onSave(currentFunction)} className="btn btn-primary">
            {functionData.isNew ? "Add Function" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default FunctionEditor;