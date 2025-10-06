import React from "react";

function Name(props) {
  return (
    <div className="card">
      <div className="card-header">
        <h3>Contract Name</h3>
      </div>
      <div className="card-content">
        <div className="form-group">
          <label htmlFor="contract-name">
            Provide a name for your smart contract.
          </label>
          <input
            type="text"
            id="contract-name"
            className="form-input" 
            placeholder="e.g., SimpleSaleAgreement"
            value={props.name}
            onChange={(e) => props.handleAdd(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

export default Name;