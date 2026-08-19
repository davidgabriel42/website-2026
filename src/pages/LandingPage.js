import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import headshot from '../assets/dgabriel_headshot.png';

const LandingPage = () => {
  
  const handleOpenCopilot = () => {
    window.dispatchEvent(new CustomEvent('open-copilot-chat'));
  };

  return (
    <Layout>
      <div className="flex flex-col items-center">
        
        {/* Main Bio / Hero Section: Two Column Responsive Flex */}
        <div className="flex flex-col-reverse md:flex-row items-center md:items-start gap-12 mb-16 max-w-4xl w-full">
          
          {/* Left Column: Text & 3 Resource Buttons */}
          <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start">
            <h1 className="text-4xl md:text-5xl font-black text-base-content leading-tight">David Gabriel</h1>
            <p className="text-lg md:text-xl text-primary font-bold mt-1.5 uppercase tracking-wide">
              Senior Software Engineer & AI Researcher
            </p>
            <p className="mt-5 max-w-2xl text-base-content/70 text-sm md:text-base leading-relaxed">
              With over 13 years of engineering experience that spans embedded systems, cloud native SaaS and PaaS applications, and cutting edge AI research, I have the technical depth to drive high impact projects. I have delivered code for life safety critical systems, and top enterprise AI platforms. AI, distributed computing and performance optimizations are some areas I have specialized in. I also hold a Masters in CS and a Bachelors in EE.
            </p>
            
            {/* Main Action Resources: 3 High-Impact Cohesive Buttons */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-8 w-full">
              <Button href="https://docs.google.com/document/d/1T4PW7TdsYxuVa48pqpJGPF_YyJ-GEJRQBvYSkvhMb6I/edit?usp=sharing">
                View Resume
              </Button>
              <Button href="https://github.com/davidgabriel42">
                GitHub Profile
              </Button>
              <Button href="https://www.linkedin.com/in/davidjgabriel/">
                LinkedIn Profile
              </Button>
            </div>
          </div>

          {/* Right Column: Larger Headshot with Framed border and scaling effects */}
          <div className="flex-shrink-0 flex justify-center">
            <Avatar 
              src={headshot} 
              alt="David Gabriel" 
              className="w-56 h-56 md:w-72 md:h-72 shadow-2xl border-4 border-primary/20 hover:scale-[1.02] transition-transform duration-200" 
            />
          </div>

        </div>

        {/* Technical Design Documents Section */}
        <div className="w-full max-w-4xl border-t border-base-200 pt-12">
          <h2 className="text-lg font-black tracking-widest text-primary uppercase text-center mb-8 select-none">
            Website Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
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
        </div>

      </div>
    </Layout>
  );
};

export default LandingPage;
