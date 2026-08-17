import React from 'react';

const AgentTerminal = ({ steps }) => {
  if (!steps || steps.length === 0) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'RUNNING': return 'text-amber-400';
      case 'COMPLETED': return 'text-success';
      case 'REJECTED': return 'text-error';
      default: return 'text-slate-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'RUNNING':
        return (
          <span className="loading loading-spinner loading-xs text-amber-400 inline-block mr-1.5 align-middle" />
        );
      case 'COMPLETED':
        return <span className="text-success inline-block mr-1.5 font-bold">✓</span>;
      case 'REJECTED':
        return <span className="text-error inline-block mr-1.5 font-bold">✗</span>;
      default:
        return <span className="text-slate-500 inline-block mr-1.5">•</span>;
    }
  };

  return (
    <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 text-[11px] font-mono leading-relaxed text-slate-300 shadow-inner w-full my-2">
      <div className="flex justify-between border-b border-slate-800 pb-1.5 mb-1.5 text-slate-500 uppercase tracking-widest text-[9px] font-bold">
        <span>🤖 Co-Pilot Agentic Core</span>
        <span>Online</span>
      </div>
      <div className="flex flex-col gap-1">
        {steps.map((step, idx) => (
          <div key={idx} className="transition-all duration-300">
            <span className="text-slate-600 mr-1.5">&gt;</span>
            {getStatusIcon(step.status)}
            <span className={getStatusColor(step.status)}>{step.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentTerminal;
