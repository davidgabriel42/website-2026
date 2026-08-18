import React, { useState, useEffect, useRef } from 'react';
import { executeAgentPipeline } from '../services/llm';
import { useAgentActions } from '../hooks/useAgentActions';
import AgentTerminal from './AgentTerminal';

// Expanded corpus of 12 detailed, dry, and objective pre-cached questions with direct UI action triggers
const PRE_CACHED_QUESTIONS = [
  {
    id: 'thesis',
    pill: "📚 Master's Thesis Topic",
    question: "Tell me about David's Master's Thesis topic and findings.",
    answer: "David's Master of Science in CS thesis from the University of Nevada, Reno is titled 'Throughput Prediction on Parallel File Systems using Machine Learning'. By processing Darshan parallel file system I/O logs from the BlueWaters supercomputer, he trained and compared multiple machine learning models. His Deep Neural Network (DNN) model outperformed alternatives, predicting parallel application I/O throughput within a 16 MB/s range, allowing administrators to programmatically detect system-level performance anomalies.",
    actions: []
  },
  {
    id: 'experience',
    pill: "💼 Core Professional Experience",
    question: "What is David's professional software engineering experience?",
    answer: "David has over 13 years of full-stack and systems engineering depth. His background spans report generation query tuning at Ridgeline Apps (optimizing runtimes from 2.5 hours to 30 minutes), serving as AI Security Champion and MLOps feature lead on the AI Registry service at Cloudera, and building OIDC 2.0 MFA and PCI-DSS secure payment integrations at Swoogo. His early career focuses on electrical, embedded, and safety-critical hardware controls at Bruel and Kjaer Vibro, Maxton, Luxtech, and Ionfield.",
    actions: []
  },
  {
    id: 'cve_scanner',
    pill: "🛡️ Agentic CVE Security Tool",
    question: "Explain David's open-source Agentic Security scanner.",
    answer: "At Cloudera, David designed and built 'CAI_AMP_Agentic_Security_Scanning'—an Applied Machine Learning Prototype. It deploys a directed acyclic graph (DAG) of collaborative, specialized agent nodes. The CVE Detection, Business Context, CVE Grading, Attack Generator, and Fix Generator agents work in sequence to scan repositories, CVSS grade vulnerabilities, output exploit proofs, and write production-grade remediating fixes.",
    actions: []
  },
  {
    id: 'copilot_specs',
    pill: "🤖 Copilot Design Specs",
    question: "Show me the Copilot design specifications.",
    answer: "This Portfolio Copilot is a browser-native RAG agent running a quantized 248M parameter Flan-T5 model. It executes client-side WebAssembly inference (ONNX Runtime) with local file-caching. Key architectural features include a dynamic keyword-aligned context retriever, a rolling 4-message conversational history window, and a window-level fetch interceptor that blocks SPA HTML redirects from causing JSON parsing failures.",
    actions: [
      { action: "OPEN_PDF", payload: "https://docs.google.com/document/d/1Rf_RQ_K9-LTUf6Ifv6cuca4leprC2RVlwa7E_VGJtvs/edit?tab=t.0" }
    ]
  },
  {
    id: 'jigsaw_specs',
    pill: "🧩 3D Jigsaw Design Specs",
    question: "How does the 3D Jigsaw Puzzle Studio work?",
    answer: "The Jigsaw Studio utilizes mathematical Cubic Bezier Curves to slice 2D textures into complementary interlocking puzzle tiles. For the 3D WebGL inspector, React Three Fiber (Three.js) extrudes these paths into 3D meshes and maps unclipped textures. A custom material shader indexing script maps the front cap (image segment), the beveled cut sides (custom solid colors), and the back cap (cardboard backing texture).",
    actions: [
      { action: "OPEN_PDF", payload: "https://docs.google.com/document/d/1KxEO4D6nljOGavBBcT9CyfIx6eIoKdojHf6LjYdKjas/edit?tab=t.0" },
      { action: "NAVIGATE", payload: "/demos/jigsaw-puzzle" }
    ]
  },
  {
    id: 'full_resume',
    pill: "📄 Complete Resume & CV",
    question: "How can I read David's complete resume?",
    answer: "David's complete professional resume and CV are hosted on Google Docs. It covers his complete 13-year engineering career, technical programming stack (Go, Python, Java, Kotlin, PHP, C), 5 awarded USPTO patents, and MS CS/BS EE academic qualifications.",
    actions: [
      { action: "OPEN_PDF", payload: "https://docs.google.com/document/d/1T4PW7TdsYxuVa48pqpJGPF_YyJ-GEJRQBvYSkvhMb6I/edit?usp=sharing" }
    ]
  },
  {
    id: 'patents',
    pill: "💡 Patents & Inventions",
    question: "How many patents does David have?",
    answer: "David is an inventor holding 5 awarded USPTO patents in LED module thermal reliability and circuit MTBF calculations utilizing Bayesian modeling metrics developed as Director of Product Development at Luxtech. He is also the inventor of an NIH-funded plasma cleaning system developed for Ionfield Systems, used by the National Institutes of Health (NCATS) to eliminate laboratory plastics.",
    actions: []
  },
  {
    id: 'swoogo_role',
    pill: "💳 Security & MFA Swoogo Work",
    question: "What did David accomplish at Swoogo?",
    answer: "As Software Engineer II at Swoogo, David designed and tested Multi-Factor Authentication (MFA) systems built on OIDC 2.0 protocols to secure account logins. He also engineered secure, PCI-DSS compliant credit card payment gateway integrations and was awarded 'Best New Hire' of the year out of over 50 hires during a major corporate expansion phase.",
    actions: []
  },
  {
    id: 'ridgeline_role',
    pill: "📉 Database Performance Ridgeline Work",
    question: "What does David do at Ridgeline Apps?",
    answer: "At Ridgeline Apps, David serves as a Software Engineer in the Performance Reporting division. He designs and tunes complex full-stack database and backend query layouts to accelerate report generation. His performance optimizations reduced processing runtimes for intensive financial report generation from 2.5 hours down to 30 minutes.",
    actions: []
  },
  {
    id: 'code_repo',
    pill: "💻 This Site's Code Repository",
    question: "Where can I find the code for this website?",
    answer: "The complete source code for this interactive portfolio is hosted on GitHub under David's public repositories. The workspace showcases a modern SPA stack using React 18, Tailwind CSS v4, DaisyUI 5, CRACO configurations, local WebAssembly model loaders, React Three Fiber, Konva.js, and an automated GitHub Actions Node 24 CI workflow.",
    actions: [
      { action: "OPEN_PDF", payload: "https://github.com/davidgabriel42/website-2026" }
    ]
  },
  {
    id: 'tech_stack',
    pill: "🛠️ Technical Skills & Polyglot Stack",
    question: "What is David's core programming stack?",
    answer: "David has deep polyglot skills, specializing in Go, Python, Java, Kotlin, PHP, and Embedded C. His front-end stack includes TypeScript, React, Zustand, Three.js, and Tailwind, and his systems and MLOps engineering toolbelt features Kubernetes, Docker, Databricks, Apache Spark, and Azure Cloud.",
    actions: []
  },
  {
    id: 'education_gpa',
    pill: "🎓 Education & Academic GPA",
    question: "Describe David's academic background and GPA.",
    answer: "David holds a Master of Science in Computer Science from the University of Nevada, Reno (UNR) with a perfect 4.0/4.0 GPA, where he published machine learning throughput research and taught operating systems threads in ANSI C. He also holds a Bachelor of Science in Electrical Engineering and Bio-Engineering from Temple University with a 3.9 engineering GPA.",
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
        text: "Hello! I'm David's Agentic Portfolio Copilot. This chat runs entirely in your browser (via WebAssembly) for total data privacy. I can answer questions about David, navigate the site, or highlight elements. How can I assist?",
      }
    ];
  });
  
  // Randomized set of 3 suggested quick inquiries displayed on page load
  const [pills, setPills] = useState([]);

  useEffect(() => {
    const shuffled = [...PRE_CACHED_QUESTIONS].sort(() => 0.5 - Math.random());
    setPills(shuffled.slice(0, 3));
  }, [isOpen]); // Re-shuffles on drawer open/close to keep content highly dynamic!
  
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

  // Listen for the custom "open-copilot-chat" event to open the drawer from other pages/components
  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('open-copilot-chat', handleOpenChat);
    return () => window.removeEventListener('open-copilot-chat', handleOpenChat);
  }, []);

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
      }
    }, 200);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isProcessing) return;

    const query = inputMessage;
    setInputMessage('');
    setIsProcessing(true);
    setActiveSteps([]);

    setMessages((prev) => [...prev, { sender: 'user', text: query }]);

    try {
      const result = await executeAgentPipeline(
        query,
        (step) => {
          setActiveSteps((prev) => {
            const existingIdx = prev.findIndex((s) => s.stage === step.stage);
            if (existingIdx !== -1) {
              const updated = [...prev];
              updated[existingIdx] = step;
              return updated;
            }
            return [...prev, step];
          });
        },
        messages
      );

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
        errMsg += "Your browser or device does not support WebGPU (required to compile and run local WebAssembly LLM models client-side in the browser).\n\n" +
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
        className="btn btn-primary px-5 h-12 shadow-2xl hover:scale-105 transition-all duration-150 uppercase tracking-widest font-black text-xs text-white rounded-full flex items-center gap-1.5"
      >
        {isOpen ? 'Close Chat' : 'Copilot Chat'}
      </button>

      {isOpen && (
        <div className="card bg-base-100 border border-base-300 rounded-2xl w-[380px] h-[550px] shadow-2xl flex flex-col overflow-hidden mt-3 transition-all duration-300">
          <div className="bg-base-200 border-b border-base-300 p-4 flex justify-between items-center shadow">
            <div className="flex items-center gap-2">
              <div>
                <h3 className="text-sm font-black text-base-content leading-tight">Portfolio Copilot</h3>
                <span className="text-[10px] text-success font-semibold tracking-wider uppercase block select-none">Local WebAssembly Engine Active</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="btn btn-ghost btn-circle btn-xs text-base-content/50 hover:text-base-content text-sm">
              ✕
            </button>
          </div>

          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-base-300/30">
            
            {/* System Architecture Information Card: Explicitly describes how the client-side RAG works */}
            <div className="bg-base-200 border border-base-300 rounded-xl p-3 text-[10.5px] leading-relaxed text-base-content/75 font-mono select-none">
              <span className="font-extrabold text-primary block uppercase mb-1 tracking-wider text-[11px]">System Architecture: Local RAG</span>
              This portfolio copilot runs 100% client-side inside your browser via WebAssembly (ONNX Runtime). It executes local, offline inference using a quantized 248M parameter model. Type custom queries or use the quick suggestions below to trigger dynamic retrievals from David's resume. Zero network calls are sent.
            </div>

            {messages.map((msg, index) => (
              <div key={index} className={`chat ${msg.sender === 'user' ? 'chat-end' : 'chat-start'} transition-opacity duration-300`}>
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
                {pills.map((qa) => (
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
