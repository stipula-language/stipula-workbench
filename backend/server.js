const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs/promises');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.post('/api/analyze', async (req, res) => {
  const { code, short } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Nessun codice fornito.' });
  }

  const analyzerDir = path.join(__dirname, '..', 'analyzer');
  const tempFileName = `contract_${Date.now()}.stipula`;
  const tempFilePath = path.join(analyzerDir, tempFileName);

  try {
    await fs.writeFile(tempFilePath, code);

    const venvPythonPath = path.join(analyzerDir, 'venv', 'bin', 'python');
    
    const args = [
      path.join(analyzerDir, 'analyzer.py'),
      tempFilePath,
      '--compact'
    ];

    if (short) {
      args.push('--short');
    } else {
      args.push('--readable');
    }

    console.log(`Eseguendo l'analizzatore con gli argomenti: ${args.join(' ')}`);

    const pythonProcess = spawn(venvPythonPath, args);

    let stdoutData = '';
    let stderrData = '';

    pythonProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    pythonProcess.on('close', async (code) => {
      await fs.unlink(tempFilePath);

      if (stderrData) {
        console.error(`Errore dall'analizzatore: ${stderrData}`);
        return res.status(500).json({ error: stderrData });
      }
      const header = '+-------------+\n|   Results   |\n+-------------+\n';
      if (short) {
        
        if (stdoutData.trim() === header.trim()) {
          stdoutData = `${header}\n✅ Analysis complete: No issues (warnings, expired, or unreachable code) found.`;
        }
      }
      

      res.status(200).json({ output: stdoutData });
    });

  } catch (error) {
    console.error('Errore del server:', error);
    try {
      await fs.unlink(tempFilePath);
    } catch (cleanupError) {
      console.error('Errore nella pulizia del file temporaneo:', cleanupError);
    }
    res.status(500).json({ error: 'Errore interno del server.' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend in ascolto sulla porta ${PORT}`);
});