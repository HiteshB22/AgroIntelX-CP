import React, { useEffect, useState } from "react";
import api from "../services/api";
import ChatSidebar from "../components/ChatSidebar";
import ChatWindow from "../components/ChatWindow";

const Chatbot = () => {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("auto");

  // ---------------- Fetch Sessions ----------------
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await api.get("/chat/sessions");
        setSessions(res.data);
      } catch (err) {
        console.error("Failed to load sessions", err);
      }
    };
    fetchSessions();
  }, []);

  // ---------------- Load Messages ----------------
  const loadMessages = async (session) => {
    try {
      setLoadingMessages(true);
      setActiveSession(session);
      const res = await api.get(`/chat/messages/${session._id}`);
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // ---------------- Send Message ----------------
  const sendMessage = async ({ text, reportId, newChat }) => {
    // Optimistic UI update: instantly show the user's message
    setMessages((prev) => [
      ...prev,
      { sender: "user", message: text },
    ]);
    
    // Set a localized loading state for the assistant's reply
    setLoadingMessages(true);

    try {
      const payload = {
        message: text,
        newChat,
        reportId: reportId || activeSession?.linkedReport || null,
        sessionId: newChat ? null : activeSession?._id,
        language: selectedLanguage, // Multi-language selected translation option
      };

      const res = await api.post("/chat/send", payload);

      if (newChat && res.data.sessionId) {
        setSessions((prev) => [res.data, ...prev]);
        setActiveSession({ _id: res.data.sessionId });
      }

      if (res.data.assistantMessage) {
        setMessages((prev) => [
          ...prev,
          { sender: "assistant", message: res.data.assistantMessage.message },
        ]);
      }
    } catch (err) {
      console.error("Send message failed", err);
      // Optional: Handle error state in UI
    } finally {
      // Clear the local loading state once the API responds or fails
      setLoadingMessages(false);
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] w-full flex bg-[#f8fafc] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 shrink-0 border-r border-gray-200 bg-white shadow-sm z-20">
        <ChatSidebar
          sessions={sessions}
          activeSession={activeSession}
          onSelect={loadMessages}
          onNewChat={() => {
            setActiveSession(null);
            setMessages([]);
          }}
        />
      </aside>

      {/* Chat Window */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-gray-50 z-10">
        <ChatWindow
          messages={messages}
          loading={loadingMessages}
          onSend={sendMessage}
          activeSession={activeSession}
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
        />
      </main>
    </div>
  );
};

export default Chatbot;
