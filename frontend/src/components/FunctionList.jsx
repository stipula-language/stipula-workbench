import React from 'react';

function FunctionList({ functions, onAddNew, onEdit, onDelete }) {
  return (
    <div className="form-card">
      <div className="card-header">
        <h3>Functions</h3>
      </div>
      <div className="card-content">
        <ul className="function-list">
          {functions.length > 0 ? (
            functions.map((func, index) => (
              <li key={func.id || index} className="function-list-item">
                <span className="function-list-item-name">
                  {func.name || 'Untitled Function'}
                </span>
                <div className="function-list-item-actions">
                  <button className="btn btn-secondary" onClick={() => onEdit(index)}>
                    Edit
                  </button>
                  <button className="btn-delete" onClick={() => onDelete(index)}>
                    &times;
                  </button>
                </div>
              </li>
            ))
          ) : (
            <li className="empty-list-message">No functions defined yet.</li>
          )}
        </ul>
        <button onClick={onAddNew} className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }}>
          New Function
        </button>
      </div>
    </div>
  );
}

export default FunctionList;