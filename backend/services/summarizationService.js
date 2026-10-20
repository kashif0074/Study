// backend/services/summarizationService.js
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

class SummarizationService {
  constructor() {
    this.process = null;
    this.port = 5001;
    this.isReady = false;
    this.modelPath = process.env.MODEL_PATH || './models_cache/StudySpark_summarization';
  }

  async loadModel() {
    if (this.process) {
      console.log("ℹ️ Summarizer Service already running or loading.");
      return { status: 'already_running' };
    }

    return new Promise((resolve, reject) => {
      const venvPython = path.join(__dirname, '../.venv/Scripts/python.exe');
      const scriptPath = path.join(__dirname, 'summarizer.py');
      
      // Determine which interpreter to use (check if local virtual environment exists)
      const interpreter = fs.existsSync(venvPython) ? venvPython : 'python';
      
      console.log(`🎬 Launching Python Summarizer using interpreter: ${interpreter}`);
      
      this.process = spawn(interpreter, [scriptPath, '--port', this.port.toString()]);
      
      // Handle stdout
      this.process.stdout.on('data', (data) => {
        const output = data.toString().trim();
        console.log(`[Python Summarizer]: ${output}`);
        
        if (output.includes('Summarizer server running')) {
          this.isReady = true;
          resolve({ status: 'ready' });
        }
      });

      // Handle stderr
      this.process.stderr.on('data', (data) => {
        console.error(`[Python Summarizer Error]: ${data.toString().trim()}`);
      });

      // Handle process close
      this.process.on('close', (code) => {
        console.log(`⚠️ [Python Summarizer] Process exited with code ${code}`);
        this.process = null;
        this.isReady = false;
      });

      // Safety timeout: if it doesn't load in 2 minutes, resolve anyway
      setTimeout(() => {
        if (!this.isReady) {
          console.warn("⚠️ Summarizer startup exceeded timeout. Proceeding...");
          resolve({ status: 'timeout' });
        }
      }, 120000);
      
      // Clean up child process on parent exit
      const killChild = () => {
        if (this.process) {
          console.log("🛑 Killing Python Summarizer subprocess...");
          this.process.kill('SIGINT');
          this.process = null;
          this.isReady = false;
        }
      };

      process.on('exit', killChild);
      process.on('SIGINT', () => {
        killChild();
        process.exit();
      });
      process.on('SIGTERM', () => {
        killChild();
        process.exit();
      });
      process.on('uncaughtException', (err) => {
        console.error("❌ Uncaught exception in main process:", err);
        killChild();
        process.exit(1);
      });
    });
  }

  async summarize(text) {
    if (!this.isReady) {
      throw new Error('Summarization model is not ready yet. Please wait a moment.');
    }

    return new Promise((resolve, reject) => {
      const postData = JSON.stringify({ text });
      
      const options = {
        hostname: '127.0.0.1',
        port: this.port,
        path: '/summarize',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 60000 // 60 seconds timeout for long summaries
      };

      const req = http.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseData);
            if (res.statusCode === 200) {
              resolve(parsed.summary);
            } else {
              reject(new Error(parsed.error || 'Summarizer server returned an error'));
            }
          } catch (e) {
            reject(new Error(`Failed to parse summary response: ${e.message}`));
          }
        });
      });

      req.on('error', (err) => {
        console.error("❌ Request to Python summarizer failed:", err);
        reject(new Error(`Connection to summarization service failed: ${err.message}`));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Summarization request timed out. Please try shorter text.'));
      });

      req.write(postData);
      req.end();
    });
  }
}

module.exports = new SummarizationService();