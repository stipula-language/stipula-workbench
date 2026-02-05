import React, { useState, useEffect, useRef } from "react";
import JSZip from "jszip";
import Assets from "./Assets";
import Fields from "./Fields";
import Name from "./Name";
import Agreement from "./Agreement";
import { v4 as uuid } from "uuid";
import {
  Contract,
  Function as FunctionConstructor,
  getCode,
  getCodeHOinput,
} from "./Contract";
import { cleanStr } from "./Contract";
import Parties from "./Parties";
import HOinputs from "./HOinputs";
import { ChevronRight, ChevronDown } from "lucide-react";
import FunctionList from './FunctionList';
import FunctionEditor from './FunctionEditor';

function ContractView(props) {
  const [cont, setCont] = useState(new Contract());
  const [currentTab, setCurrentTab] = useState("contract");
  const [copied, setCopied] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisType, setAnalysisType] = useState(null);
  const [interpreterOutput, setInterpreterOutput] = useState("");
  const [interpreterInput, setInterpreterInput] = useState("");
  const [isInterpreterRunning, setIsInterpreterRunning] = useState(false);
  const [ws, setWs] = useState(null);
  const consoleOutputRef = useRef(null);
  const textareaRef = useRef(null);

  const [editingFunction, setEditingFunction] = useState(null);
  
  const [expandedPanel, setExpandedPanel] = useState(null);

  const [isCodeEditable, setIsCodeEditable] = useState(false);
  const [isEditorDisconnected, setIsEditorDisconnected] = useState(false);
  const [editedCode, setEditedCode] = useState("");

  useEffect(() => {
    if (isCodeEditable && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.max(300, textareaRef.current.scrollHeight);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [editedCode, isCodeEditable]);


  const handleCodeKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const { target } = e;
      const { selectionStart, selectionEnd } = target;
      
      const newCode = 
        editedCode.substring(0, selectionStart) + 
        '  ' +
        editedCode.substring(selectionEnd);
      
      setEditedCode(newCode);

      setTimeout(() => {
        target.selectionStart = target.selectionEnd = selectionStart + 2;
      }, 0);
    }
  };

  const handleEditCode = () => {
    const confirmation = window.confirm(
      "Warning: Editing the code manually will disconnect it from the graphical editor. Any changes made here will not be reflected in the visual components. Do you want to proceed?"
    );
    if (confirmation) {
      setIsCodeEditable(true);
      setIsEditorDisconnected(true);
      setEditedCode(getCode(cont));
    }
  };

  const handleResetAndResync = () => {
    const confirmation = window.confirm(
      "Are you sure? This will discard your manual code changes and re-enable the graphical editor."
    );
    if (confirmation) {
      setIsCodeEditable(false);
      setIsEditorDisconnected(false);
      setEditedCode("");
    }
  };


  const handleAnalyze = async (isShort) => {
    setIsAnalyzing(true);
    setAnalysisType(isShort ? 'short' : 'verbose');
    setAnalysisResult(null);
    const codeToAnalyze = isCodeEditable ? editedCode : getCode(cont);

    try {
      const response = await fetch('http://localhost:4000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: codeToAnalyze, short: isShort }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Unknown server error.');
      }
      
      setAnalysisResult({ type: 'success', data: result.output });

    } catch (error) {
      console.error("Error during analysis:", error);
      setAnalysisResult({ type: 'error', data: error.message });
    } finally {
      setIsAnalyzing(false);
      setAnalysisType(null);
    }
  };


  const handleLiquidityAnalyze = async (isVerbose) => {
    setIsAnalyzing(true);
    setAnalysisType(isVerbose ? 'liquidity-verbose' : 'liquidity');
    setAnalysisResult(null);
    const codeToAnalyze = isCodeEditable ? editedCode : getCode(cont);

    try {
      const response = await fetch('http://localhost:4000/api/liquidity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: codeToAnalyze, verbose: isVerbose }),
      });
      console.log("b2")


      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Unknown server error.');
      }

      setAnalysisResult({ type: 'success', data: result.output });

    } catch (error) {
      console.log("e1")
      console.error("Error during analysis:", error);
      setAnalysisResult({ type: 'error', data: error.message });
    } finally {
      console.log("e2")
      setIsAnalyzing(false);
    }
      console.log("e3")
  };

  useEffect(() => {
    if (consoleOutputRef.current) {
      consoleOutputRef.current.scrollTop = consoleOutputRef.current.scrollHeight;
    }
  }, [interpreterOutput]);

  const connectWebSocket = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log("WebSocket is already connected.");
      return;
    }

    const newWs = new WebSocket('ws://localhost:3001');

    newWs.onopen = () => {
      console.log('WebSocket connected');
      setWs(newWs);
      setIsInterpreterRunning(true);

      const contractCode = isCodeEditable ? editedCode : getCode(cont);
      const hoInputs = cont.HOinputs.map(hoInput => ({
        name: hoInput.name,
        content: getCodeHOinput(hoInput)
      }));
      newWs.send(JSON.stringify({
        type: 'START_INTERPRETER',
        payload: {
          contractCode,
          hoInputs
        }
      }));
      setInterpreterOutput("Starting Stipula interpreter...\n");
    };

    newWs.onmessage = event => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'INTERPRETER_OUTPUT':
          setInterpreterOutput(prev => prev + data.output);
          break;
        case 'INTERPRETER_ERROR':
          setInterpreterOutput(prev => prev + `[INTERPRETER ERROR]: ${data.error}`);
          break;
        case 'INTERPRETER_STARTED':
          setInterpreterOutput(prev => prev + `[SERVER]: ${data.message}\n`);
          break;
        case 'INTERPRETER_CLOSED':
          setInterpreterOutput(prev => prev + `[SERVER]: Interpreter stopped with code: ${data.code}\n`);
          setIsInterpreterRunning(false);
          newWs.close();
          setWs(null);
          break;
        case 'INTERPRETER_STOPPED':
          setInterpreterOutput(prev => prev + `[SERVER]: ${data.message}\n`);
          setIsInterpreterRunning(false);
          newWs.close();
          setWs(null);
          break;
        case 'ERROR':
          setInterpreterOutput(prev => prev + `[ERROR]: ${data.message}\n`);
          setIsInterpreterRunning(false);
          if (newWs.readyState === WebSocket.OPEN) newWs.close();
          setWs(null);
          break;
        default:
          setInterpreterOutput(prev => prev + `[UNKNOWN MESSAGE]: ${event.data}\n`);
      }
    };

    newWs.onclose = () => {
      console.log('WebSocket disconnected');
      setIsInterpreterRunning(false);
      setWs(null);
    };

    newWs.onerror = error => {
      console.error('WebSocket error:', error);
      setInterpreterOutput(prev => prev + `[CONNECTION ERROR]: ${error.message}\n`);
      setIsInterpreterRunning(false);
      newWs.close();
      setWs(null);
    };
  };

  const sendInterpreterInput = (e) => {
    e.preventDefault();
    if (ws && ws.readyState === WebSocket.OPEN && isInterpreterRunning) {
      setInterpreterOutput(prev => prev + `> ${interpreterInput}\n`);
      ws.send(JSON.stringify({ type: 'SEND_INPUT', payload: { input: interpreterInput } }));
      setInterpreterInput("");
    } else {
      setInterpreterOutput(prev => prev + "[ERROR]: Interpreter not running or WebSocket connection not established.\n");
    }
  };

  const stopInterpreter = () => {
    if (ws && ws.readyState === WebSocket.OPEN && isInterpreterRunning) {
      ws.send(JSON.stringify({ type: 'STOP_INTERPRETER' }));
      setInterpreterOutput(prev => prev + "[SERVER]: Interpreter stop requested...\n");
    }
  };

  function TabSwitcher() {
    return (
      <div className={"tabswitcher"}>
        <button
          onClick={() => setCurrentTab("contract")} className={currentTab === "contract" ? "selected" : ""}>
          Edit Contract
        </button>
        <button
          onClick={() => setCurrentTab("highorder")} className={currentTab === "highorder" ? "selected" : ""}>
          Edit Higher-order function input
        </button>
      </div>
    );
  }

  const handleOpenNewFunction = () => {
    setEditingFunction({
      data: new FunctionConstructor(uuid()),
      isNew: true,
    });
  };

  const handleOpenFunctionEditor = (index) => {
    setEditingFunction({
      index: index,
      data: cont.functions[index],
      isNew: false,
    });
  };

  const handleCloseFunctionEditor = () => {
    setEditingFunction(null);
  };

  const handleSaveFunction = (functionData) => {
    const updatedFunctions = [...cont.functions];
    if (editingFunction.isNew) {
      updatedFunctions.push(functionData);
    } else {
      updatedFunctions[editingFunction.index] = functionData;
    }
    setCont({ ...cont, functions: updatedFunctions });
    handleCloseFunctionEditor();
  };
  
  function deleteFunction(index) {
    const updatedList = cont.functions.filter((_, i) => i !== index);
    setCont({ ...cont, functions: updatedList });
  }

  function addAsset(element) {
    if (!cont.assets.includes((element = cleanStr(element))))
      setCont({ ...cont, assets: [...cont.assets, element] });
  }

  function deleteAsset(element) {
    const updatedList = cont.assets.filter((item) => item !== element);
    setCont({ ...cont, assets: updatedList });
  }

  function addField(element) {
    if (!cont.fields.includes((element = cleanStr(element))))
      setCont({ ...cont, fields: [...cont.fields, element] });
  }

  function deleteField(element) {
    const updatedList = cont.fields.filter((item) => item !== element);
    setCont({ ...cont, fields: updatedList });
  }

  function addParty(element) {
    if (!cont.parties.includes((element = cleanStr(element))))
      setCont({ ...cont, parties: [...cont.parties, element] });
  }

  function deleteParty(element) {
    const updatedList = cont.parties.filter((item) => item !== element);
    setCont({ ...cont, parties: updatedList });
  }

  function saveState() {
    const state = { cont };
    const stateJson = JSON.stringify(state);
    const a = document.createElement("a");
    a.href =
      "data:application/json;charset=utf-8," + encodeURIComponent(stateJson);
    a.download = cont.name + "-project" + ".json";
    a.click();
  }

  function handleFileSelect(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const state = JSON.parse(event.target.result);
      setCont(state.cont);
    };
    reader.readAsText(file);
  }

  function handleDownload() {
    const zip = new JSZip();
    zip.file(
      cont.name.trim().length ? cont.name + ".stipula" : "noname.stipula",
      getCode(cont)
    );
    cont.HOinputs.map((el, i) => {
      zip.file("input_code_" + (i + 1) + ".stipula", getCodeHOinput(el));
    });
    const state = { cont };
    const stateJson = JSON.stringify(state);
    zip.file(
      cont.name.trim().length
        ? cont.name + "-project.json"
        : "noname-project.json",
      stateJson
    );
    zip.generateAsync({ type: "blob" }).then(function (content) {
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = cont.name.trim().length
        ? cont.name + ".zip"
        : "noname.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }
  
  const toggleEditorPanel = () => {
    setExpandedPanel(expandedPanel === 'editor' ? null : 'editor');
  };

  const toggleOutputPanel = () => {
    setExpandedPanel(expandedPanel === 'output' ? null : 'output');
  };
  
  return (
    <div className="contract-view-container">
      <div className="grid-files">
        <div className="description">
          Save the project to continue editing it later or download the code to run it directly!
        </div>
        <div className="files">
          <label htmlFor="fileInput">Upload Project:</label>
          <input
            type="file"
            id="fileInput"
            className="file-input"
            onChange={handleFileSelect}
          />
          <button className="btn btn-primary" onClick={saveState}>Save Project</button>
          <button className="btn btn-primary" onClick={handleDownload}>Download All</button>
        </div>
      </div>
      <TabSwitcher />

      {currentTab === "contract" ? (
        <div className="main-content-area">
          <div className={`editor-panel ${expandedPanel === 'output' ? 'collapsed' : ''}`}>
            <div className="panel-header">
              <h3 className="panel-title">Editor</h3>
              <button 
                onClick={toggleEditorPanel} 
                className={`btn-collapse ${expandedPanel === 'editor' ? 'open' : ''}`}
                aria-label="Toggle editor panel"
              >
                <span className="chevrons"></span>
              </button>

            </div>
            <div className={`panel-content ${expandedPanel === 'output' ? 'hidden' : ''}`}>
              {isEditorDisconnected && (
                <div className="editor-warning">
                  <p>⚠️ The graphical editor is disconnected due. to manual code editing.</p>
                  <button onClick={handleResetAndResync} className="btn btn-secondary">
                    Reset & Re-sync
                  </button>
                </div>
              )}
              <fieldset disabled={isEditorDisconnected}>
                <div className="grid-name">
                  <Name
                    name={cont.name}
                    handleAdd={(newName) =>
                      setCont({ ...cont, name: cleanStr(newName) })
                    }
                  />
                </div>
                <div className="grid-assets">
                  <Assets
                    handleAdd={(asset) => addAsset(asset)}
                    value={cont.assets}
                    deleteAsset={(asset) => deleteAsset(asset)}
                  />
                </div>
                <div className="grid-fields">
                  <Fields
                    handleAdd={(field) => addField(field)}
                    value={cont.fields}
                    deleteField={(field) => deleteField(field)}
                  />
                </div>
                <div className="grid-parties">
                  <Parties
                    handleAdd={(party) => addParty(party)}
                    value={cont.parties}
                    deleteParty={(party) => deleteParty(party)}
                  />
                </div>
                <div className="grid-agreement">
                  <Agreement
                    agreements={cont.agreements}
                    setAgreements={(element) =>
                      setCont({ ...cont, agreements: element })
                    }
                    parties={cont.parties}
                    fields={cont.fields}
                    state={cont.firstState}
                    setState={(element) => setCont({ ...cont, firstState: element })}
                  />
                </div>
                <div className="grid-function">
                  <FunctionList 
                    functions={cont.functions}
                    onAddNew={handleOpenNewFunction}
                    onEdit={handleOpenFunctionEditor}
                    onDelete={deleteFunction}
                  />
                </div>
              </fieldset>
            </div>
          </div>

          <div className={`output-panel ${expandedPanel === 'editor' ? 'collapsed' : ''}`}>
            <div className="panel-header">
              <h3 className="panel-title">Output</h3>
              <button 
                onClick={toggleOutputPanel} 
                className={`btn-collapse ${expandedPanel === 'output' ? '' : 'open' }`}
                aria-label="Toggle output panel"
              >
                <span className="chevrons"></span>
              </button>
            </div>
            <div className={`panel-content ${expandedPanel === 'editor' ? 'hidden' : ''}`}>
                <div className="code-card">
                  <div className="code-header">
                    <h3>Contract Code</h3>
                    <div className="code-actions">
                      <button className="btn-edit" onClick={handleEditCode} disabled={isCodeEditable}>
                        Edit
                      </button>
                      <button
                        className="btn-analyze-short"
                        onClick={() => handleAnalyze(true)}
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing && analysisType === 'short' ? "Analyzing..." : "Unreachability"}
                      </button>
                      <button
                        className="btn-liquidity-analyze"
                        onClick={() => handleLiquidityAnalyze(false)}
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing && analysisType === 'liquidity' ? "Analyzing..." : "Liquidity"}
                      </button>
                       <button 
                        className="btn-analyze" 
                        onClick={() => handleAnalyze(false)} 
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing && analysisType === 'verbose' ? "Analyzing..." : "Unreachability (verbose)"}
                      </button>
                      <button
                        className="btn-liquidity-analyze-verbose"
                        onClick={() => handleLiquidityAnalyze(true)}
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing && analysisType === 'liquidity-verbose' ? "Analyzing..." : "Liquidity (verbose)"}
                      </button>
                    </div>
                  </div>
                  
                  <div className="code-container">
                    <pre className="line-numbers">
                      {(isCodeEditable ? editedCode : getCode(cont))
                        .split('\n')
                        .map((_, i) => i + 1)
                        .join('\n')}
                    </pre>
                    {isCodeEditable ? (
                      <textarea
                        ref={textareaRef}
                        className="code-block editable"
                        value={editedCode}
                        onChange={(e) => setEditedCode(e.target.value)}
                        onKeyDown={handleCodeKeyDown}
                        spellCheck="false"
                      />
                    ) : (
                      <pre className="code-block">{getCode(cont)}</pre>
                    )}
                  </div>


                  {analysisResult && (
                    <div className={`analysis-box ${analysisResult.type}`}>
                      <h4>Analysis Results</h4>
                      <pre>{analysisResult.data}</pre>
                    </div>
                  )}
              </div>

              <div className="interpreter-card">
                <div className="interpreter-header">
                  <h3>Stipula Interpreter</h3>
                  <div className="interpreter-actions">
                    <button 
                      onClick={connectWebSocket}
                      disabled={isInterpreterRunning && ws && ws.readyState === WebSocket.OPEN}
                      className={`btn-run ${isInterpreterRunning ? "running" : ""}`}
                    >
                      {isInterpreterRunning ? "Running" : "Run"}
                    </button>
                    <button 
                      onClick={stopInterpreter} 
                      disabled={!isInterpreterRunning} 
                      className="btn-stop"
                    >
                      Stop
                    </button>
                  </div>
                </div>

                <div className="interpreter-console" ref={consoleOutputRef}>
                  {interpreterOutput}
                </div>

                <form onSubmit={sendInterpreterInput} className="interpreter-input-form">
                  <input
                    type="text"
                    value={interpreterInput}
                    onChange={(e) => setInterpreterInput(e.target.value)}
                    placeholder="Type a command..."
                    disabled={!isInterpreterRunning}
                    className="interpreter-input"
                  />
                  <button 
                    type="submit" 
                    disabled={!isInterpreterRunning || interpreterInput.trim() === ""} 
                    className="btn-send"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <HOinputs
          parties={cont.parties}
          HOinputs={cont.HOinputs}
          setHOinputs={(inputs) => {
            setCont({ ...cont, HOinputs: inputs });
          }}
        />
      )}

      {editingFunction && (
        <FunctionEditor
          functionData={editingFunction}
          onSave={handleSaveFunction}
          onClose={handleCloseFunctionEditor}
          parties={cont.parties}
          HOinputs={cont.HOinputs}
        />
      )}
    </div>
  );
}

export default ContractView;