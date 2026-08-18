const { pipeline, env } = require('@xenova/transformers');
const path = require('path');

// Configure Transformers.js to load strictly from our local public models directory
env.allowLocalModels = true;
env.localModelRegexp = /.*/;
// Node.js hub resolver reads 'localModelPath' for system files!
env.localModelPath = path.resolve(__dirname, '../public/models/');

// Mock a console progress callback
const onProgress = (text) => {
  console.log(`[WASM Progress] ${text}`);
};

async function testLocalAI() {
  console.log("==================================================");
  console.log("Starting Local WebAssembly ONNX Engine Test...");
  console.log("==================================================");

  try {
    console.log("Loading local T5 model from public/models/Xenova/LaMini-Flan-T5-77M ...");
    const generator = await pipeline(
      "text2text-generation",
      "Xenova/LaMini-Flan-T5-77M",
      {
        local_files_only: true, // Force it to only load local files!
        progress_callback: (data) => {
          if (data.status === "progress") {
            const pct = Math.round(data.progress);
            onProgress(`Loading weights... ${pct}%`);
          } else if (data.status === "ready") {
            onProgress("WebAssembly engine compiled successfully!");
          }
        }
      }
    );

    // Minified David Gabriel context
    const contextSummary = `David Gabriel is a Senior Software Engineer with 13+ years of experience. 
He holds an MS in CS (thesis: Throughput Prediction on Parallel File Systems using ML) and a BS in EE. 
Current role: Software Engineer at Ridgeline Apps (Feb 2026 - Current) focusing on report generation performance tuning using Java, Kotlin, and LLMs. 
Previous role: Sr. Software Engineer & AI Security Champion at Cloudera (Sept 2022 - Oct 2025) building Agentic Security CVE scanners. 
Previous role: Software Engineer II at Swoogo (May 2021 - Sept 2022) designing OIDC MFA and PCI payments. 
He holds 5 USPTO patents.`;

    const query = "what is david's current role?";
    const prompt = `You are a professional assistant representing David Gabriel. 
Answer the question using ONLY these facts: ${contextSummary}. 
Question: ${query}
Answer:`;

    console.log("\n--------------------------------------------------");
    console.log(`Sending Prompt: "${query}"`);
    console.log("--------------------------------------------------");

    console.log("Reasoning over local facts...");
    const out = await generator(prompt, {
      max_new_tokens: 150,
      temperature: 0.3,
      repetition_penalty: 1.2
    });

    const replyText = out[0]?.generated_text;
    console.log("\n==================================================");
    console.log("AI RESPONSE GENERATED SUCCESSFULLY!");
    console.log("==================================================");
    console.log(`Answer: "${replyText}"`);
    console.log("==================================================\n");

    if (replyText && replyText.toLowerCase().includes("ridgeline")) {
      console.log("✓ TEST PASSED: Model correctly identified David's current role!");
    } else {
      console.log("✕ TEST FAILED: Model returned an unexpected answer.");
      process.exit(1);
    }

  } catch (err) {
    console.error("✕ TEST CRASHED: ONNX engine runtime error:", err);
    process.exit(1);
  }
}

testLocalAI();
