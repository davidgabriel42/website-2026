# David Gabriel: Personal Portfolio & Engineering Workspace

A client-side portfolio website showcasing advanced interactive full-stack and systems engineering capabilities. This workspace runs entirely in the user's browser with zero server-side or database hosting dependencies.

---

## Engineering Links and Assets

*   **Professional Resume and CV (Google Docs):** https://docs.google.com/document/d/1T4PW7TdsYxuVa48pqpJGPF_YyJ-GEJRQBvYSkvhMb6I/edit?usp=sharing
*   **Conversational RAG Copilot Design Specification:** https://docs.google.com/document/d/1Rf_RQ_K9-LTUf6Ifv6cuca4leprC2RVlwa7E_VGJtvs/edit?tab=t.0
*   **3D Jigsaw Studio Design Specification:** https://docs.google.com/document/d/1KxEO4D6nljOGavBBcT9CyfIx6eIoKdojHf6LjYdKjas/edit?tab=t.0
*   **Active Website Code Repository:** https://github.com/davidgabriel42/website-2026
*   **LinkedIn Professional Profile:** https://www.linkedin.com/in/davidjgabriel/
*   **Technical Articles and Dev Blog:** https://www.linkedin.com/in/davidjgabriel/recent-activity/articles/

---

## Architectural Systems Overview

### 1. Browser-Native Conversational RAG Copilot

The portfolio copilot is a client-side Conversational Retrieval-Augmented Generation (RAG) agent. It operates offline-first using WebAssembly compilation runtimes to run deep inference directly inside the client browser.

*   **Engine Core:** Upgraded from small models to Xenova/LaMini-Flan-T5-248M (quantized 8-bit ONNX weights, approximately 240MB) to achieve a 3.2x increase in reasoning depth, permitting precise multi-turn pronoun resolutions.
*   **Dynamic RAG Retriever:** Extracts relevant chunks from a minified professional corpus schema (public/agent_context.json) on-demand using exact keyword-aligned query mappings.
*   **100% Offline Runtimes:** All WebAssembly ONNX runtimes are packaged locally within public/wasm/, eliminating third-party Content Delivery Network (CDN) blocks or latency.
*   **SPA Fallback Defense:** Intercepts Webpack Single Page Application (SPA) redirects that serve index.html text/html responses for missing optional files, converting them to clean 404 responses to prevent JSON parser failures.
*   **Relevance Gatekeeping:** Utilizes a hybrid validation flow. First-message queries undergo strict Javascript keyword checks to deflect off-topic entries. Subsequent multi-turn dialogues are contextually moderated by the language model's integrated instructions.

### 2. Standalone 3D Jigsaw Puzzle Studio

The 3D Jigsaw Puzzle Studio is a dual-stage simulator combining a high-performance 2D board with a real-time 3D piece inspector.

*   **Bezier Curve Slicing:** Dynamically divides any loaded texture into a 4x4 coordinate grid and traces interlocking boundary vectors using a mathematically modeled Cubic Bezier Curve algorithm.
*   **Dual-Texture Pipeline:** Splites rasterization routines. High-performance, pre-clipped transparent canvases are routed to the 2D Konva.js board, while the raw unclipped texture is loaded inside the WebGL shader and cropped dynamically in UV coordinate space.
*   **Custom 3-Material Extrusion:** Re-indexes extruded geometries in React Three Fiber (R3F) to split face materials. Group 0 (front cap) displays the unclipped high-resolution image texture; Group 1 (side bevels) renders a solid, customizable cardboard edge; Group 2 (back cap) maps a solid cardboard color simulation.
*   **Automated Raster Solver:** Features a sequential solver utilizing frame-by-frame interpolation to solve scrambled pieces in grid order.

---

## Developer Operations Manual

### Local Installation

Clone the repository and install all npm dependencies locally:

```bash
git clone https://github.com/davidgabriel42/website-2026.git
cd personal-website
npm install
```

### Running the Workspace

Execute the development server. The CRACO-configured PostCSS compiler will execute, compiling Tailwind CSS v4 and DaisyUI configurations natively:

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the workspace inside your browser.

---

## Quality Assurance & Automated Testing

### 1. Jest React UI Unit Tests
Run the component test runner to verify UI widget mounting, button clicks, and Avatar rendering properties:

```bash
npm test -- --watchAll=false
```

### 2. Node.js RAG Evaluation Suite
Run the dedicated offline RAG test suite in Node.js to evaluate context retrievals, conversational memory, pronoun resolutions, safety deflection guardrails, and direct link actions:

```bash
node scripts/test-llm-suite.js
```

### 3. GitHub Actions CI Pipeline
The repository features an automated continuous integration pipeline (.github/workflows/ci.yml) targeting Node.js 24. On every push and pull request, the runner executes:
*   Standard dependency checkouts.
*   A complete compilation test (npm run build).
*   The automated Jest unit testing suites.
