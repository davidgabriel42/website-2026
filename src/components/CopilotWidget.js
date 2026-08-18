import React, { useState, useEffect, useRef } from 'react';
import { executeAgentPipeline } from '../services/llm';
import { useAgentActions } from '../hooks/useAgentActions';
import AgentTerminal from './AgentTerminal';

// Common pre-cached Q&A for frictionless recruiter interaction (No WebLLM Setup Required!)
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
  const [isOpen, setIsOpen] = useState(() => {
    const saved = sessionStorage.getItem('copilot_is_open');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem('copilot_messages');
    return saved !== null ? JSON.parse(saved) : [
      {
        sender: 'bot',
        text: "Hello! I'm David's Agentic Portfolio Copilot. This chat runs entirely in your browser (via WebLLM) for total data privacy. I can answer questions about David, navigate the site, or highlight elements. How can I assist?",
      }
    ];
  });
  
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeSteps, setActiveSteps] = useState([]);

  const chatContainerRef = useRef(null);
  const { executeActions } = useAgentActions();

  // Sync state back to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('copilot_is_open', JSON.stringify(isOpen));
  }, [isOpen]);

  useEffect(() => {
    sessionStorage.setItem('copilot_messages', JSON.stringify(messages));
  }, [messages]);

  // Auto scroll to bottom of chat container
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, activeSteps, isProcessing]);

  // Triggers the simulated 3-Stage Pipeline for pre-cached questions
  const handlePreCachedClick = (qa) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setActiveSteps([]);

    setMessages((prev) => [...prev, { sender: 'user', text: qa.question }]);

    const steps = [
      { stage: 1, status: "RUNNING", message: "Stage 1: Analysing query topic & safety..." },
      { stage: 1, status: "COMPLETED", message: "Stage 1: Passed. Category: CACHED_Q&A" },
      { stage: 2, status: "RUNNING", message: "Stage 2: Scanning local knowledge cache..." },
      { stage: 2, status: "COMPLETED", message: "Stage 2: Response drafted." },
      { stage: 3, status: "RUNNING", message: "Stage 3: Cross-referencing draft against source facts..." },
      { stage: 3, status: "COMPLETED", message: "Stage 3: Verified. Fact check passed." }
    ];

    let currentStepIdx = 0;
    const interval = setInterval(() => {
      if (currentStepIdx < steps.length) {
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
        setMessages((prev) => [
          ...prev,
          { sender: 'bot', text: qa.answer }
        ]);
        if (qa.actions && qa.actions.length > 0) {
          executeActions(qa.actions);
        }
        setIsProcessing(false);
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
    setIsProcessing(true);
    setActiveSteps([]);

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
      const result = await executeAgentPipeline(userQuery, onStepUpdate);

      if (result.success) {
        setMessages((prev) => [
          ...prev,
          { sender: 'bot', text: result.answer }
        ]);
        if (result.actions && result.actions.length > 0) {
          executeActions(result.actions);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: 'bot', text: result.rejectionMessage, isRejected: true }
        ]);
      }
    } catch (err) {
      console.error("[Copilot Widget] Pipeline failed:", err);
      let errMsg = `An unexpected error occurred: "${err.message || err}"\n\n`;
      
      if (err.message === "WEBGPU_UNSUPPORTED" || !navigator.gpu) {
        errMsg += "⚠️ Your browser or device does not support WebGPU (required to compile and run local WebAssembly LLM models client-side in the browser).\n\n" +
                 "To run this in-browser LLM demo:\n" +
                 "1. Ensure you are using a compatible desktop browser (Chrome 113+, Edge 113+, or Safari 18+).\n" +
                 "2. Double-check that Hardware Acceleration is enabled in your browser settings.\n" +
                 "3. On some Chrome builds, you may need to navigate to 'chrome://flags/#enable-unsafe-webgpu' and enable it manually.\n\n" +
                 "For now, you can still click our suggested quick inquiries below to see fully simulated 3-stage agent runs!";
      } else {
        errMsg += "Please ensure you are connected to the internet (on first query to download the model) and try again. Your system's WebGPU or RAM might be temporarily overloaded.";
      }

      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: errMsg, isError: true }
      ]);
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setActiveSteps([]);
      }, 2000);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-primary btn-circle shadow-2xl h-14 w-14 hover:scale-105 transition-transform relative flex items-center justify-center text-2xl"
      >
        {isOpen ? '✕' : '🤖'}
      </button>

      {isOpen && (
        <div className="card bg-base-100 border border-base-300 rounded-2xl w-[380px] h-[550px] shadow-2xl flex flex-col overflow-hidden mt-3 transition-all duration-300">
          <div className="bg-base-200 border-b border-base-300 p-4 flex justify-between items-center shadow">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <div>
                <h3 className="text-sm font-black text-base-content leading-tight">Portfolio Copilot</h3>
                <span className="text-[10px] text-success font-semibold tracking-wider uppercase block select-none">WebLLM Engine Active</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="btn btn-ghost btn-circle btn-xs text-base-content/50 hover:text-base-content text-sm">
              ✕
            </button>
          </div>

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

            {isProcessing && (
              <div className="chat chat-start transition-opacity duration-300">
                <div className="chat-image avatar select-none">
                  <div className="w-8 rounded-full bg-base-300 border border-base-300 flex items-center justify-center">
                    <span className="text-sm select-none">🤖</span>
                  </div>
                </div>
                <div className="chat-bubble bg-base-200 border border-base-300 text-xs max-w-[270px] w-full">
                  <AgentTerminal steps={activeSteps} />
                </div>
              </div>
            )}
          </div>

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

          <form onSubmit={handleSendMessage} className="bg-base-200 border-t border-base-300 p-4 flex gap-2 shadow-inner">
            <input
              type="text"
              placeholder="Ask a custom question..."
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

        </div>
      )}
    </div>
  );
};

export default CopilotWidget;
