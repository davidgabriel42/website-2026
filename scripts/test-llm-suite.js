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

// ==============================================================================
// REPRODUCTION MOCK FETCH
// Mimics Webpack DevServer's SPA historyApiFallback.
// If a file is missing, it serves an HTML page with Status 200 (OK).
// This will successfully reproduce the "Unexpected token <" JSON parsing crash!
// ==============================================================================
global.fetch = async (url, options) => {
  const urlStr = typeof url === 'string' ? url : url?.url || '';

  if (urlStr.startsWith("/")) {
    try {
      const filePath = path.resolve(__dirname, '../public', urlStr.substring(1));
      
      // If the file actually exists, return it with 200
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        return {
          ok: true,
          status: 200,
          headers: { get: () => "application/json" },
          json: async () => JSON.parse(content),
          text: async () => content
        };
      }
      
      // Mimic SPA fallback: if the file is missing, return a Mock HTML page with 200 (OK)!
      console.log(`[Reproduction Log] SPA Fallback triggered for missing file: ${urlStr}`);
      const mockHtmlPage = "<!DOCTYPE html><html><body>SPA Fallback Page</body></html>";
      return {
        ok: true,
        status: 200,
        headers: { get: () => "text/html" },
        json: async () => {
          // This will throw the exact "Unexpected token <" error!
          return JSON.parse(mockHtmlPage);
        },
        text: async () => mockHtmlPage
      };
      
    } catch (err) {
      throw err;
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
  }
];

// Silent progress logger mock for the test suite runner
const mockProgressCallback = () => {};

async function runLLMTestSuite() {
  console.log("==================================================");
  console.log("REPRODUCING THE BROWSER COMPILATION ERROR...");
  console.log("==================================================");

  try {
    const { executeAgentPipeline } = await import('../src/services/llm.js');

    const tc = TEST_CASES[0];
    console.log(`\nEvaluating: "${tc.name}"`);
    console.log(`Query: "${tc.query}"`);
    console.log(`--------------------------------------------------`);

    const result = await executeAgentPipeline(tc.query, mockProgressCallback);
    tc.assert(result);
    console.log(`✓ RESULT: PASSED!`);

  } catch (err) {
    console.error(`\n==================================================`);
    console.error(`✕ REPRODUCTION SUCCESSFUL! Error caught:`);
    console.error(`==================================================`);
    console.error(err.message || err);
    console.error(`==================================================\n`);
    process.exit(0); // Exit cleanly as we wanted to catch this error!
  }
}

runLLMTestSuite();
