import React from 'react';
import Layout from '../components/Layout';
import Avatar from '../components/Avatar';
import SocialLink from '../components/SocialLink';
import Button from '../components/Button';
import headshot from '../assets/dgabriel_headshot.png';

const LandingPage = () => {
  return (
    <Layout>
      <div className="flex flex-col items-center text-center">
        <Avatar src={headshot} alt="David Gabriel" />
        <h1 className="text-4xl font-bold mt-4">David Gabriel</h1>
        <p className="mt-4 max-w-2xl text-base-content/70">
          With over 13 years of engineering experience that spans embedded systems, cloud native SaaS and PaaS applications, and cutting edge AI research, I have the technical depth to drive high impact projects. I have delivered code for life safety critical systems, and top enterprise AI platforms. AI, distributed computing and performance optimizations are some areas I have specialized in. I also hold a Masters in CS and a Bachelors in EE.
        </p>
        <div className="flex gap-4 mt-8">
          <SocialLink url="https://github.com/davidgabriel42" label="GitHub" />
          <SocialLink url="https://www.linkedin.com/in/davidjgabriel/" label="LinkedIn" />
          <SocialLink url="https://docs.google.com/document/d/1T4PW7TdsYxuVa48pqpJGPF_YyJ-GEJRQBvYSkvhMb6I/edit?usp=sharing" label="Resume" />
        </div>
        <div className="mt-8">
          <Button to="/demos/jigsaw-puzzle">View Demos</Button>
        </div>
      </div>
    </Layout>
  );
};

export default LandingPage;
