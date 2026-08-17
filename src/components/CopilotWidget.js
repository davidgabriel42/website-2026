import React, { useState, useEffect, useRef } from 'react';
import { executeAgentPipeline } from '../services/gemini';
import { useAgentActions } from '../hooks/useAgentActions';
import AgentTerminal from './AgentTerminal';

const CopilotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [inputKey, setInputKey] = useState(apiKey);
  const [showKeyInput, setShowKeyInput] = useState(!apiKey);
  
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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isProcessing) return;
    if (!apiKey) {
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
        // If the stage is already present, update it. Otherwise, append.
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
        // Add the verified response to conversation
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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
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
              {apiKey && (
                <button
                  onClick={() => setShowKeyInput(!showKeyInput)}
                  title="Configure API Key Settings"
                  className="btn btn-ghost btn-circle btn-xs text-gray-400 hover:text-white"
                >
                  ⚙️
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="btn btn-ghost btn-circle btn-xs text-gray-400 hover:text-white text-sm">
                ✕
              </button>
            </div>
          </div>

          {/* Secure Settings Configuration Layer */}
          {showKeyInput && (
            <div className="bg-slate-950 p-4 border-b border-slate-800 flex flex-col gap-3">
              <div className="text-xs">
                <span className="font-extrabold text-white block mb-1">🔐 Bring Your Own Key (BYOK)</span>
                <p className="text-slate-400 leading-normal">
                  To operate, this client-side demo communicates directly with the Google Gemini API from your browser. Input your Gemini API key securely (saved locally only).
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
              <p className="text-[10px] text-slate-500">
                Don't have a key? Acquire one for free at <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a>.
              </p>
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

          {/* Input Footer Form Field Area */}
          <form onSubmit={handleSendMessage} className="bg-slate-900 border-t border-slate-800 p-4 flex gap-2 shadow-inner">
            <input
              type="text"
              placeholder={apiKey ? "Ask about David's thesis or resume..." : "Configure API settings above..."}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isProcessing || !apiKey}
              className="input input-bordered flex-1 bg-slate-950 border-slate-800 text-xs text-white"
            />
            <button
              type="submit"
              disabled={isProcessing || !inputMessage.trim() || !apiKey}
              className="btn btn-primary font-bold text-xs"
            >
              Ask
            </button>
          </form>
          
          {/* Key Purger button (for debugging) */}
          {apiKey && (
            <div className="bg-slate-900 px-4 pb-2 text-[10px] text-center text-slate-500">
              API key securely saved locally.{" "}
              <button onClick={handleClearApiKey} className="text-error hover:underline font-bold">
                Purge Key
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default CopilotWidget;
