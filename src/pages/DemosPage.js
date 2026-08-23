import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const DemosPage = () => {
  const handleOpenCopilot = () => {
    window.dispatchEvent(new CustomEvent('open-copilot-chat'));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col items-center">
      <h1 className="text-3xl font-black text-base-content leading-tight uppercase tracking-wider text-center select-none">
        Software Demos & Specifications
      </h1>
      <p className="text-xs text-primary font-bold mt-2 uppercase tracking-widest block text-center mb-12 select-none">
        Observed System Components & Prototypes
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">

        {/* RAG Copilot Specs Card */}
        <div className="card bg-base-100 border border-base-200 rounded-xl shadow hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden">
          <div className="p-5">
            <h3 className="text-sm font-bold text-base-content leading-tight">Conversational RAG Copilot</h3>
            <p className="text-xs text-base-content/60 mt-2 leading-relaxed">
              Design specifications of the 100% browser-native RAG agent. Detailings on the WebAssembly T5 model compile pipelines and SPA fallback fetch interceptors.
            </p>
          </div>
          <div className="p-4 bg-base-200/50 border-t border-base-200 flex flex-col gap-2.5 text-center">
            <a
              href="https://docs.google.com/document/d/1Rf_RQ_K9-LTUf6Ifv6cuca4leprC2RVlwa7E_VGJtvs/edit?tab=t.0"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary font-bold hover:underline uppercase tracking-wider"
            >
              Read Copilot Doc &rarr;
            </a>
            <button
              onClick={handleOpenCopilot}
              className="text-[10px] text-primary hover:text-primary-focus font-extrabold uppercase tracking-widest bg-transparent border-0 cursor-pointer hover:underline"
            >
              Open Copilot Chat &darr;
            </button>
          </div>
        </div>

        {/* 3D Jigsaw Specs Card */}
        <div className="card bg-base-100 border border-base-200 rounded-xl shadow hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden">
          <div className="p-5">
            <h3 className="text-sm font-bold text-base-content leading-tight">3D Jigsaw Studio</h3>
            <p className="text-xs text-base-content/60 mt-2 leading-relaxed">
              Specifications of the HTML5 Bezier curves edge slicing algorithms, dual-texture rasterization pipeline, and custom 3-material split group extrusions.
            </p>
          </div>
          <div className="p-4 bg-base-200/50 border-t border-base-200 flex flex-col gap-2.5 text-center">
            <a
              href="https://docs.google.com/document/d/1KxEO4D6nljOGavBBcT9CyfIx6eIoKdojHf6LjYdKjas/edit?tab=t.0"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary font-bold hover:underline uppercase tracking-wider"
            >
              Read Jigsaw Doc &rarr;
            </a>
            <Link
              to="/demos/jigsaw-puzzle"
              className="text-[10px] text-primary hover:text-primary-focus font-extrabold uppercase tracking-widest hover:underline"
            >
              Open Jigsaw Studio &rarr;
            </Link>
          </div>
        </div>

        {/* Explainable Security Proxy Card */}
        <div className="card bg-base-100 border border-base-200 rounded-xl shadow hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden">
          <div className="p-5">
            <h3 className="text-sm font-bold text-base-content leading-tight">Explainable Security Proxy</h3>
            <p className="text-xs text-base-content/60 mt-2 leading-relaxed">
              Interactive visualization of a 5-layer AI security proxy. Scans inputs for jailbreaks, prompt injections, and redacts sensitive PII format leaks in real-time.
            </p>
          </div>
          <div className="p-4 bg-base-200/50 border-t border-base-200 flex flex-col gap-2.5 text-center">
            <Link
              to="/demos/guardrail"
              className="text-xs text-primary font-bold hover:underline uppercase tracking-wider"
            >
              Open Guardrail Studio &rarr;
            </Link>
          </div>
        </div>

        {/* Project Repository Card */}
        <div className="card bg-base-100 border border-base-200 rounded-xl shadow hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden">
          <div className="p-5">
            <h3 className="text-sm font-bold text-base-content leading-tight">Project Repository</h3>
            <p className="text-xs text-base-content/60 mt-2 leading-relaxed">
              Explore the full project codebase on GitHub. Features Craco PostCSS setups, automated Jest units, and GitHook automated workflows.
            </p>
          </div>
          <div className="p-4 bg-base-200/50 border-t border-base-200 text-center">
            <a
              href="https://github.com/davidgabriel42/website-2026"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary font-bold hover:underline uppercase tracking-wider"
            >
              Explore Code &rarr;
            </a>
          </div>
        </div>

      </div>

      <div className="mt-12 flex justify-center">
        <Button to="/">
          &larr; Back to Home
        </Button>
      </div>
    </div>
  );
};

export default DemosPage;
