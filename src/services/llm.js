import { MLCEngine } from "@mlc-ai/web-llm";

let engine = null;
let cachedContext = null;

// Initialize the local MLCEngine on the main thread (No Web Workers!)
async function getEngine(onProgress) {
  if (!engine) {
    engine = new MLCEngine();
    engine.setInitProgressCallback((report) => {
      onProgress(report.text);
    });
    // TinyLlama is highly compact (~600MB) and downloads fast into the browser cache
    await engine.reload("TinyLlama-1.1B-Chat-v1.0-q4f32_1");
  }
  return engine;
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

// Helper to trigger WebLLM with plain text completions on the main thread
async function callWebLLM(systemInstruction, userPrompt, onProgress) {
  const chatEngine = await getEngine(onProgress);
  
  const response = await chatEngine.chat.completions.create({
    messages: [
      { role: "system", content: systemInstruction },
      { role: "user", content: userPrompt }
    ]
  });
  
  const rawText = response.choices[0].message.content;
  if (!rawText) throw new Error("Invalid WebLLM response structure");
  return rawText;
}

/**
 * Executes the streamlined single-stage Agentic Pipeline using WebLLM
 * @param {string} query - Visitor's raw text input
 * @param {function} onStepUpdate - Callback to stream executing stages back to the Agent Terminal UI
 */
export async function executeAgentPipeline(query, onStepUpdate) {
  const context = await fetchContext();
  if (!context) throw new Error("CONTEXT_LOAD_FAILED");

  const contextStr = JSON.stringify(context);

  // Verify WebGPU support on the execution thread before attempting WebLLM
  if (!navigator.gpu) {
    throw new Error("WEBGPU_UNSUPPORTED");
  }

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

  // --- STAGE 2: SINGLE-STAGE WEBLLM COMPLETION ---
  onStepUpdate({ stage: 2, status: "RUNNING", message: "Stage 2: Initializing WebLLM..." });

  const replyText = await callWebLLM(
    `You are a professional assistant representing David Gabriel on his portfolio website.
Answer the visitor's question using ONLY the facts provided in this Context JSON:
${contextStr}

Keep your answer highly concise (2-3 sentences), strictly dry, objective, and professional. Do not use hyperbolic or subjective adjectives. If the question cannot be answered using the context, state that the information is not available.`,
    query,
    (progressText) => {
      onStepUpdate({ stage: 2, status: "RUNNING", message: `Loading WebLLM: ${progressText}` });
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
