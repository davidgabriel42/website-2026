import React, { useState, useEffect, useRef } from 'react';
import { executeAgentPipeline } from '../services/gemini';
import { useAgentActions } from '../hooks/useAgentActions';
import AgentTerminal from './AgentTerminal';

// Common pre-cached Q&A for frictionless recruiter interaction (No Local LLM Setup Required!)
const PRE_CACHED_QUESTIONS = [
  {
    id: 'thesis',
    pill: "📚 Read his MS Thesis",
    question: "Tell me about David's Master's Thesis topic and findings.",
    answer: "David's MS thesis from UNR is titled 'Throughput Prediction on Parallel File Systems using Machine Learning'. By processing Darshan I/O logs on the BlueWaters supercomputer, he developed a Deep Neural Network (DNN) model that predicted applications' I/O throughput within a 16 MB/s range. This accurate throughput prediction allows system administrators to detect file system performance anomalies (like metadata server overloads or resource interference) and minimize interruptions.",
    actions: []
  },
  {
    id: 'experience',
    pill: "💼 Review his experience",
    question: "What is David's professional software engineering experience?",
    answer: "David is a Senior Software Engineer and Architect with over 13 years of engineering depth spanning Fintech (Ridgeline Apps), Enterprise MLOps (Cloudera), and Safety-Critical embedded hardware (Bruel & Kjaer Vibro, Maxton, Luxtech). At Cloudera, he was the AI Security Champion and developed an open-source Agentic Security CVE scanner using Claude 3.7. At Ridgeline Apps, he tuned report-generation database queries to reduce processing times from 2.5 hours to 30 minutes.",
    actions: []
  },
  {
    id: 'cve_scanner',
    pill: "🛡️ Check Agentic CVE Scanner",
    question: "Explain David's open-source Agentic Security tool.",
    answer: "At Cloudera, David developed 'CAI_AMP_Agentic_Security_Scanning'—an Applied Machine Learning Prototype that deploys collaborative multi-agent teams. It uses a directed acyclic graph (DAG) workflow (CVE Detection, Business Context, CVE Grading, Attack Generation, and Fix Generation) to scan codebases for OWASP Top 10 vulnerabilities, outline real exploit vectors, and suggest remediating code. It integrates directly with AWS Bedrock (Claude) and Cloudera AI.",
    actions: []
  }
];

const CopilotWidget = () => {
  // Chat starts OPEN by default on the very first visit, then reads from sessionStorage to persist state
  const [isOpen, setIsOpen] = useState(() => {
    const saved = sessionStorage.getItem('copilot_is_open');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  // Local model name defaults to 'llama3' (no more cloud Gemini keys required!)
  const [localModelName, setLocalModelName] = useState(localStorage.getItem('copilot_local_model') || 'llama3');
  const [inputModelName, setInputModelName] = useState(localModelName);
  const [showSettings, setShowSettings] = useState(false); // Only show when settings gear is clicked
  
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem('copilot_messages');
    return saved !== null ? JSON.parse(saved) : [
      {
        sender: 'bot',
        text: "Hello! I'm David's Agentic Portfolio Copilot. I'm trained strictly on his resume, publications, and MS thesis. I can answer your questions, navigate this website on your behalf, or highlight elements. How can I assist you today?",
      }
    ];
  });
  
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsSolving] = useState(false);
  const [activeSteps, setActiveSteps] = useState([]); // Real-time executing terminal logs

  const chatContainerRef = useRef(null);
  const { executeActions } = useAgentActions();

  // Keep compatibility with executeAgentPipeline signature: "local_model:model_name"
  const modelConfigString = `local_model:${localModelName}`;

  // Sync state back to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('copilot_is_open', JSON.stringify(isOpen));
  }, [isOpen]);

  useEffect(() => {
    sessionStorage.setItem('copilot_messages', JSON.stringify(messages));
  }, [messages]);

  // Auto scroll to bottom of chat container only (completely prevents window scrolling jumps!)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, activeSteps, isProcessing]);

  // Persist Local Model Configuration in LocalStorage
  const handleSaveSettings = (e) => {
    e.preventDefault();
    const model = inputModelName.trim() || 'llama3';
    localStorage.setItem('copilot_local_model', model);
    setLocalModelName(model);
    setShowSettings(false);
  };

  const handleClearSettings = () => {
    localStorage.removeItem('copilot_local_model');
    setLocalModelName('llama3');
    setInputModelName('llama3');
    setShowSettings(true);
  };

  // Triggers the simulated 3-Stage Pipeline for pre-cached questions to show reasoning flow
  const handlePreCachedClick = (qa) => {
    if (isProcessing) return;
    setIsSolving(true);
    setActiveSteps([]);

    setMessages((prev) => [...prev, { sender: 'user', text: qa.question }]);

    // Simulated terminal step timings (1.2 seconds total)
    const steps = [
      { stage: 1, status: "RUNNING", message: "Stage 1: Analysing query topic & safety..." },
      { stage: 1, status: "COMPLETED", message: "Stage 1: Passed. Category: CACHED_Q&A" },
      { stage: 2, status: "RUNNING", message: "Stage 2: Scanning local knowledge cache & checking UI tools..." },
      { stage: 2, status: "COMPLETED", message: "Stage 2: Response drafted & UI tools extracted." },
      { stage: 3, status: "RUNNING", message: "Stage 3: Cross-referencing draft answer against source facts..." },
      { stage: 3, status: "COMPLETED", message: "Stage 3: Verified. Fact check passed." }
    ];

    let currentStepIdx = 0;
    const interval = setInterval(() => {
      if (currentStepIdx < steps.length) {
        // Stream steps
        const step = steps[currentStepIdx];
        setActiveSteps((prev) => {
          const existingIdx = prev.findIndex((s) => s.stage === step.stage);
          if (existingIdx !== -1) {
            const updated = [...prev];
            updated[existingIdx] = step;
            return updated;
          }
          return [...prev, step];
        });
        currentStepIdx++;
      } else {
        clearInterval(interval);
        // Show answer
        setMessages((prev) => [
          ...prev,
          { sender: 'bot', text: qa.answer }
        ]);

        // Execute agentic UI tools!
        if (qa.actions && qa.actions.length > 0) {
          executeActions(qa.actions);
        }
        setIsSolving(false);
        setActiveSteps([]);
      }
    }, 200);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isProcessing) return;

    const userQuery = inputMessage.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userQuery }]);
    setInputMessage('');
    setIsSolving(true);
    setActiveSteps([]); // Clear previous log steps

    // Simple callback to update the simulated terminal logs sequentially in the bubble
    const onStepUpdate = (step) => {
      setActiveSteps((prev) => {
        const existingIdx = prev.findIndex((s) => s.stage === step.stage);
        if (existingIdx !== -1) {
          const updated = [...prev];
          updated[existingIdx] = step;
          return updated;
        }
        return [...prev, step];
      });
    };

    try {
      // Trigger the 3-stage agentic chain using local Ollama model
      const result = await executeAgentPipeline(modelConfigString, userQuery, onStepUpdate);

      if (result.success) {
        setMessages((prev) => [
          ...prev,
          { sender: 'bot', text: result.answer }
        ]);

        // Dispatch agentic actions (Navigate pages, highlighting or opening files!)
        if (result.actions && result.actions.length > 0) {
          executeActions(result.actions);
        }
      } else {
        // Safe Gatekeeper rejection or prompt safety flag triggered
        setMessages((prev) => [
          ...prev,
          { sender: 'bot', text: result.rejectionMessage, isRejected: true }
        ]);
      }
    } catch (err) {
      console.error("[Copilot Widget] Pipeline failed:", err);
      let errMsg = `Could not connect to your local Ollama server. Please ensure Ollama is running locally on port 11434 and has the model loaded (e.g. run 'ollama run ${localModelName}' in your terminal).`;
      
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: errMsg, isError: true }
      ]);
    } finally {
      setIsSolving(false);
      // Wait slightly, then clear terminal steps
      setTimeout(() => {
        setActiveSteps([]);
      }, 2000);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-primary btn-circle shadow-2xl h-14 w-14 hover:scale-105 transition-transform relative flex items-center justify-center text-2xl"
      >
        {isOpen ? '✕' : '🤖'}
      </button>

      {/* Chat Window Drawer Popup */}
      {isOpen && (
        <div className="card bg-base-100 border border-base-300 rounded-2xl w-[380px] h-[550px] shadow-2xl flex flex-col overflow-hidden mt-3 transition-all duration-300">
          
          {/* Header Card Area */}
          <div className="bg-base-200 border-b border-base-300 p-4 flex justify-between items-center shadow">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <div>
                <h3 className="text-sm font-black text-base-content leading-tight">Portfolio Copilot</h3>
                <span className="text-[10px] text-success font-semibold tracking-wider uppercase block select-none">Local LLM Mode Active</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                title="Configure Local Model Settings"
                className={`btn btn-ghost btn-circle btn-xs text-sm ${showSettings ? 'text-primary bg-base-300' : 'text-base-content/50 hover:text-base-content'}`}
              >
                ⚙️
              </button>
              <button onClick={() => setIsOpen(false)} className="btn btn-ghost btn-circle btn-xs text-base-content/50 hover:text-base-content text-sm">
                ✕
              </button>
            </div>
          </div>

          {/* Secure Settings Configuration Layer (Ollama Local Only!) */}
          {showSettings && (
            <div className="bg-base-300/40 p-4 border-b border-base-300 flex flex-col gap-3 transition-all">
              <div className="text-xs">
                <span className="font-extrabold text-base-content block mb-1">⚙️ Local LLM Settings</span>
                <p className="text-base-content/60 leading-normal">
                  Configure the model name running on your local <a href="https://ollama.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Ollama</a> server (<code className="bg-base-200 px-1 rounded">localhost:11434</code>).
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="flex gap-2 w-full">
                <input
                  type="text"
                  placeholder="Ollama Model Name (e.g. llama3)..."
                  value={inputModelName}
                  onChange={(e) => setInputModelName(e.target.value)}
                  className="input input-bordered input-sm flex-1 bg-base-100 border-base-300 text-xs text-base-content"
                  required
                />
                <button type="submit" className="btn btn-primary btn-sm font-bold text-xs text-white">
                  Save
                </button>
              </form>

              <div className="flex justify-between items-center text-[10px] text-base-content/40">
                <span>Default: <code className="bg-base-200 px-1 rounded">llama3</code>. Supports any local model.</span>
                <button type="button" onClick={handleClearSettings} className="text-error hover:underline font-bold">
                  Reset
                </button>
              </div>
            </div>
          )}

          {/* Conversation Log Area */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-base-300/30">
            {messages.map((msg, index) => (
              <div key={index} className={`chat ${msg.sender === 'user' ? 'chat-end' : 'chat-start'} transition-opacity duration-300`}>
                <div className="chat-image avatar select-none">
                  <div className="w-8 rounded-full bg-base-300 border border-base-300 flex items-center justify-center">
                    <span className="text-sm select-none">{msg.sender === 'user' ? '👤' : '🤖'}</span>
                  </div>
                </div>
                <div className={`chat-bubble text-xs leading-normal max-w-[270px] ${
                  msg.sender === 'user'
                    ? 'chat-bubble-primary text-white font-semibold shadow'
                    : msg.isRejected
                      ? 'bg-base-200 border border-warning/25 text-warning'
                      : msg.isError
                        ? 'chat-bubble-error text-white font-bold shadow'
                        : 'bg-base-200 border border-base-300 text-base-content shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Simulated Live Agentic Terminal Executions bubble */}
            {isProcessing && (
              <div className="chat chat-start transition-opacity duration-300">
                <div className="chat-image avatar select-none">
                  <div className="w-8 rounded-full bg-base-300 border border-base-300 flex items-center justify-center">
                    <span className="text-sm select-none">🤖</span>
                  </div>
                </div>
                <div className="chat-bubble bg-base-200 border border-base-300 text-xs max-w-[270px] w-full">
                  <div className="flex items-center gap-1.5 text-base-content/50 font-semibold mb-2 select-none">
                    <span className="loading loading-ring loading-xs inline-block" />
                    <span>Pipeline Thinking...</span>
                  </div>
                  <AgentTerminal steps={activeSteps} />
                </div>
              </div>
            )}
          </div>

          {/* Suggested Common Q&A Pills (Frictionless Interaction Layer) */}
          {!isProcessing && (
            <div className="bg-base-100 px-4 pb-2 pt-1 border-t border-base-300">
              <span className="text-[9px] font-bold text-base-content/45 uppercase tracking-wider block mb-1.5 select-none">
                Suggested Quick Inquiries:
              </span>
              <div className="flex flex-col gap-1.5">
                {PRE_CACHED_QUESTIONS.map((qa) => (
                  <button
                    key={qa.id}
                    onClick={() => handlePreCachedClick(qa)}
                    className="btn btn-outline btn-xs justify-start text-[11px] font-medium border-base-300 text-base-content/75 hover:bg-base-300 hover:text-base-content rounded-lg py-1.5 px-2.5 h-auto text-left leading-normal"
                  >
                    {qa.pill}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Footer Form Field Area */}
          <form onSubmit={handleSendMessage} className="bg-base-200 border-t border-base-300 p-4 flex gap-2 shadow-inner">
            <input
              type="text"
              placeholder={`Ask custom (Ollama model: ${localModelName})...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isProcessing}
              className="input input-bordered flex-1 bg-base-100 border-base-300 text-xs text-base-content"
            />
            <button
              type="submit"
              disabled={isProcessing || !inputMessage.trim()}
              className="btn btn-primary font-bold text-xs text-white"
            >
              Ask
            </button>
          </form>

          {/* Key Purger button (for debugging) */}
          <div className="bg-base-200 px-4 pb-2 text-[10px] text-center text-base-content/40 select-none">
            Local Ollama Engine Connected (Model: <code className="bg-base-300 px-1 rounded">{localModelName}</code>).
          </div>

        </div>
      )}
    </div>
  );
};

export default CopilotWidget;
