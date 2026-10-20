# StudySpark Python Environment Setup Script
# Creates a local virtual environment and installs the required packages for running the T5 summarizer.

$ErrorActionPreference = "Stop"

Write-Host "[START] Starting StudySpark Python Environment Setup..." -ForegroundColor Cyan

# Check if Python is installed
try {
    $pythonVersion = python --version
    Write-Host "[INFO] Found global Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Error "[ERROR] Python is not installed or not in PATH! Please install Python 3.8+."
    exit 1
}

# Define venv path
$venvPath = Join-Path $PSScriptRoot ".venv"
$pipExe = Join-Path $venvPath "Scripts\pip.exe"
$pythonExe = Join-Path $venvPath "Scripts\python.exe"

# Create virtual environment if it doesn't exist
if (-not (Test-Path $venvPath)) {
    Write-Host "[INFO] Creating Python virtual environment in .venv..." -ForegroundColor Yellow
    python -m venv $venvPath
    Write-Host "[SUCCESS] Virtual environment created." -ForegroundColor Green
} else {
    Write-Host "[INFO] Virtual environment already exists at .venv" -ForegroundColor Green
}

# Upgrade pip
Write-Host "[INFO] Upgrading pip..." -ForegroundColor Yellow
Start-Process -FilePath $pythonExe -ArgumentList "-m pip install --upgrade pip" -NoNewWindow -Wait

# Install dependencies
Write-Host "[INFO] Installing required AI packages (torch, transformers, safetensors, sentencepiece)..." -ForegroundColor Yellow
Write-Host "[INFO] Note: This might take a few minutes as PyTorch is a large package." -ForegroundColor Cyan

# We'll use CPU-only PyTorch by default to save download size (~150MB instead of ~2.5GB)
Start-Process -FilePath $pipExe -ArgumentList "install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu" -NoNewWindow -Wait
Start-Process -FilePath $pipExe -ArgumentList "install transformers safetensors sentencepiece" -NoNewWindow -Wait

Write-Host "[SUCCESS] Environment setup completed successfully!" -ForegroundColor Green
Write-Host "[SUCCESS] The virtual environment is ready to use!" -ForegroundColor Cyan
