import React, { useEffect, useRef, useState } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ---------------- Assistant Message Formatter ---------------- */
const formatAssistantMessage = (text) => {
  if (!text) return null;

  const lines = text.split("\n").filter(Boolean);

  const renderBoldText = (txt) => {
    const parts = txt.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index} className="font-extrabold text-brand-950">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-3">
      {lines.map((line, i) => {
        const cleanLine = line.trim();

        // Section Headings (starts with ### or ##)
        if (cleanLine.startsWith("###")) {
          return (
            <h4
              key={i}
              className="text-brand-800 font-bold mt-4 border-b border-brand-100 pb-2 flex items-center gap-2 text-[15px] uppercase tracking-wide"
            >
              <Sparkles size={16} className="text-brand-500" /> {renderBoldText(cleanLine.replace("###", "").trim())}
            </h4>
          );
        }

        if (cleanLine.startsWith("##")) {
          return (
            <h3
              key={i}
              className="text-brand-900 font-extrabold mt-6 border-b-2 border-brand-200 pb-2 flex items-center gap-2 text-[17px] uppercase tracking-wide"
            >
              <Sparkles size={18} className="text-brand-600" /> {renderBoldText(cleanLine.replace("##", "").trim())}
            </h3>
          );
        }

        if (
          cleanLine.includes("⚠️") ||
          cleanLine.toLowerCase().includes("do not apply") ||
          cleanLine.toLowerCase().includes("avoid")
        ) {
          return (
            <div
              key={i}
              className="bg-red-50/80 border border-red-100 text-red-800 px-4 py-3 rounded-xl text-[15px] font-medium flex items-start gap-3 shadow-sm"
            >
              <div className="mt-0.5 shrink-0">⚠️</div>
              <p>{renderBoldText(cleanLine.replace("⚠️", "").trim())}</p>
            </div>
          );
        }

        // Positive Recommendations
        if (
          cleanLine.includes("✅") ||
          cleanLine.toLowerCase().includes("recommended") ||
          cleanLine.toLowerCase().includes("apply")
        ) {
          return (
            <div
              key={i}
              className="bg-brand-50 border border-brand-100 text-brand-800 px-4 py-3 rounded-xl text-[15px] font-medium flex items-start gap-3 shadow-sm"
            >
              <div className="mt-0.5 shrink-0">✅</div>
              <p>{renderBoldText(cleanLine.replace("✅", "").trim())}</p>
            </div>
          );
        }

        // Bullet points
        if (cleanLine.startsWith("*") || cleanLine.startsWith("-")) {
          const content = cleanLine.startsWith("*") 
            ? cleanLine.substring(1).trim() 
            : cleanLine.substring(1).trim();
          return (
            <li key={i} className="ml-6 list-disc text-gray-700 text-[15px] marker:text-brand-500 pl-1">
              {renderBoldText(content)}
            </li>
          );
        }

        // Normal paragraph
        return (
          <p key={i} className="text-gray-700 text-[15px] leading-relaxed">
            {renderBoldText(cleanLine)}
          </p>
        );
      })}
    </div>
  );
};

/* ---------------- Main Component ---------------- */
const ChatWindow = ({ 
  messages, 
  loading, 
  onSend, 
  activeSession, 
  selectedLanguage, 
  setSelectedLanguage 
}) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    onSend({
      text: input,
      newChat: !activeSession,
    });

    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>

      {/* Header */}
      <div className="px-8 py-5 border-b border-gray-100 bg-white/80 backdrop-blur-xl z-10 sticky top-0 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
            <Bot size={22} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              AgroIntelX Assistant
              <span className="px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 text-[10px] uppercase font-bold tracking-widest">Beta</span>
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              AI-powered agronomic insights
            </p>
          </div>
        </div>

        {/* Dropdown Selector */}
        <div className="flex items-center gap-2 z-20">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:inline">Language:</span>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 outline-none focus:border-brand-500 cursor-pointer shadow-sm hover:bg-gray-50 transition-all"
          >
            <option value="auto">🌐 Auto-detect (Regional)</option>
            <option value="English">English</option>
            <option value="Hindi">हिन्दी (Hindi)</option>
            <option value="Marathi">मराठी (Marathi)</option>
            <option value="Gujarati">ગુજરાતી (Gujarati)</option>
            <option value="Odia">ଓଡ଼ିଆ (Odia)</option>
            <option value="Bengali">বাংলা (Bengali)</option>
            <option value="Telugu">తెలుగు (Telugu)</option>
            <option value="Tamil">தமிழ் (Tamil)</option>
            <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
          </select>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 space-y-8 custom-scrollbar z-0">
        {messages.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center max-w-md mx-auto text-center">
            <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mb-6 border-8 border-white shadow-sm">
              <Sparkles size={32} className="text-brand-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">How can I help today?</h3>
            <p className="text-gray-500 font-medium leading-relaxed">
              Ask me to analyze your soil report, suggest optimal crops, or generate a tailored fertilizer plan.
            </p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
              {["What crops are best for pH 6.5?", "Suggest a fertilizer plan", "Analyze my NPK levels"].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setInput(suggestion)}
                  className="px-4 py-3 bg-white border border-gray-100 rounded-xl text-left text-sm font-medium text-gray-600 hover:border-brand-300 hover:text-brand-700 hover:shadow-sm transition-all text-ellipsis overflow-hidden whitespace-nowrap"
                >
                  "{suggestion}"
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-4 ${
                msg.sender === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {msg.sender === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
                  <Bot size={16} />
                </div>
              )}

              <div
                className={`max-w-[85%] md:max-w-[75%] px-5 py-4 text-[15px] leading-relaxed shadow-sm ${
                  msg.sender === "user"
                    ? "bg-gray-900 text-white rounded-2xl rounded-tr-sm"
                    : "bg-white border border-gray-100 rounded-2xl rounded-tl-sm text-gray-800"
                }`}
              >
                {msg.sender === "assistant"
                  ? formatAssistantMessage(msg.message)
                  : msg.message}
              </div>

              {msg.sender === "user" && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 shrink-0 mt-1">
                  <User size={16} />
                </div>
              )}
            </motion.div>
          ))}

          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-4"
            >
              <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
                <Bot size={16} />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 md:p-6 bg-transparent z-10">
        <form
          onSubmit={handleSubmit}
          className="relative max-w-4xl mx-auto flex items-end gap-2 bg-white border border-gray-200 rounded-[2rem] p-2 shadow-lg shadow-gray-200/50 focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-50 transition-all"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={loading ? "Waiting for response..." : "Message AgroIntelX..."}
            disabled={loading}
            className="flex-1 max-h-32 min-h-[44px] px-4 py-3 bg-transparent text-gray-800 text-[15px] focus:outline-none resize-none custom-scrollbar disabled:opacity-50"
            rows={1}
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className={`p-3 rounded-full flex shrink-0 items-center justify-center transition-all ${
              input.trim() && !loading
                ? "bg-brand-600 text-white shadow-md hover:bg-brand-700 hover:scale-105" 
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Send size={18} className={input.trim() && !loading ? "translate-x-0.5 -translate-y-0.5" : ""} />
          </button>
        </form>
        <div className="text-center mt-3">
          <p className="text-xs text-gray-400">AgroIntelX AI can make mistakes. Verify important agronomic information.</p>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
