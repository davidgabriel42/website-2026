# David Gabriel: Interactive Portfolio & Systems Engineering Workspace

This application is a 100% client-side interactive portfolio website running entirely inside the user's web browser. Because it requires zero server-side execution, database connections, or external API keys, it can be deployed with extreme simplicity to any static hosting provider (including GitHub Pages, Cloudflare Pages, Vercel, Netlify, or Amazon S3).

## Purpose of the Site

The purpose of this site is to serve as a high-fidelity interactive resume and engineering portfolio for David Gabriel. It provides a technical demonstration of:
*   In-browser artificial intelligence and client-side WebAssembly inference pipelines.
*   Advanced real-time WebGL 3D graphics rendering and mathematical layout simulations.
*   Polished full-stack UI composition adhering to strict linting, styling, and automated testing standards.

---

## Two Key Features

### 1. Browser-Native Conversational RAG Copilot
An unblocked, offline-ready conversational chatbot running 100% in the browser. It compiles quantized 8-bit ONNX models (`Xenova/LaMini-Flan-T5-248M`) locally via WebAssembly, utilizing a selective RAG context retriever to answer resume-related inquiries and trigger direct page navigations or resource downloads in real-time.

### 2. Standalone 3D Jigsaw Puzzle Studio
A real-time 3D workspace rendering interactive jigsaw puzzle components. It utilizes a mathematical Cubic Bezier Curve algorithm to trace interlocking edge connections on any uploaded texture, extruding 2D shapes into 3D geometries with custom face-split material indexes in React Three Fiber.

---

## Technical Stack & CI Integration

*   **Core Framework:** React 18 SPA (Single Page Application).
*   **Build Tooling & Styling:** CRACO (Create React App Configuration Overrides) compiling Tailwind CSS v4 and DaisyUI 5 utility classes natively via PostCSS.
*   **Continuous Integration (CI):** Fully configured GitHub Actions pipeline (`.github/workflows/ci.yml`) running on Node.js 24. On every push and pull request, the runner executes automated checkouts, npm dependency installations, production-ready webpack builds, and Jest unit test suites.
*   **Quality Assurance Suite:** Equipped with two automated testing harnesses:
    *   *Jest React UI Unit Tests:* Verifies UI components, button clicks, and DOM rendering.
    *   *Node.js RAG Evaluation Harness:* Measures local model response accuracy, safety guardrails, conversational memory retention, and action extractions.

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
