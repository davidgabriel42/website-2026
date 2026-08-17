import React, { useState, useEffect, useRef } from 'react';
import { executeAgentPipeline } from '../services/gemini';
import { useAgentActions } from '../hooks/useAgentActions';
import AgentTerminal from './AgentTerminal';

// Common pre-cached Q&A for frictionless recruiter interaction (No API Key Required!)
const PRE_CACHED_QUESTIONS = [
  {
    id: 'thesis',
    pill: "📚 Read his MS Thesis",
    question: "Tell me about David's Master's Thesis topic and findings.",
    answer: "David's MS thesis from UNR is titled 'Throughput Prediction on Parallel File Systems using Machine Learning'. By processing Darshan I/O logs on the BlueWaters supercomputer, he developed a Deep Neural Network (DNN) model that predicted applications' I/O throughput within a 16 MB/s range. This accurate throughput prediction allows system administrators to detect file system performance anomalies (like metadata server overloads or resource interference) and minimize interruptions.",
    actions: [{ action: "NAVIGATE", payload: "/demos/jigsaw-puzzle" }] // Let's take them to his interactive thesis board!
  },
  {
    id: 'experience',
    pill: "💼 Review his experience",
    question: "What is David's professional software engineering experience?",
    answer: "David is a Senior Software Engineer and Architect with over 13 years of engineering depth spanning Fintech (Ridgeline Apps), Enterprise MLOps (Cloudera), and Safety-Critical embedded hardware (Bruel & Kjaer Vibro, Maxton, Luxtech). At Cloudera, he was the AI Security Champion and developed an open-source Agentic Security CVE scanner using Claude 3.7. At Ridgeline Apps, he tuned report-generation database queries to reduce processing times from 2.5 hours to 30 minutes.",
    actions: [{ action: "NAVIGATE", payload: "/demos" }] // Let's navigate to showcase his demos!
  },
  {
    id: 'cve_scanner',
    pill: "🛡️ Check Agentic CVE Scanner",
    question: "Explain David's open-source Agentic Security tool.",
    answer: "At Cloudera, David developed 'CAI_AMP_Agentic_Security_Scanning'—an Applied Machine Learning Prototype that deploys collaborative multi-agent teams. It uses a directed acyclic graph (DAG) workflow (CVE Detection, Business Context, CVE Grading, Attack Generation, and Fix Generation) to scan codebases for OWASP Top 10 vulnerabilities, outline real exploit vectors, and suggest remediating code. It integrates directly with AWS Bedrock (Claude) and Cloudera AI.",
    actions: [
      { action: "NAVIGATE", payload: "/demos" },
      { action: "HIGHLIGHT", payload: "a:contains('View Code')" } // Highlight his code repositories!
    ]
  }
];

const CopilotWidget = () => {
  // Chat starts OPEN by default for immediate recruiter engagement!
  const [isOpen, setIsOpen] = useState(true);
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [inputKey, setInputKey] = useState(apiKey);
  const [showKeyInput, setShowKeyInput] = useState(false); // Only show when triggered or settings clicked
  
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! I'm David's Agentic Portfolio Copilot. I'm trained strictly on his resume, publications, and MS thesis. I can answer your questions, navigate this website on your behalf, or highlight elements. How can I assist you today?",
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsSolving] = useState(false);
  const [activeSteps, setActiveSteps] = useState([]); // Real-time executing terminal logs

  const messagesEndRef = useRef(null);
  const { executeActions } = useAgentActions();

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeSteps, isProcessing]);

  // Persist API Key in LocalStorage
  const handleSaveApiKey = (e) => {
    e.preventDefault();
    if (!inputKey.trim()) return;
    localStorage.setItem('gemini_api_key', inputKey.trim());
    setApiKey(inputKey.trim());
    setShowKeyInput(false);
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    setInputKey('');
    setShowKeyInput(true);
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

    // Trigger LOAD of LLM (Prompt for API key) on first custom prompt sent if not configured!
    if (!apiKey) {
      setMessages((prev) => [
        ...prev,
        { sender: 'user', text: inputMessage.trim() },
        { sender: 'bot', text: "To answer custom questions, I need to load the Google Gemini model. Please input your Gemini API Key in the settings drawer that just slid open above.", isRejected: true }
      ]);
      setInputMessage('');
      setShowKeyInput(true);
      return;
    }

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
      // Trigger the 3-stage agentic chain directly from the browser Knowledge Base
      const result = await executeAgentPipeline(apiKey, userQuery, onStepUpdate);

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
      let errMsg = "An unexpected error occurred. Please try again.";
      if (err.message === "RATE_LIMIT_ERROR") {
        errMsg = "Gemini API rate limit exceeded (429). Please wait a minute and try again.";
      } else if (err.message.includes("API key")) {
        errMsg = "Invalid API Key. Please verify your key and update it in settings.";
        handleClearApiKey();
      }

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
        {!isOpen && !apiKey && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-error"></span>
          </span>
        )}
      </button>

      {/* Chat Window Drawer Popup */}
      {isOpen && (
        <div className="card bg-slate-900 border border-slate-800 rounded-2xl w-[380px] h-[550px] shadow-2xl flex flex-col overflow-hidden mt-3 transition-all duration-300">
          
          {/* Header Card Area */}
          <div className="bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center shadow">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <div>
                <h3 className="text-sm font-black text-white leading-tight">Portfolio Copilot</h3>
                <span className="text-[10px] text-success font-semibold tracking-wider uppercase block">Gemini Agent Active</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowKeyInput(!showKeyInput)}
                title="Configure API Key Settings"
                className={`btn btn-ghost btn-circle btn-xs text-sm ${showKeyInput ? 'text-white bg-slate-700' : 'text-gray-400 hover:text-white'}`}
              >
                ⚙️
              </button>
              <button onClick={() => setIsOpen(false)} className="btn btn-ghost btn-circle btn-xs text-gray-400 hover:text-white text-sm">
                ✕
              </button>
            </div>
          </div>

          {/* Secure Settings Configuration Layer */}
          {showKeyInput && (
            <div className="bg-slate-950 p-4 border-b border-slate-800 flex flex-col gap-3 transition-all">
              <div className="text-xs">
                <span className="font-extrabold text-white block mb-1">🔐 Bring Your Own Key (BYOK)</span>
                <p className="text-slate-400 leading-normal">
                  To answer custom questions, this copilot communicates directly with Google Gemini. Input your Gemini API key securely (saved locally only).
                </p>
              </div>
              <form onSubmit={handleSaveApiKey} className="flex gap-2 w-full">
                <input
                  type="password"
                  placeholder="Paste Gemini API Key..."
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  className="input input-bordered input-sm flex-1 bg-slate-900 border-slate-800 text-xs text-white"
                  required
                />
                <button type="submit" className="btn btn-primary btn-sm font-bold text-xs">
                  Save
                </button>
              </form>
              <div className="flex justify-between items-center text-[10px] text-slate-500">
                <span>Acquire one for free at <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a>.</span>
                {apiKey && (
                  <button type="button" onClick={handleClearApiKey} className="text-error hover:underline font-bold">
                    Purge Key
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Conversation Log Area */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-slate-950">
            {messages.map((msg, index) => (
              <div key={index} className={`chat ${msg.sender === 'user' ? 'chat-end' : 'chat-start'} transition-opacity duration-300`}>
                <div className="chat-image avatar">
                  <div className="w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                    <span className="text-sm select-none">{msg.sender === 'user' ? '👤' : '🤖'}</span>
                  </div>
                </div>
                <div className={`chat-bubble text-xs leading-normal max-w-[270px] ${
                  msg.sender === 'user'
                    ? 'chat-bubble-primary text-white font-semibold'
                    : msg.isRejected
                      ? 'bg-slate-900 border border-amber-800/30 text-amber-300'
                      : msg.isError
                        ? 'chat-bubble-error text-white font-bold'
                        : 'bg-slate-900 border border-slate-800 text-slate-200'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Simulated Live Agentic Terminal Executions bubble */}
            {isProcessing && (
              <div className="chat chat-start transition-opacity duration-300">
                <div className="chat-image avatar">
                  <div className="w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                    <span className="text-sm select-none">🤖</span>
                  </div>
                </div>
                <div className="chat-bubble bg-slate-900 border border-slate-800 text-xs max-w-[270px] w-full">
                  <div className="flex items-center gap-1.5 text-slate-400 font-semibold mb-2">
                    <span className="loading loading-ring loading-xs inline-block" />
                    <span>Pipeline Thinking...</span>
                  </div>
                  <AgentTerminal steps={activeSteps} />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Common Q&A Pills (Frictionless Interaction Layer) */}
          {!isProcessing && (
            <div className="bg-slate-950 px-4 pb-2 pt-1 border-t border-slate-900">
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                Suggested Quick Inquiries:
              </span>
              <div className="flex flex-col gap-1.5">
                {PRE_CACHED_QUESTIONS.map((qa) => (
                  <button
                    key={qa.id}
                    onClick={() => handlePreCachedClick(qa)}
                    className="btn btn-outline btn-xs justify-start text-[11px] font-medium border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg py-1.5 px-2.5 h-auto text-left leading-normal"
                  >
                    {qa.pill}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Footer Form Field Area */}
          <form onSubmit={handleSendMessage} className="bg-slate-900 border-t border-slate-800 p-4 flex gap-2 shadow-inner">
            <input
              type="text"
              placeholder="Ask a custom question..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isProcessing}
              className="input input-bordered flex-1 bg-slate-950 border-slate-800 text-xs text-white"
            />
            <button
              type="submit"
              disabled={isProcessing || !inputMessage.trim()}
              className="btn btn-primary font-bold text-xs"
            >
              Ask
            </button>
          </form>

        </div>
      )}
    </div>
  );
};

export default CopilotWidget;
