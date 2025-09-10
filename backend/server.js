const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs/promises');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 4000;

// Middleware
app.use(cors()); // Abilita richieste da origini diverse (il frontend React)
app.use(express.json()); // Permette di leggere il JSON dal body delle richieste

// Definisci l'endpoint per l'analisi
app.post('/api/analyze', async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Nessun codice fornito.' });
  }

  // Definisci i percorsi in modo robusto
  const analyzerDir = path.join(__dirname, '..', 'analyzer');
  const tempFileName = `contract_${Date.now()}.stipula`;
  const tempFilePath = path.join(analyzerDir, tempFileName);

  try {
    // 1. Salva il codice in un file temporaneo
    await fs.writeFile(tempFilePath, code);

    const venvPythonPath = path.join(analyzerDir, 'venv', 'bin', 'python');
    
    // Aggiungiamo un log per debug
    console.log(`Tentando di eseguire analizzatore con: ${venvPythonPath}`);

    const pythonProcess = spawn(venvPythonPath, [path.join(analyzerDir, 'analyzer.py'), tempFilePath, '--readable', '--compact']);

    let stdoutData = '';
    let stderrData = '';

    pythonProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    // 3. Attendi la fine del processo
    pythonProcess.on('close', async (code) => {
      // 4. Elimina il file temporaneo
      await fs.unlink(tempFilePath);

      if (stderrData) {
        console.error(`Errore dall'analizzatore: ${stderrData}`);
        return res.status(500).json({ error: stderrData });
      }

      // 5. Invia il risultato al frontend
      res.status(200).json({ output: stdoutData });
    });

  } catch (error) {
    console.error('Errore del server:', error);
    // Assicurati che il file temporaneo venga eliminato anche in caso di errore
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
