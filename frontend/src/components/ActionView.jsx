import React, { useState } from "react";
import { v4 as uuid } from "uuid";
import { Action } from "./Contract";
import { ActionSelectorModal } from "./ActionSelectorModal";


export function ActionsList(props) {
  return (
    <div className="action-view">
      {props.actions.length === 0 ? (
        <div className="add-button-wrapper">
          <AddButton
            insertAtIndex={0}
            setActions={props.setActions}
            actions={props.actions}
            when={props.father}
          />
        </div>
      ) : (
        
        <>
          {/* Pulsante per aggiungere in cima alla lista */}
          <div className="add-button-wrapper">
            <AddButton
              insertAtIndex={0}
              setActions={props.setActions}
              actions={props.actions}
              when={props.father}
            />
          </div>

          {/* Mappa ogni azione e aggiungi un pulsante dopo di essa */}
          {props.actions.map((element, idx) => (
            <div key={element.id}>
              <ActionView
                element={element}
                setActions={props.setActions}
                actions={props.actions}
                when={props.father}
              />
              <div className="add-button-wrapper">
                <AddButton
                  insertAtIndex={idx + 1}
                  setActions={props.setActions}
                  actions={props.actions}
                  when={props.father}
                />
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}



function ActionView(props) {
  const { element, actions, setActions, when } = props;

  function updateAction(updatedData) {
    const index = actions.findIndex((item) => item.id === element.id);
    if (index === -1) return;
    const newActions = [...actions];
    newActions[index] = { ...newActions[index], ...updatedData };
    setActions(newActions);
  }

  function setThen(thenActions) {
    updateAction({ ifThen: thenActions });
  }

  function setElseThen(elseThenActions) {
    updateAction({ elseThen: elseThenActions });
  }

  function deleteAction() {
    setActions(actions.filter((item) => item.id !== element.id));
  }

  const renderInputField = (paramName, placeholder = "") => (
    <input
      type="text"
      className="form-input"
      placeholder={placeholder}
      value={element[paramName] || ""}
      onChange={(e) => updateAction({ [paramName]: e.target.value })}
    />
  );

  const renderSelectField = (paramName, options) => (
    <select
      className="form-input"
      value={element[paramName]}
      onChange={(e) => updateAction({ [paramName]: e.target.value })}
    >
      <option value="" disabled>
        Select...
      </option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );

  const getActionTitle = (type) => {
    const titles = {
      SEND1: "Send Value",
      SEND2: "Send Calculation",
      MOVE1: "Move Asset",
      MOVE2: "Move Part of Asset",
      IF: "If Condition",
      WHEN1: "After Time",
      WHEN2: "At Date",
    };
    return titles[type] || "Action";
  };

  return (
      <div className="action-card">
        <div className="action-header">
          <span className="action-title">{getActionTitle(element.type)}</span>
          <button className="btn-delete" onClick={deleteAction}>
            &times;
          </button>
        </div>

        <div className="action-body">
          {(() => {
            switch (element.type) {
              case "SEND1":
                return (
                  <>
                    <span className="action-connector">Send</span>
                    {renderInputField("par1", "value/asset")}
                    <span className="action-connector">to</span>
                    {renderInputField("par2", "party")}
                  </>
                );
              case "SEND2":
                return (
                  <>
                    <span className="action-connector">Send</span>
                    {renderInputField("par1", "value 1")}
                    {renderSelectField("par2", [
                      { value: "+", label: "+" },
                      { value: "-", label: "-" },
                      { value: "*", label: "×" },
                      { value: "/", label: "÷" },
                    ])}
                    {renderInputField("par3", "value 2")}
                    <span className="action-connector">to</span>
                    {renderInputField("par4", "party")}
                  </>
                );
              case "MOVE1":
                return (
                  <>
                    <span className="action-connector">Move</span>
                    {renderInputField("par1", "asset")}
                    <span className="action-connector">to</span>
                    {renderInputField("par2", "party")}
                  </>
                );
              case "MOVE2":
                return (
                  <>
                    <span className="action-connector">Move</span>
                    {renderInputField("par1", "amount")}
                    <span className="action-connector">of</span>
                    {renderInputField("par2", "asset")}
                    <span className="action-connector">to</span>
                    {renderInputField("par3", "party")}
                  </>
                );
              case "IF":
                return (
                  <div style={{ width: "100%" }}>
                    <span className="action-connector">
                      If the following conditions are met:
                    </span>
                    {/* Qui potresti inserire condition-row */}

                    <div className="action-nested-container">
                      <label>Then:</label>
                      <ActionsList
                        actions={element.ifThen || []}
                        setActions={setThen}
                        father={false}
                      />
                    </div>
                    <div className="action-nested-container">
                      <label>Else:</label>
                      <ActionsList
                        actions={element.elseThen || []}
                        setActions={setElseThen}
                        father={false}
                      />
                    </div>
                  </div>
                );
              case "WHEN1":
              case "WHEN2":
                return (
                  <div style={{ width: "100%" }}>
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        alignItems: "center",
                      }}
                    >
                      <span className="action-connector">
                        {element.type === "WHEN1" ? "After" : "At"}
                      </span>
                      <input
                        type={element.type === "WHEN1" ? "text" : "date"}
                        className="form-input"
                        value={element.par1}
                        onChange={(e) =>
                          updateAction({ par1: e.target.value })
                        }
                      />
                      <span className="action-connector">, move from state</span>
                      {renderInputField("par2", "state name")}
                      <span className="action-connector">to state</span>
                      {renderInputField("par3", "state name")}
                    </div>
                    <div className="action-nested-container">
                      <label>Then:</label>
                      <ActionsList
                        actions={element.ifThen || []}
                        setActions={setThen}
                        father={false}
                      />
                    </div>
                  </div>
                );
              default:
                return <span className="error">Error: Unknown Action Type</span>;
            }
          })()}
        </div>
      </div>
  );
}


function AddButton(props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handleAddAction(type) {
    setIsModalOpen(false);
    const newAction = new Action(type, uuid());
    const newActions = [...props.actions];

    
    newActions.splice(props.insertAtIndex, 0, newAction);

    props.setActions(newActions);
  }

  return (
    <>
      <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
        + Add Action
      </button>

      {isModalOpen && (
        <ActionSelectorModal
          onSelectAction={handleAddAction}
          onClose={() => setIsModalOpen(false)}
          when={props.when}
        />
      )}
    </>
  );
}

export default ActionsList;