import express from 'express';
import fileUpload from 'express-fileupload';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { Parser } from './parser.js';
import Combinator from './combinator.js';

function runProcessor(config) {
  return new Promise((resolve, reject) => {
    const processorPath = path.resolve('./rf_processor' + (process.platform === "win32" ? ".exe" : ''));
    const proc = spawn(processorPath, [], { stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data;
    });

    proc.stderr.on('data', (data) => {
      stderr += data;
    });

    proc.on('error', (error) => {
      reject(error);
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Process exited with code ${code}: ${stderr}`));
      } else {
        resolve(stdout);
      }
    });

    proc.stdin.write(JSON.stringify(config));
    proc.stdin.end();
  });
}

const app = express();
app.use(express.json());
app.use(fileUpload({
  useTempFiles : true
}));

app.post('/generate', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/html');
  res.write(JSON.stringify({progress: 5})+'\n');
  const outputFileName = req.files.dataset.name.split('.')[0];
  const outputTFilePath = path.resolve('./tmp/'+outputFileName+'.trff');
  const outputFilePath = path.resolve('./tmp/'+outputFileName+'.rff');
  try {
    console.log('Received file ' + outputFileName);
    console.log('Running RF processor...');
    await fs.mkdir('./tmp', { recursive: true });
    const response = await runProcessor({
      "name": outputFileName,
      "model": req.files.dataset.tempFilePath,
      "type": req.body.type,
      "test_size": parseInt(req.body.testRatio) / 100.0,
      "random_state": parseInt(req.body.randState),
      "trees_count": parseInt(req.body.treesCount),
      "output_file": outputTFilePath
    });
    if (response.success == false) {
      throw new Error('Running processor failed: ' + response.error);
    }
    console.log('Parsing RF processor output...');
    res.write(JSON.stringify({progress: 50})+'\n');
    const parser = new Parser();
    const rf = parser.parse(await fs.readFile(outputTFilePath, 'utf-8'));
    res.write(JSON.stringify({progress: 75})+'\n');
    await fs.unlink(outputTFilePath);
    console.log('Combining trees...');
    const combinator = new Combinator();
    combinator.combine(rf);
    await fs.writeFile(outputFilePath, JSON.stringify(rf, null, 2));
    res.write(JSON.stringify({progress: 100, file: outputFileName})+'\n');
    console.log('Done!');
  } catch (ex) {
    console.error('Generating failed', ex);
    res.write(JSON.stringify({error: ex.message})+'\n');
  }
  
  try {
    await fs.unlink(req.files.dataset.tempFilePath);
  } catch(_) {}
  res.end();
});

app.post('/download', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  const outputFilePath = path.resolve('./tmp/'+req.body.file+'.rff');
  res.sendFile(req.body.file+'.rff', {
    root: path.resolve('./tmp/')
  }, err => {
    if (err) {
      res.status(400);
      res.end();
      return;
    }
    fs.unlink(outputFilePath);
  });
});

export function start() {
  app.listen(4444, err => {
    if (err != null) {
      console.error('Failed to start server', err);
      return;
    }
    console.log('Listening on :4444');
  });
}

