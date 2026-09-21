import React from "react";
import { Plus, MessageSquare, Bot } from "lucide-react";

const ChatSidebar = ({ sessions, activeSession, onSelect, onNewChat }) => {
  return (
    <div className="h-full flex flex-col bg-gray-50/50 backdrop-blur-xl border-r border-gray-100">

      {/* Header */}
      <div className="px-6 py-6 border-b border-gray-100 bg-white/50 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center text-brand-700">
            <Bot size={20} />
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
            Conversations
          </h2>
        </div>
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 primary-btn py-3 shadow-md shadow-brand-500/20"
        >
          <Plus size={18} /> New Chat
        </button>
      </div>

      {/* Sessions */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 custom-scrollbar">
        {sessions.length === 0 && (
          <div className="text-center mt-10 p-6 glass rounded-2xl">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
              <MessageSquare size={20} />
            </div>
            <p className="text-sm font-medium text-gray-500">
              No conversations yet. Start a new chat above!
            </p>
          </div>
        )}

        {sessions.map((session) => (
          <button
            key={session._id}
            onClick={() => onSelect(session)}
            className={`w-full group flex items-start gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-200 border ${
              activeSession?._id === session._id
                ? "bg-white border-brand-200 shadow-sm shadow-brand-100/50"
                : "bg-transparent border-transparent hover:bg-white hover:border-gray-100 hover:shadow-sm"
            }`}
          >
            <MessageSquare 
              size={18} 
              className={`mt-0.5 shrink-0 transition-colors ${
                activeSession?._id === session._id ? "text-brand-600" : "text-gray-400 group-hover:text-brand-500"
              }`} 
            />
            <div className="overflow-hidden">
              <p className={`text-sm font-semibold truncate ${
                activeSession?._id === session._id ? "text-gray-900" : "text-gray-600 group-hover:text-gray-900"
              }`}>
                {session.title || "New Conversation"}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatSidebar;
