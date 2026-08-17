import React from 'react';

const DemoCard = ({ title, description, techStack, liveUrl, codeUrl }) => {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        <p>{description}</p>
        <div className="card-actions justify-start">
          {techStack.map((tech, index) => (
            <div key={index} className="badge badge-outline">{tech}</div>
          ))}
        </div>
        <div className="card-actions justify-end">
          {liveUrl && <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Live Demo</a>}
          {codeUrl && <a href={codeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">View Code</a>}
        </div>
      </div>
    </div>
  );
};

export default DemoCard;
