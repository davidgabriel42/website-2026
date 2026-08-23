import React from 'react';
import Layout from '../components/Layout';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import headshot from '../assets/dgabriel_headshot.png';

const LandingPage = () => {

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
        <div className="w-full max-w-4xl border-t border-base-200 pt-12 flex flex-col items-center">
          <h2 className="text-lg font-black tracking-widest text-primary uppercase text-center mb-8 select-none">
            Software Demos
          </h2>

          <div className="flex flex-wrap justify-center gap-6">
            <Button to="/demos/guardrail">
              Agent Guardrails
            </Button>
            <Button to="/demos">
              All Demos
            </Button>
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default LandingPage;
