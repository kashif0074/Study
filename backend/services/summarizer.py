import os
import sys
import json
import argparse
from http.server import HTTPServer, BaseHTTPRequestHandler
import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

# Force UTF-8 encoding for stdout and stderr to prevent encoding errors on Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Resolve model path relative to this script
script_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.normpath(os.path.join(script_dir, '../models_cache/StudySpark_summarization'))

print(f"🎬 Loading T5 model from: {model_path}", flush=True)

try:
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model path does not exist: {model_path}")
        
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_path)
    
    if torch.cuda.is_available():
        model = model.to('cuda')
        print("🚀 Model loaded successfully on GPU (CUDA).", flush=True)
    else:
        print("💻 Model loaded successfully on CPU.", flush=True)
        
except Exception as e:
    print(f"❌ Error loading model: {e}", file=sys.stderr, flush=True)
    sys.exit(1)

class SummarizeHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Suppress standard logging to avoid cluttering node output
        pass

    def do_POST(self):
        if self.path == '/summarize':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                req = json.loads(post_data.decode('utf-8'))
                text = req.get('text', '')
                
                if not text or not text.strip():
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'error': 'No text provided'}).encode('utf-8'))
                    return
                
                # Tokenize and generate summary
                # Prefixing with "summarize: " is standard for T5 models
                inputs = tokenizer("summarize: " + text, return_tensors="pt", max_length=512, truncation=True)
                
                if torch.cuda.is_available():
                    inputs = {k: v.to('cuda') for k, v in inputs.items()}
                
                # Get number of input tokens to dynamically adjust summary size
                input_token_len = inputs["input_ids"].shape[1]
                
                # Calculate dynamic min and max lengths:
                # - For short text: generates a shorter summary (e.g. min 25, max 80 tokens)
                # - For longer text: scales up (e.g. min 80, max 250 tokens)
                dynamic_min = min(80, max(25, int(input_token_len * 0.25)))
                dynamic_max = min(250, max(80, int(input_token_len * 0.6)))
                
                # Ensure min_length is strictly less than max_length
                if dynamic_min >= dynamic_max:
                    dynamic_min = max(10, int(dynamic_max * 0.4))
                
                outputs = model.generate(
                    inputs["input_ids"],
                    max_length=dynamic_max,
                    min_length=dynamic_min,
                    num_beams=4,
                    length_penalty=1.5,           # Encourages generation of longer sentences
                    no_repeat_ngram_size=3,       # Prevents repeating 3-word combinations
                    early_stopping=True
                )
                
                summary = tokenizer.decode(outputs[0], skip_special_tokens=True)
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'summary': summary}).encode('utf-8'))
                
            except Exception as e:
                print(f"❌ Summarization Error: {e}", file=sys.stderr, flush=True)
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def do_GET(self):
        if self.path == '/status':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'ready'}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

def run():
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=5001, help='Port to run the summarizer server on')
    args = parser.parse_args()
    
    server_address = ('127.0.0.1', args.port)
    try:
        httpd = HTTPServer(server_address, SummarizeHandler)
        print(f"🤖 Summarizer server running on port {args.port}...", flush=True)
        sys.stdout.flush()
        httpd.serve_forever()
    except Exception as e:
        print(f"❌ Failed to start HTTP server: {e}", file=sys.stderr, flush=True)
        sys.exit(1)

if __name__ == '__main__':
    run()
