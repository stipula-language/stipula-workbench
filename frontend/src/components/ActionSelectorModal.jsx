import React from 'react';

export function ActionSelectorModal({ onSelectAction, onClose, when }) {
  const actions = [
    { type: "SEND1", text: "Send a value to a field or a party" },
    { type: "SEND2", text: "Send a calculation result to a field or a party" },
    { type: "MOVE1", text: "Move a full asset to an asset or a party" },
    { type: "MOVE2", text: "Move a part of an asset to an asset or a party" },
    { type: "IF", text: "Execute actions based on a condition" },
  ];

  const timeActions = [
    { type: "WHEN1", text: "After a specific time..." },
    { type: "WHEN2", text: "At a certain date..." },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Choose an Action</h3>
          <button onClick={onClose} className="btn-delete">&times;</button>
        </div>
        <div className="modal-body">
          <div className="function-list">
            {actions.map(action => (
              <div
                key={action.type}
                className="function-list-item"
                onClick={() => onSelectAction(action.type)}
                style={{ cursor: 'pointer' }}
              >
                <span className="function-list-item-name">{action.text}</span>
              </div>
            ))}
          </div>

          {when && (
            <>
              <h4 style={{ marginTop: "20px", color: "var(--accent-color)" }}>
                Time-based Actions
              </h4>
              <div className="function-list">
                {timeActions.map(action => (
                  <div
                    key={action.type}
                    className="function-list-item"
                    onClick={() => onSelectAction(action.type)}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="function-list-item-name">{action.text}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
