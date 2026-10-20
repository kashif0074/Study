# AI Summarization Model Cache

Due to GitHub's 100 MB file limit, model weight files (e.g. `model.safetensors`) are excluded from Git tracking.

### Directory Structure
```
backend/models_cache/
└── StudySpark_summarization/
    ├── config.json
    ├── generation_config.json
    ├── model.safetensors       <-- Place your downloaded/fine-tuned model weights here (~944 MB)
    ├── tokenizer.json
    └── tokenizer_config.json
```

### Running the Python Summarizer
1. Ensure Python 3.8+ is installed.
2. Run the environment setup script:
   ```powershell
   cd backend
   .\setup_env.ps1
   ```
3. When the Node.js backend starts (`npm start` or `node server.js`), it will automatically launch `backend/services/summarizer.py` using this model directory.
