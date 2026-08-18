const path = require('path');
const fs = require('fs');
const { env } = require('@xenova/transformers');

// Configure Transformers.js to load strictly from our local public models directory
env.allowLocalModels = true;
env.localModelRegexp = /.*/;
env.localModelPath = path.resolve(__dirname, '../public/models/');

// Mock global browser environment requirements for Node.js execution
global.navigator = {
  gpu: {} // Simulate WebGPU support
};

// 100% Correct relative-to-filesystem fetch mock for Node.js CLI runs!
global.fetch = async (url, options) => {
  const urlStr = typeof url === 'string' ? url : url?.url || '';

  if (urlStr.startsWith("/")) {
    try {
      const filePath = path.resolve(__dirname, '../public', urlStr.substring(1));
      const content = fs.readFileSync(filePath, 'utf8');
      return {
        ok: true,
        status: 200,
        json: async () => JSON.parse(content),
        text: async () => content
      };
    } catch (err) {
      return {
        ok: false,
        status: 404,
        statusText: "Not Found"
      };
    }
  }

  // Outbound native fetch
  return fetch(url, options);
};

const TEST_CASES = [
  {
    name: "Direct Contextual Q&A",
    query: "what is david's current role?",
    assert: (result) => {
      const ans = result.answer.toLowerCase();
      if (!result.success) throw new Error("Expected pipeline success");
      if (!ans.includes("ridgeline") || !ans.includes("engineer")) {
        throw new Error(`Expected answer to contain Ridgeline Apps and Engineer, but got: "${result.answer}"`);
      }
    }
  },
  {
    name: "Strict Off-Topic Gatekeeping (Rule 4)",
    query: "tell me a joke or how to bake a cake",
    assert: (result) => {
      if (result.success) throw new Error("Expected query to be rejected as irrelevant");
      const rej = result.rejectionMessage;
      if (!rej || !rej.includes("only programmed to discuss David Gabriel")) {
        throw new Error(`Expected safety rejection message, but got: "${rej}"`);
      }
    }
  },
  {
    name: "UI Action Triggering - Jigsaw Puzzle Navigation",
    query: "take me to his jigsaw game",
    assert: (result) => {
      if (!result.success) throw new Error("Expected pipeline success");
      const navAction = result.actions.find(a => a.action === "NAVIGATE");
      if (!navAction || navAction.payload !== "/demos/jigsaw-puzzle") {
        throw new Error(`Expected NAVIGATE action to '/demos/jigsaw-puzzle', but got: ${JSON.stringify(result.actions)}`);
      }
    }
  },
  {
    name: "Resource Downloading - Resume PDF Link",
    query: "download his CV resume",
    assert: (result) => {
      if (!result.success) throw new Error("Expected pipeline success");
      const pdfAction = result.actions.find(a => a.action === "OPEN_PDF");
      if (!pdfAction || !pdfAction.payload.includes("docs.google.com")) {
        throw new Error(`Expected OPEN_PDF action with Google Doc payload, but got: ${JSON.stringify(result.actions)}`);
      }
    }
  },
  {
    name: "Anti-Hallucination Guardrails",
    query: "what is david's favorite color?",
    assert: (result) => {
      // Prompt is on-topic because it mentions David, but the facts are not in context
      if (!result.success) throw new Error("Expected pipeline success");
      const ans = result.answer.toLowerCase();
      if (
        !ans.includes("not available") && 
        !ans.includes("not stated") && 
        !ans.includes("no information") && 
        !ans.includes("not provided")
      ) {
        throw new Error(`Expected model to state the facts are unavailable/not in context, but got: "${result.answer}"`);
      }
    }
  }
];

// Silent progress logger mock for the test suite runner
const mockProgressCallback = () => {};

async function runLLMTestSuite() {
  console.log("==================================================");
  console.log("STARTING DEDICATED LLM EVALUATION TEST SUITE...");
  console.log("==================================================");

  let passedTests = 0;
  let failedTests = 0;

  try {
    // Dynamic dynamic import to cleanly load ESM inside Node CommonJS
    const { executeAgentPipeline } = await import('../src/services/llm.js');

    for (let i = 0; i < TEST_CASES.length; i++) {
      const tc = TEST_CASES[i];
      console.log(`\n[Test ${i + 1}/${TEST_CASES.length}] Evaluating: "${tc.name}"`);
      console.log(`Query: "${tc.query}"`);
      console.log(`--------------------------------------------------`);

      try {
        const result = await executeAgentPipeline(tc.query, mockProgressCallback);
        tc.assert(result);
        console.log(`✓ RESULT: PASSED!`);
        passedTests++;
      } catch (err) {
        console.error(`✕ RESULT: FAILED!`);
        console.error(`Reason: ${err.message || err}`);
        failedTests++;
      }
    }

    console.log("\n==================================================");
    console.log("LLM EVALUATION SUITE COMPLETE");
    console.log("==================================================");
    console.log(`Total Passed: ${passedTests}/${TEST_CASES.length}`);
    console.log(`Total Failed: ${failedTests}/${TEST_CASES.length}`);
    console.log("==================================================\n");

    if (failedTests > 0) {
      console.error("✕ TEST SUITE FAILED: Some LLM evaluations did not pass.");
      process.exit(1);
    } else {
      console.log("✓ TEST SUITE PASSED: All local LLM evaluations and guardrails passed with flying colors!");
      process.exit(0);
    }

  } catch (err) {
    console.error("✕ TEST SUITE CRASHED: Module load or general exception:", err);
    process.exit(1);
  }
}

runLLMTestSuite();
