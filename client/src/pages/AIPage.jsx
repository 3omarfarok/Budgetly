import { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Trash2,
  Sparkles,
  MessageSquare,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import Loader from "../components/Loader";
import useAI from "../hooks/useAI";

const _motion = motion;

const AIPage = () => {
  const { chats, loadingChats, useChat, sendMessage, isSending, deleteChat } =
    useAI();

  const [currentChatId, setCurrentChatId] = useState(null);
  const [input, setInput] = useState("");

  // Custom hook usage for the selected chat
  const { data: currentChat } = useChat(currentChatId);

  // Local state for optimistic updates or just to hold a temporary message list if needed.
  // But we'll rely on the query data for simplicity, maybe with a loading indicator.

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat, isSending]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const userMessage = input.trim();
    setInput("");

    try {
      const response = await sendMessage({
        message: userMessage,
        chatId: currentChatId,
      });
      // If we started a new chat, the response should contain the new chatId
      if (!currentChatId && response?.data?.chatId) {
        setCurrentChatId(response.data.chatId);
      }
    } catch {
      setInput(userMessage); // Restore input on error
    }
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
  };

  // Determine messages to display
  // If no chat selected (new chat state), show welcome message or empty
  // If chat selected, show its messages
  const displayMessages =
    currentChatId && currentChat ? currentChat.messages : [];

  return (
    <div className="h-[calc(100vh-100px)] flex gap-4 font-primary max-w-6xl mx-auto p-4">
      {/* Sidebar - History */}
      <div className="w-1/4 hidden md:flex flex-col bg-(--color-surface) rounded-2xl border border-(--color-border) overflow-hidden">
        <div className="p-4 border-b border-(--color-border)">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 p-3 bg-(--color-primary) text-white rounded-xl hover:shadow-lg transition-all font-bold"
          >
            <Plus size={20} />
            محادثة جديدة
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
          {loadingChats ? (
            <div className="flex justify-center p-4">
              <Loader size="xs" />
            </div>
          ) : chats?.length > 0 ? (
            <div className="space-y-2">
              {chats.map((chat) => (
                <div
                  key={chat._id}
                  onClick={() => setCurrentChatId(chat._id)}
                  className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between group ${
                    currentChatId === chat._id
                      ? "bg-(--color-bg) border-r-4 border-(--color-primary) font-bold"
                      : "hover:bg-(--color-bg) text-(--color-muted)"
                  }`}
                >
                  <div className="truncate flex-1 text-right text-sm">
                    {chat.title || "محادثة جديدة"}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat._id);
                      if (currentChatId === chat._id) setCurrentChatId(null);
                    }}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-(--color-muted) flex flex-col items-center gap-2 mt-10">
              <MessageSquare size={32} className="opacity-20" />
              <p className="text-sm">مفيش محادثات سابقة</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-(--color-surface) rounded-2xl border border-(--color-border) shadow-sm overflow-hidden relative">
        {/* Mobile Header logic could go here if needed */}

        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {!currentChatId && displayMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-(--color-muted) opacity-50">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <Sparkles size={40} className="text-purple-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">
                أهلاً بيك في المساعد الذكي
              </h2>
              <p>أنا هنا عشان أساعدك تفهم مصاريفك وتظبط ميزانيتك</p>
            </div>
          ) : (
            <AnimatePresence>
              {displayMessages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === "user"
                        ? "bg-(--color-primary) text-white"
                        : "bg-purple-100 text-purple-600"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <User size={16} />
                    ) : (
                      <Bot size={16} />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-(--color-primary) text-white rounded-tr-none"
                        : "bg-(--color-bg) text-(--color-dark) rounded-tl-none border border-(--color-border)"
                    }`}
                  >
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </motion.div>
              ))}
              {isSending && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 flex-row"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <Loader size="xs" color="currentColor" />
                  </div>
                  <div className="bg-(--color-bg) text-(--color-muted) p-4 rounded-2xl rounded-tl-none border border-(--color-border) text-sm">
                    جاري الكتابة...
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-(--color-surface) border-t border-(--color-border)">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب رسالتك هنا..."
              disabled={isSending}
              className="w-full p-4 pl-12 rounded-2xl bg-(--color-bg) border border-(--color-border) focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/20 outline-none transition-all text-right disabled:opacity-75"
            />
            <button
              type="submit"
              disabled={!input.trim() || isSending}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-(--color-primary) text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:shadow-none transition-all"
            >
              <Send
                size={20}
                className={isSending ? "opacity-0" : "opacity-100"}
              />
              {isSending && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader size="xs" color="white" />
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIPage;
