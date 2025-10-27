import React, { useState } from "react";
import { cleanStr } from "./Contract";
function Agreement(props) {
  const [empty, setEmpty] = useState("");

  function handleChangeState(value) {
    props.setState(value);
  }
  function handleAddFieldAgr(element, i) {
    if (!props.agreements[i].fields.includes(element)) {
      let tmp = props.agreements.slice();
      tmp[i].fields = [...tmp[i].fields, element];
      props.setAgreements(tmp);
    }
  }
  function handleDeleteFieldAgr(element, i) {
    const tmp = props.agreements.slice();
    tmp[i].fields = props.agreements[i].fields.filter(
      (item) => item !== element
    );
    props.setAgreements(tmp);
  }
  function handleAddPartyAgr(element, i) {
    if (!props.agreements[i].parties.includes(element)) {
      const tmp = props.agreements.slice();
      tmp[i].parties = [...tmp[i].parties, element];
      props.setAgreements(tmp);
    }
  }
  function handleDeletePartyAgr(element, i) {
    const tmp = props.agreements.slice();
    tmp[i].parties = props.agreements[i].parties.filter(
      (item) => item !== element
    );
    props.setAgreements(tmp);
  }
  return (
    <div className="grid-container-agreement">
      <div className="title">Agreement</div>
      <div className="container-agreements">
        {props.agreements.map((ag, i) => {
          return (
            <div className="agreement-row" key={i}>
              <div className="list-box">
                <strong>Fields to be agreed</strong>
                <ul>
                  {ag.fields.map((element, elIndex) => {
                    return (
                      <li key={elIndex}>
                        <button
                          className="delete-list-el"
                          onClick={() => handleDeleteFieldAgr(element, i)}
                          aria-label={`Remove field ${element}`}
                        ></button>
                        {element}
                      </li>
                    );
                  })}
                </ul>
                <form>
                  <select
                    onChange={(e) => {
                      handleAddFieldAgr(e.target.value, i);
                    }}
                    value={empty}
                    aria-label="Add field to agreement"
                  >
                    <option value="" disabled hidden>
                      Select...
                    </option>
                    {props.fields.map((element, elIndex) => {
                      return <option key={elIndex} value={element}>{element}</option>;
                    })}
                  </select>
                </form>
              </div>
              <label>agreed with</label>
              <div className="list-box">
                <strong>Parties that agree</strong>
                <ul>
                  {ag.parties.map((element, elIndex) => {
                    return (
                      <li key={elIndex}>
                        <button
                          className="delete-list-el"
                          onClick={() => handleDeletePartyAgr(element, i)}
                          aria-label={`Remove party ${element}`}
                        ></button>
                        {element}
                      </li>
                    );
                  })}
                </ul>
                <form>
                  <select
                    onChange={(e) => {
                      handleAddPartyAgr(e.target.value, i);
                    }}
                    value={empty}
                    aria-label="Add party to agreement"
                  >
                    <option value="" disabled hidden>
                      Select...
                    </option>
                    {props.parties.map((element, elIndex) => {
                      return <option key={elIndex} value={element}>{element}</option>;
                    })}
                  </select>
                </form>
              </div>
              <button
                className="remove-button"
                onClick={() => {
                  let tmp = props.agreements.slice();
                  tmp.splice(i, 1);
                  props.setAgreements(tmp);
                }}
                aria-label={`Remove agreement ${i + 1}`}
              ></button>
            </div>
          );
        })}
        <button
          className="add-button"
          onClick={() =>
            props.setAgreements([
              ...props.agreements,
              { fields: [], parties: [] },
            ])
          }
          aria-label="Add new agreement"
        ></button>
      </div>
      <div className="grid-state">
        <label htmlFor="ag-state">State name after the agreement:</label>
        <input
          type="text"
          id="ag-state"
          value={props.firstState}
          onChange={(e) => {
            handleChangeState(e.target.value);
          }}
        />
      </div>
    </div>
  );
}
export default Agreement;