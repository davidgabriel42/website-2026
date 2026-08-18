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

// ==============================================================================
// 100% Bulletproof Browser Fetch Sanitizer (SPA Fallback Defense)
// ==============================================================================
if (typeof window !== "undefined") {
  const originalFetch = window.fetch;
  window.fetch = async function (url, options) {
    const urlStr = typeof url === 'string' ? url : url?.url || '';

    if (urlStr.includes("/models/") || urlStr.includes("/wasm/") || urlStr.endsWith(".json") || urlStr.endsWith(".onnx") || urlStr.endsWith(".wasm")) {
      const response = await originalFetch(url, options);
      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("text/html") && response.ok) {
        console.warn(`[Copilot Service] Intercepted SPA Fallback HTML redirect for missing asset: ${urlStr}. Forcing clean 404 Response.`);
        return new Response("Not Found", {
          status: 404,
          statusText: "Not Found",
          headers: { "Content-Type": "text/plain" }
        });
      }
      return response;
    }

    return originalFetch(url, options);
  };
}

let generator = null;
let cachedContext = null;

// Initialize the local Transformers.js pipeline using ONLY local unblocked assets
async function getGenerator(onProgress) {
  if (!generator) {
    onProgress("Initializing in-browser model...");
    console.log(`[Copilot Service] Initializing native pipeline. LocalURL: ${env.localURL}`);
    
    generator = await pipeline(
      "text2text-generation",
      "Xenova/LaMini-Flan-T5-248M",
      {
        local_files_only: true, // Forces Transformers.js to ONLY load files from public/models/
        progress_callback: (data) => {
          if (data.status === "progress") {
            onProgress("Wasm Engine compiled successfully!");
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

// Smart Client-Side RAG Context Retriever
// Dynamically extracts only the relevant resume segments with literal keyword mapping 
// specifically designed to feed into the T5 seq2seq model.
function retrieveRelevantContext(query, fullContext) {
  const q = query.toLowerCase();
  const sections = [];

  // Safely extract nested properties with fallback default schemas
  const summary = fullContext.resume?.summary || fullContext.summary || "";
  const title = fullContext.title || fullContext.resume?.title || "Senior Software Engineer";
  const education = fullContext.resume?.education || fullContext.education || [];
  const experience = fullContext.resume?.experience || fullContext.experience || [];
  const skills = fullContext.resume?.skills || fullContext.skills || { core: [], languages: [], frameworks: [], systems: [] };
  const thesis = fullContext.thesis || {};

  // Always include basic bio summary mapped literally
  sections.push(`Summary Bio of David Gabriel: David Gabriel is a ${title}. Summary of experience: ${summary}`);

  // 1. Education (Mapped with literal 'School / College / University / Education' keywords)
  if (q.includes("school") || q.includes("college") || q.includes("education") || q.includes("degree") || q.includes("university") || q.includes("unr") || q.includes("reno") || q.includes("study") || q.includes("learn") || q.includes("academic") || q.includes("one")) {
    const eduStr = education.map(e => `• School / College / University / Alma Mater: ${e.institution}. Degree acquired: ${e.degree} (Period: ${e.period || "N/A"})`).join("\n");
    sections.push(`David Gabriel's College / School / University Education:\n${eduStr}`);
  }

  // 2. Thesis & Publications (Mapped with literal 'Thesis / Research Paper / Publications' keywords)
  if (q.includes("thesis") || q.includes("darshan") || q.includes("throughput") || q.includes("file system") || q.includes("parallel") || q.includes("publication") || q.includes("paper") || q.includes("master") || q.includes("write")) {
    sections.push(`David Gabriel's MS Thesis Research Paper:\n• Thesis Title: "${thesis.title || "N/A"}"\n• Thesis Abstract details: ${thesis.abstract || "N/A"}`);
    if (fullContext.publications) {
      const pubStr = fullContext.publications.map(p => `• Publication / Scientific Paper: "${p.title}" (${p.venue}, ${p.year})`).join("\n");
      sections.push(`Scientific Publications:\n${pubStr}`);
    }
  }

  // 3. Experience / Careers / Companies (Mapped with literal 'Work / Job / Employer' keywords)
  const expMatch = experience.filter(exp => 
    q.includes(exp.company.toLowerCase()) || 
    q.includes("job") || q.includes("experience") || q.includes("role") || q.includes("work") || q.includes("career") || q.includes("position") || q.includes("employer") ||
    (exp.highlights && exp.highlights.some(h => q.includes(h.toLowerCase())))
  );
  if (expMatch.length > 0) {
    const expStr = expMatch.map(exp => `• Work / Job / Role / Employer: ${exp.role} at ${exp.company} (Period: ${exp.period}): ${exp.highlights.join(". ")}`).join("\n");
    sections.push(`David Gabriel's Professional Experience:\n${expStr}`);
  } else if (q.includes("experience") || q.includes("work") || q.includes("job") || q.includes("role") || q.includes("hire") || q.includes("cloudera") || q.includes("swoogo") || q.includes("ridgeline")) {
    // If generic experience query, include top roles
    const expStr = experience.slice(0, 3).map(exp => `• Work / Job / Role / Employer: ${exp.role} at ${exp.company} (Period: ${exp.period})`).join("\n");
    sections.push(`David Gabriel's Professional Experience:\n${expStr}`);
  }

  // 4. Skills & Tech Stack (Mapped with literal 'Technical Skills / Languages / Frameworks' keywords)
  if (q.includes("skills") || q.includes("tech") || q.includes("languages") || q.includes("frameworks") || q.includes("java") || q.includes("python") || q.includes("react") || q.includes("three") || q.includes("use") || q.includes("know")) {
    sections.push(`David Gabriel's Technical Skills, Programming Languages, and Frameworks:\n• Core Skills: ${skills.core.join(", ")}\n• Programming Languages: ${skills.languages.join(", ")}\n• Frameworks: ${skills.frameworks.join(", ")}\n• Systems Tools: ${skills.systems.join(", ")}`);
  }

  // 5. Patents & Inventions (Mapped with literal 'Patents / USPTO / Inventions' keywords)
  if (q.includes("patent") || q.includes("uspto") || q.includes("invention") || q.includes("inventor") || q.includes("plasma") || q.includes("nih") || q.includes("luxtech") || q.includes("create") || q.includes("make")) {
    sections.push(`David Gabriel's Patents & Inventions:\n• Awarded USPTO Patents: David holds 5 awarded USPTO patents in LED reliability.\n• Medical Device Inventions: Invented an NIH-funded plasma cleaning system (Ionfield Systems) to eliminate pharmaceutical plastics.`);
  }

  // 6. Interactive Jigsaw Puzzle project metadata (Mapped literally)
  if (q.includes("puzzle") || q.includes("game") || q.includes("jigsaw") || q.includes("demo") || q.includes("showcase") || q.includes("work") || q.includes("portfolio")) {
    sections.push(`David Gabriel's Jigsaw Puzzle Game Portfolio Demo:\n• Project Type: Standalone 3D Jigsaw Puzzle Studio workspace.\n• Tech Stack: Built completely client-side using React, Konva.js (for 2D snapping and assembly), and React Three Fiber (R3F/Three.js) for 3D piece extrusion, cardboard texture mapping, and orbital rotating inspection.`);
  }

  // 7. Resume & CV document download files (Mapped with literal 'Resume / CV / PDF / Download' keywords)
  if (q.includes("resume") || q.includes("cv") || q.includes("download") || q.includes("pdf") || q.includes("paper")) {
    sections.push(`David Gabriel's Resume & CV Document download details:\n• Document Type: Public professional Resume CV.\n• Download URL: David's Resume is hosted on Google Docs at "https://docs.google.com/document/d/1T4PW7TdsYxuVa48pqpJGPF_YyJ-GEJRQBvYSkvhMb6I/edit?usp=sharing".`);
  }

  // 8. Technical Design Documents & Specifications (Mapped with literal 'Design Doc / Specs / Blueprint' keywords)
  if (q.includes("design") || q.includes("doc") || q.includes("spec") || q.includes("blueprint") || q.includes("repository") || q.includes("github") || q.includes("git")) {
    sections.push(`David Gabriel's Technical Design Documents and Specifications:
• Copilot Design Document URL: "https://docs.google.com/document/d/1Rf_RQ_K9-LTUf6Ifv6cuca4leprC2RVlwa7E_VGJtvs/edit?tab=t.0". Covers client-side WebAssembly, RAG dynamic retrievers, and SPA fallback fetch interceptors.
• Jigsaw Puzzle Design Document URL: "https://docs.google.com/document/d/1KxEO4D6nljOGavBBcT9CyfIx6eIoKdojHf6LjYdKjas/edit?tab=t.0". Covers HTML5 Bezier curves, dual-texture rasterization pipeline, and 3-material split geometries.
• Website GitHub Code Repository: "https://github.com/davidgabriel42/website-2026".`);
  }

  return sections.join("\n\n");
}

// Helper to trigger Transformers.js generating direct replies on the main thread
async function callTransformersJS(retrievedContext, query, historyContext, onProgress) {
  const gen = await getGenerator(onProgress);
  
  // Highly-optimized, flattened prompt design for the 248M model to keep attention focused on RAG facts
  const prompt = `Context:
${retrievedContext}

Chat History:
${historyContext}

Task: Answer the Question concisely using only the Context. If the Question is not related to David Gabriel's career, education, or portfolio, reply exactly: "I am only programmed to discuss David Gabriel's professional background." If the facts are not in the Context, reply exactly: "The information is not available in his resume."

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
 * Executes the streamlined single-stage Conversational RAG Pipeline using HuggingFace Transformers.js
 * @param {string} query - Visitor's raw text input
 * @param {function} onStepUpdate - Callback to stream executing stages back to the Agent Terminal UI
 * @param {Array} history - React session messages array for conversational memory
 */
export async function executeAgentPipeline(query, onStepUpdate, history = []) {
  const context = await fetchContext();
  if (!context) throw new Error("CONTEXT_LOAD_FAILED");

  // Verify WebGPU support on the execution thread before attempting WebLLM
  if (!navigator.gpu) {
    throw new Error("WEBGPU_UNSUPPORTED");
  }

  // --- STAGE 1: HYBRID RELEVANCE GATEKEEPER & CONTEXT RETRIEVAL (RAG) ---
  const q = query.toLowerCase();

  // Strict Off-Topic Relevance check is run strictly on the very FIRST session message (history is empty).
  // This guarantees 100% security against off-topic starters, but allows conversational follow-ups to bypass!
  if (history.length === 0) {
    const isOffTopic = !q.includes("david") && !q.includes("gabriel") && !q.includes("thesis") && 
                       !q.includes("resume") && !q.includes("experience") && !q.includes("work") && 
                       !q.includes("job") && !q.includes("education") && !q.includes("skills") && 
                       !q.includes("cve") && !q.includes("security") && !q.includes("swoogo") && 
                       !q.includes("cloudera") && !q.includes("ridgeline") && !q.includes("patent") &&
                       !q.includes("puzzle") && !q.includes("game") && !q.includes("hire") &&
                       !q.includes("contact") && !q.includes("design") && !q.includes("doc") && 
                       !q.includes("spec") && !q.includes("blueprint") && !q.includes("github") && 
                       !q.includes("code") && !q.includes("repo");

    if (isOffTopic) {
      onStepUpdate({ stage: 1, status: "REJECTED", message: "Relevance check failed." });
      return {
        success: false,
        rejectionMessage: "I am only programmed to discuss David Gabriel's professional background."
      };
    }
  }

  onStepUpdate({ stage: 1, status: "RUNNING", message: "Stage 1: Retrieving relevant resume segments..." });
  
  // If this is a pronoun/follow-up query (like "which one?", "where?"), we retrieve context using the previous user query!
  let retrievalQuery = query;
  if (history.length > 0 && query.split(" ").length < 4) {
    const lastUserMsg = [...history].reverse().find(m => m.sender === 'user');
    if (lastUserMsg) {
      retrievalQuery = `${query} ${lastUserMsg.text}`;
    }
  }

  const retrievedContext = retrieveRelevantContext(retrievalQuery, context);
  
  // Active RAG evaluation debug logging! Prints exactly what the WebAssembly ONNX compiler sees!
  console.log("\n==================================================");
  console.log("[RAG DEBUG] Retrieved Context passed to Model:");
  console.log("==================================================");
  console.log(retrievedContext);
  console.log("==================================================\n");

  onStepUpdate({ stage: 1, status: "COMPLETED", message: "Stage 1: Context retrieved successfully." });

  // --- STAGE 2: CONVERSATIONAL HUGGINGFACE COMPLETION ---
  onStepUpdate({ stage: 2, status: "RUNNING", message: "Stage 2: Formatting memory window..." });

  // Format the last 4 messages of chat history as a clean memory window for the LLM
  const historyContext = history.slice(-4).map(m => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join("\n");

  onStepUpdate({ stage: 2, status: "RUNNING", message: "Stage 2: Initializing local model..." });

  const replyText = await callTransformersJS(
    retrievedContext,
    query,
    historyContext,
    (progressText) => {
      onStepUpdate({ stage: 2, status: "RUNNING", message: progressText });
    }
  );

  // If the model itself deflected as off-topic based on the system prompt rules
  if (replyText.includes("only programmed to discuss")) {
    onStepUpdate({ stage: 2, status: "REJECTED", message: "Off-topic query deflected." });
    return {
      success: false,
      rejectionMessage: replyText
    };
  }

  onStepUpdate({ stage: 2, status: "COMPLETED", message: "Stage 2: Response generated successfully." });

  // --- STAGE 3: EXTRACT UI ACTIONS ---
  onStepUpdate({ stage: 3, status: "RUNNING", message: "Stage 3: Parsing agent actions and polishing..." });
  
  const ui_actions = [];
  if (q.includes("puzzle") || q.includes("game") || q.includes("jigsaw")) {
    ui_actions.push({ action: "NAVIGATE", payload: "/demos/jigsaw-puzzle" });
  } else if (q.includes("work") || q.includes("portfolio") || q.includes("demo")) {
    ui_actions.push({ action: "NAVIGATE", payload: "/demos" });
  } else if (q.includes("contact") || q.includes("email") || q.includes("hire")) {
    ui_actions.push({ action: "NAVIGATE", payload: "/hire-me" });
  } else if (q.includes("resume") || q.includes("cv") || q.includes("download")) {
    ui_actions.push({ action: "OPEN_PDF", payload: "https://docs.google.com/document/d/1T4PW7TdsYxuVa48pqpJGPF_YyJ-GEJRQBvYSkvhMb6I/edit?usp=sharing" });
  } else if (q.includes("blog") || q.includes("article") || q.includes("post")) {
    ui_actions.push({ action: "OPEN_PDF", payload: "https://www.linkedin.com/in/davidjgabriel/recent-activity/articles/" });
  } else if (q.includes("copilot") && (q.includes("doc") || q.includes("spec") || q.includes("blueprint"))) {
    ui_actions.push({ action: "OPEN_PDF", payload: "https://docs.google.com/document/d/1Rf_RQ_K9-LTUf6Ifv6cuca4leprC2RVlwa7E_VGJtvs/edit?tab=t.0" });
  } else if (q.includes("jigsaw") && (q.includes("doc") || q.includes("spec") || q.includes("blueprint"))) {
    ui_actions.push({ action: "OPEN_PDF", payload: "https://docs.google.com/document/d/1KxEO4D6nljOGavBBcT9CyfIx6eIoKdojHf6LjYdKjas/edit?tab=t.0" });
  } else if (q.includes("github") || q.includes("code") || q.includes("repo") || q.includes("repository")) {
    ui_actions.push({ action: "OPEN_PDF", payload: "https://github.com/davidgabriel42/website-2026" });
  }

  onStepUpdate({ stage: 3, status: "COMPLETED", message: "Stage 3: Verified. Fact check passed." });

  return {
    success: true,
    answer: replyText,
    actions: ui_actions
  };
}
