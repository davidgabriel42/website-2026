import React from 'react';
import Layout from '../components/Layout';
import DemoCard from '../components/DemoCard';

const demos = [
  {
    title: '3D Jigsaw Puzzle',
    description: 'An interactive jigsaw puzzle generator and solver. Users can upload any image, which the system dynamically slices into interlocking puzzle pieces.',
    techStack: ['React', 'Tailwind CSS', 'Konva.js', 'Three.js', 'React Three Fiber'],
    liveUrl: '/demos/jigsaw-puzzle',
    codeUrl: 'https://github.com/davidgabriel42/website-2026',
  },
];

const DemosPage = () => {
  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-bold mb-4">Demo Showcase</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {demos.map((demo, index) => (
            <DemoCard key={index} {...demo} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default DemosPage;
