import React from 'react';

const AgentTerminal = ({ steps }) => {
  if (!steps || steps.length === 0) return null;

  // Read only the most recent step to keep the height 100% compact and prevent any chat jumps!
  const latestStep = steps[steps.length - 1];

  const getStatusColor = (status) => {
    switch (status) {
      case 'RUNNING': return 'text-amber-400';
      case 'COMPLETED': return 'text-success';
      case 'REJECTED': return 'text-error';
      default: return 'text-slate-400';
    }
  };

  const getSpinStyle = (status) => {
    if (status === 'RUNNING') return 'animate-spin border-t-amber-400 border-r-transparent';
    if (status === 'COMPLETED') return 'border-success bg-success/10';
    return 'border-error bg-error/10';
  };

  return (
    <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 text-[11px] font-mono leading-relaxed text-slate-300 shadow-lg w-full my-1.5 flex items-center gap-3 animate-fade-in">
      
      {/* Sleek Glowing Circular Spinner / Status Icon */}
      <div className={`w-5 h-5 rounded-full border-2 border-slate-800 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${getSpinStyle(latestStep.status)}`}>
        {latestStep.status === 'COMPLETED' && (
          <span className="text-[9px] text-success font-black select-none">✓</span>
        )}
        {latestStep.status === 'REJECTED' && (
          <span className="text-[9px] text-error font-black select-none">✕</span>
        )}
      </div>
      
      {/* Active Phase & Dynamic Message Text */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-0.5 select-none">
          <span>Portfolio Copilot Engine</span>
          <span className={`${getStatusColor(latestStep.status)} transition-colors duration-300`}>
            {latestStep.status}
          </span>
        </div>
        <p className="truncate text-slate-300 font-semibold transition-all duration-300">
          {latestStep.message}
        </p>
      </div>

    </div>
  );
};

export default AgentTerminal;
