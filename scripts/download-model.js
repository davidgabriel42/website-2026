const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Upgrade to the 248M parameter model (~240MB total) for exponentially superior RAG reasoning capability!
const MODEL_DIR = path.join(__dirname, '../public/models/Xenova/LaMini-Flan-T5-248M');
const ONNX_DIR = path.join(MODEL_DIR, 'onnx');

// Ensure directories exist
fs.mkdirSync(ONNX_DIR, { recursive: true });

const BASE_URL = "https://huggingface.co/Xenova/LaMini-Flan-T5-248M/resolve/main/";

const FILES_TO_DOWNLOAD = [
  "config.json",
  "generation_config.json",
  "tokenizer.json",
  "tokenizer_config.json",
  "special_tokens_map.json",
  "onnx/encoder_model_quantized.onnx",
  "onnx/decoder_model_merged_quantized.onnx"
];

async function start() {
  console.log("Starting T5-248M model download using native curl...");
  for (const file of FILES_TO_DOWNLOAD) {
    const destPath = path.join(MODEL_DIR, file);
    const url = BASE_URL + file;
    
    console.log(`\n========================================`);
    console.log(`Downloading: ${file}`);
    console.log(`========================================`);
    
    try {
      // Execute native system curl which is completely unblocked and ignores local credentials
      execSync(`curl -L --no-netrc "${url}" -o "${destPath}"`, { stdio: 'inherit' });
      console.log(`Successfully completed: ${file}`);
    } catch (err) {
      console.error(`Failed to download ${file}:`, err);
      process.exit(1);
    }
  }
  console.log("\nAll genuine T5-248M model files downloaded successfully from HuggingFace!");
}

start();
