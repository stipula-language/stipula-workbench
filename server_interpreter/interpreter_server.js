const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = process.env.PORT || 3001;

app.use(express.json());

const TEMP_FILES_DIR = path.join(__dirname, 'temp_stipula_files');
if (!fs.existsSync(TEMP_FILES_DIR)) {
    fs.mkdirSync(TEMP_FILES_DIR);
}

const javaProcesses = new Map();

wss.on('connection', ws => {
    console.log('Client connected via WebSocket');

    let javaProcess;
    let contractFileName = '';

    ws.on('message', message => {
        const data = JSON.parse(message);

        switch (data.type) {
            case 'START_INTERPRETER':
                if (javaProcess) {
                    ws.send(JSON.stringify({ type: 'ERROR', message: 'Interpreter already running.' }));
                    return;
                }

                const contractContent = data.payload.contractCode;
                const hoInputs = data.payload.hoInputs;

                contractFileName = `contract_${Date.now()}.stipula`;
                const contractFilePath = path.join(TEMP_FILES_DIR, contractFileName);

                const hoInputFilePaths = [];

                try {
                    fs.writeFileSync(contractFilePath, contractContent);
                    console.log(`Contract written to ${contractFilePath}`);

                    hoInputs.forEach((hoInput, index) => {
                        const hoInputFileName = `ho_input_${Date.now()}_${index}.stipula`;
                        const hoInputFilePath = path.join(TEMP_FILES_DIR, hoInputFileName);
                        fs.writeFileSync(hoInputFilePath, hoInput.content);
                        hoInputFilePaths.push(hoInputFilePath);
                        console.log(`HO input written to ${hoInputFilePath}`);
                    });

                    const javaArgs = [
                        '-jar',
                        'HOstipula_lan.jar',
                        contractFilePath,
                        ...hoInputFilePaths
                    ];
                    
                    javaProcess = spawn('java', javaArgs, { cwd: __dirname });

                    javaProcesses.set(ws, javaProcess);

                    javaProcess.stdout.on('data', output => {
                        console.log(`Java stdout: ${output}`);
                        ws.send(JSON.stringify({ type: 'INTERPRETER_OUTPUT', output: output.toString() }));
                    });

                    javaProcess.stderr.on('data', error => {
                        console.error(`Java stderr: ${error}`);
                        ws.send(JSON.stringify({ type: 'INTERPRETER_ERROR', error: error.toString() }));
                    });

                    javaProcess.on('close', code => {
                        console.log(`Java process exited with code ${code}`);
                        ws.send(JSON.stringify({ type: 'INTERPRETER_CLOSED', code: code }));
                        javaProcesses.delete(ws);
                        javaProcess = null;

                        fs.unlinkSync(contractFilePath);
                        hoInputFilePaths.forEach(filePath => fs.unlinkSync(filePath));
                        console.log('Temporary files cleaned up.');
                    });

                    ws.send(JSON.stringify({ type: 'INTERPRETER_STARTED', message: 'Interpreter started successfully.' }));

                } catch (err) {
                    console.error('Error starting interpreter:', err);
                    ws.send(JSON.stringify({ type: 'ERROR', message: `Failed to start interpreter: ${err.message}` }));
                    if (fs.existsSync(contractFilePath)) fs.unlinkSync(contractFilePath);
                    hoInputFilePaths.forEach(filePath => {
                        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                    });
                }
                break;
            case 'SEND_INPUT':
                if (javaProcess && javaProcess.stdin.writable) {
                    javaProcess.stdin.write(data.payload.input + '\n');
                } else {
                    ws.send(JSON.stringify({ type: 'ERROR', message: 'Interpreter not running or stdin not writable.' }));
                }
                break;
            case 'STOP_INTERPRETER':
                if (javaProcess) {
                    javaProcess.kill('SIGKILL');
                    console.log('Interpreter stopped by client request.');
                    ws.send(JSON.stringify({ type: 'INTERPRETER_STOPPED', message: 'Interpreter stopped.' }));
                } else {
                    ws.send(JSON.stringify({ type: 'ERROR', message: 'No interpreter to stop.' }));
                }
                break;
            default:
                ws.send(JSON.stringify({ type: 'ERROR', message: 'Unknown message type.' }));
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected from WebSocket');
        if (javaProcess) {
            javaProcess.kill('SIGKILL');
            javaProcesses.delete(ws);
        }
    });

    ws.on('error', error => {
        console.error('WebSocket error:', error);
    });
});

server.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
});