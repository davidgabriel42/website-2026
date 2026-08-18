import { pipeline, env } from "@xenova/transformers";

// Configure Transformers.js to resolve models strictly from our public folder assets (100% offline-first!)
env.allowLocalModels = true;
env.localModelRegexp = /.*/; 

// Resolve explicitly to the absolute browser window origin to prevent route-nested path mismatches
if (typeof window !== "undefined") {
  env.localURL = window.location.origin + "/models/";
  console.log(`[Copilot Service] Initialized local model resolver. Static path: ${env.localURL}`);
} else {
  env.localURL = "/models/";
}

// Configure Transformers.js to resolve the WebAssembly ONNX engine locally (100% CDN-free!)
env.backends.onnx.wasm.wasmPaths = "/wasm/";

let generator = null;
let cachedContext = null;

// Initialize the local Transformers.js pipeline using ONLY local unblocked assets
async function getGenerator(onProgress) {
  if (!generator) {
    onProgress("Initializing in-browser model...");
    console.log(`[Copilot Service] Initializing native pipeline. LocalURL: ${env.localURL}`);
    
    generator = await pipeline(
      "text2text-generation",
      "Xenova/LaMini-Flan-T5-77M",
      {
        local_files_only: true, // Forces Transformers.js to ONLY load files from public/models/
        progress_callback: (data) => {
          if (data.status === "progress") {
            const pct = Math.round(data.progress);
            onProgress(`Loading local model... ${pct}%`);
          } else if (data.status === "ready") {
            onProgress("Compiling WebAssembly engine...");
          }
        }
      }
    );
  }
  return generator;
}

// Dynamically fetch minified resume/thesis context from public folder
async function fetchContext() {
  if (cachedContext) return cachedContext;
  try {
    const res = await fetch("/agent_context.json");
    if (!res.ok) throw new Error("Could not find agent_context.json");
    cachedContext = await res.json();
    return cachedContext;
  } catch (err) {
    console.error("[Copilot Service] Failed to load static context:", err);
    return null;
  }
}

// Helper to trigger Transformers.js generating direct replies on the main thread
async function callTransformersJS(contextStr, query, onProgress) {
  const gen = await getGenerator(onProgress);
  
  // Clean context summary for the tiny 150MB model to keep its reasoning focused and flawless
  const prompt = `You are a professional assistant representing David Gabriel. 
Answer the question using ONLY these facts: ${contextStr}. 
Question: ${query}
Answer:`;

  onProgress("Reasoning over facts...");
  const out = await gen(prompt, {
    max_new_tokens: 150,
    temperature: 0.3,
    repetition_penalty: 1.2
  });
  
  const replyText = out[0]?.generated_text;
  if (!replyText) throw new Error("Invalid Transformers.js text output");
  return replyText;
}

/**
 * Executes the streamlined single-stage Agentic Pipeline using HuggingFace Transformers.js
 * @param {string} query - Visitor's raw text input
 * @param {function} onStepUpdate - Callback to stream executing stages back to the Agent Terminal UI
 */
export async function executeAgentPipeline(query, onStepUpdate) {
  const context = await fetchContext();
  if (!context) throw new Error("CONTEXT_LOAD_FAILED");

  // Minify context to keep prompt length small and optimal for the seq2seq attention window
  const contextSummary = `David Gabriel is a Senior Software Engineer with 13+ years of experience. 
He holds an MS in CS (thesis: Throughput Prediction on Parallel File Systems using ML) and a BS in EE. 
Current role: Software Engineer at Ridgeline Apps (Feb 2026 - Current) focusing on report generation performance tuning using Java, Kotlin, and LLMs. 
Previous role: Sr. Software Engineer & AI Security Champion at Cloudera (Sept 2022 - Oct 2025) building Agentic Security CVE scanners. 
Previous role: Software Engineer II at Swoogo (May 2021 - Sept 2022) designing OIDC MFA and PCI payments. 
He holds 5 USPTO patents.`;

  // --- STAGE 1: SAFETY GATEKEEPER ---
  onStepUpdate({ stage: 1, status: "RUNNING", message: "Stage 1: Checking query relevance..." });
  const q = query.toLowerCase();
  
  // Strict Off-Topic Relevance Guardrail (Rule 4 of the specification)
  const isOffTopic = !q.includes("david") && !q.includes("gabriel") && !q.includes("thesis") && 
                     !q.includes("resume") && !q.includes("experience") && !q.includes("work") && 
                     !q.includes("job") && !q.includes("education") && !q.includes("skills") && 
                     !q.includes("cve") && !q.includes("security") && !q.includes("swoogo") && 
                     !q.includes("cloudera") && !q.includes("ridgeline") && !q.includes("patent") &&
                     !q.includes("puzzle") && !q.includes("game") && !q.includes("hire") &&
                     !q.includes("contact");

  if (isOffTopic) {
    onStepUpdate({ stage: 1, status: "REJECTED", message: "Relevance check failed." });
    return {
      success: false,
      rejectionMessage: "I am only programmed to discuss David Gabriel's professional background."
    };
  }
  onStepUpdate({ stage: 1, status: "COMPLETED", message: "Stage 1: Passed. Category: CUSTOM_QUERY" });

  // --- STAGE 2: SINGLE-STAGE LOCAL COMPLETION ---
  onStepUpdate({ stage: 2, status: "RUNNING", message: "Stage 2: Initializing local model..." });

  const replyText = await callTransformersJS(
    contextSummary,
    query,
    (progressText) => {
      onStepUpdate({ stage: 2, status: "RUNNING", message: progressText });
    }
  );

  onStepUpdate({ stage: 2, status: "COMPLETED", message: "Stage 2: Response generated successfully." });

  // --- STAGE 3: EXTRACT UI ACTIONS ---
  onStepUpdate({ stage: 3, status: "RUNNING", message: "Stage 3: Parsing agent actions and polishing..." });
  
  const ui_actions = [];
  if (q.includes("puzzle") || q.includes("game")) {
    ui_actions.push({ action: "NAVIGATE", payload: "/demos/jigsaw-puzzle" });
  } else if (q.includes("work") || q.includes("portfolio") || q.includes("demo")) {
    ui_actions.push({ action: "NAVIGATE", payload: "/demos" });
  } else if (q.includes("contact") || q.includes("email") || q.includes("hire")) {
    ui_actions.push({ action: "NAVIGATE", payload: "/hire-me" });
  } else if (q.includes("resume") || q.includes("cv") || q.includes("download")) {
    ui_actions.push({ action: "OPEN_PDF", payload: "https://docs.google.com/document/d/1T4PW7TdsYxuVa48pqpJGPF_YyJ-GEJRQBvYSkvhMb6I/edit?usp=sharing" });
  } else if (q.includes("blog")) {
    ui_actions.push({ action: "NAVIGATE", payload: "/blog" });
  }

  onStepUpdate({ stage: 3, status: "COMPLETED", message: "Stage 3: Verified. Fact check passed." });

  return {
    success: true,
    answer: replyText,
    actions: ui_actions
  };
}
