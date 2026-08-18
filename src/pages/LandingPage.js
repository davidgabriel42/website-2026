import React from 'react';
import Layout from '../components/Layout';
import Avatar from '../components/Avatar';
import SocialLink from '../components/SocialLink';
import Button from '../components/Button';
import headshot from '../assets/dgabriel_headshot.png';

const LandingPage = () => {
  return (
    <Layout>
      <div className="flex flex-col items-center">
        
        {/* Main Bio / Hero Section */}
        <div className="text-center flex flex-col items-center mb-16">
          <Avatar src={headshot} alt="David Gabriel" />
          <h1 className="text-4xl font-bold mt-4">David Gabriel</h1>
          <p className="text-xl text-primary font-medium mt-1">Senior Software & Systems Architect</p>
          <p className="mt-4 max-w-2xl text-base-content/70 text-sm leading-relaxed">
            AI Professional who balances the capability to drive growth with a proven record of identifying and addressing hidden risk factors. Results and data driven mindset. Key experience during periods of rapid expansion in AI, Fintech, and LED technologies. Skillset honed from diverse technical and leadership backgrounds.
          </p>
          <div className="flex gap-4 mt-6">
            <SocialLink url="https://github.com/davidgabriel42" label="GitHub" />
            <SocialLink url="https://www.linkedin.com/in/davidjgabriel/" label="LinkedIn" />
          </div>
          <div className="mt-6">
            <Button to="/demos/jigsaw-puzzle">Play Jigsaw Game</Button>
          </div>
        </div>

        {/* Technical Design Documents Section */}
        <div className="w-full max-w-4xl border-t border-base-200 pt-12">
          <h2 className="text-lg font-black tracking-widest text-primary uppercase text-center mb-8 select-none">
            Technical Design Specs
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* RAG Copilot Specs Card */}
            <div className="card bg-base-100 border border-base-200 rounded-xl shadow hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden">
              <div className="p-5">
                <span className="text-2xl block mb-2 select-none">🤖</span>
                <h3 className="text-sm font-bold text-base-content leading-tight">Conversational RAG Copilot</h3>
                <p className="text-xs text-base-content/60 mt-2 leading-relaxed">
                  Design specifications of the 100% browser-native RAG agent. Detailings on the WebAssembly T5 model compile pipelines and SPA fallback fetch interceptors.
                </p>
              </div>
              <div className="p-4 bg-base-200/50 border-t border-base-200 text-center">
                <a 
                  href="https://docs.google.com/document/d/1Rf_RQ_K9-LTUf6Ifv6cuca4leprC2RVlwa7E_VGJtvs/edit?tab=t.0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary font-bold hover:underline uppercase tracking-wider"
                >
                  Read Copilot Doc &rarr;
                </a>
              </div>
            </div>

            {/* 3D Jigsaw Specs Card */}
            <div className="card bg-base-100 border border-base-200 rounded-xl shadow hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden">
              <div className="p-5">
                <span className="text-2xl block mb-2 select-none">🧩</span>
                <h3 className="text-sm font-bold text-base-content leading-tight">3D Jigsaw Studio</h3>
                <p className="text-xs text-base-content/60 mt-2 leading-relaxed">
                  Specifications of the HTML5 Bezier curves edge slicing algorithms, dual-texture rasterization pipeline, and custom 3-material split group extrusions.
                </p>
              </div>
              <div className="p-4 bg-base-200/50 border-t border-base-200 text-center">
                <a 
                  href="https://docs.google.com/document/d/1KxEO4D6nljOGavBBcT9CyfIx6eIoKdojHf6LjYdKjas/edit?tab=t.0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary font-bold hover:underline uppercase tracking-wider"
                >
                  Read Jigsaw Doc &rarr;
                </a>
              </div>
            </div>

            {/* Project Repository Card */}
            <div className="card bg-base-100 border border-base-200 rounded-xl shadow hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden">
              <div className="p-5">
                <span className="text-2xl block mb-2 select-none">💻</span>
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
        </div>

      </div>
    </Layout>
  );
};

export default LandingPage;
