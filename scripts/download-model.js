const fs = require('fs');
const path = require('path');
const https = require('https');

const MODEL_DIR = path.join(__dirname, '../public/models/Xenova/LaMini-Flan-T5-78M');
const ONNX_DIR = path.join(MODEL_DIR, 'onnx');

// Ensure directories exist
fs.mkdirSync(ONNX_DIR, { recursive: true });

// Use the public, unrestricted HuggingFace mirror domain to bypass local gateway blocks!
const BASE_URL = "https://hf-mirror.com/Xenova/LaMini-Flan-T5-78M/resolve/main/";

const FILES_TO_DOWNLOAD = [
  "config.json",
  "tokenizer.json",
  "tokenizer_config.json",
  "special_tokens_map.json",
  "onnx/model_quantized.onnx"
];

function downloadFile(fileSubPath) {
  return new Promise((resolve, reject) => {
    const destPath = path.join(MODEL_DIR, fileSubPath);
    const url = BASE_URL + fileSubPath;

    console.log(`Downloading from mirror: ${url} ...`);
    const file = fs.createWriteStream(destPath);

    https.get(url, (response) => {
      // Handle all redirect codes cleanly (301, 302, 307, 308)
      if ([301, 302, 307, 308].includes(response.statusCode)) {
        https.get(response.headers.location, (redirectResponse) => {
          redirectResponse.pipe(file);
          file.on('finish', () => {
            file.close();
            console.log(`Completed: ${fileSubPath}`);
            resolve();
          });
        }).on('error', (err) => {
          fs.unlinkSync(destPath);
          reject(err);
        });
        return;
      }

      if (response.statusCode !== 200) {
        fs.unlinkSync(destPath);
        reject(new Error(`Failed to get from mirror '${url}' (Status ${response.statusCode})`));
        return;
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Completed: ${fileSubPath}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlinkSync(destPath);
      reject(err);
    });
  });
}

async function start() {
  try {
    for (const file of FILES_TO_DOWNLOAD) {
      await downloadFile(file);
    }
    console.log("All model static assets downloaded successfully from mirror into public/models!");
  } catch (err) {
    console.error("Download failed:", err);
    process.exit(1);
  }
}

start();
