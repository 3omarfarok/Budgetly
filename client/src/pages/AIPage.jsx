import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  X,
  Bot,
  Sparkles,
  Loader2,
  Calculator,
  History,
  Trash2,
  Lock,
} from "lucide-react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Input from "../components/Input";

const AIPage = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "أهلاً يا يغالي!  أنا مساعدك الذكي في Budgetly. \nمعاك في أي حسابات، تظبيط ميزانية،\nقولي أقدر أساعدك إزاي النهاردة؟ ",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const toast = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch chat history
  const fetchChatHistory = async () => {
    try {
      setLoadingHistory(true);
      const { data } = await api.get("/ai/chats");
      setChatHistory(data.chats);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      toast.error("فيه مشكلة في تحميل السجل");
    } finally {
      setLoadingHistory(false);
    }
  };

  // Load a previous chat
  const loadPreviousChat = async (chatId) => {
    try {
      setIsLoading(true);
      const { data } = await api.get(`/ai/chats/${chatId}`);
      setMessages(data.chat.messages || []);
      setCurrentChatId(chatId);
      setShowHistory(false);
    } catch (error) {
      console.error("Error loading chat:", error);
      toast.error("فيه مشكلة في تحميل المحادثة");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a chat
  const deleteChat = async (chatId, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/ai/chats/${chatId}`);
      setChatHistory(chatHistory.filter((c) => c._id !== chatId));
      if (currentChatId === chatId) {
        setMessages([
          {
            role: "assistant",
            content:
              "أهلاً يا باشا! 👋 أنا مساعدك الذكي في Budgetly. \nمعاك في أي حسابات، تظبيط ميزانية، أو حتى لو عايز تفضفض عن المصاريف. \nقولي أقدر أساعدك إزاي النهاردة؟ 💸",
          },
        ]);
        setCurrentChatId(null);
      }
      toast.success("تم حذف المحادثة");
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("فيه مشكلة في حذف المحادثة");
    }
  };

  // Start new chat
  const startNewChat = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "أهلاً يا باشا! 👋 أنا مساعدك الذكي في Budgetly. \nمعاك في أي حسابات، تظبيط ميزانية، أو حتى لو عايز تفضفض عن المصاريف. \nقولي أقدر أساعدك إزاي النهاردة؟ 💸",
      },
    ]);
    setCurrentChatId(null);
    setShowHistory(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await api.post("/ai/chat", {
        message: userMessage,
        chatId: currentChatId,
      });

      if (response.data.success) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: response.data.response },
        ]);
        // Update current chat ID if it's a new chat
        if (!currentChatId && response.data.chatId) {
          setCurrentChatId(response.data.chatId);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "معلش يا ريس، حصلت مشكلة صغيرة وأنا بفكر. جرب تاني كده كمان شوية! 😅",
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Format message content to handle markdown-like bolding and lists
  const formatMessage = (content) => {
    return content.split("\n").map((line, i) => {
      // Bold text handling (**text**)
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <div
          key={i}
          className={`${
            line.trim().startsWith("-") || line.trim().match(/^\d+\./)
              ? "pl-4"
              : "min-h-[1.5em]"
          }`}
        >
          {parts.map((part, j) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return <strong key={j}>{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-ios-surface rounded-2xl shadow-sm border border-ios-border overflow-hidden relative">
      {/* Header */}
      <div className="p-4 flex items-center justify-between text-ios-primary shadow-md shrink-0 border-b border-ios-border bg-ios-surface z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-ios-primary/10 rounded-lg backdrop-blur-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight text-ios-text">
              Budgetly AI
            </h3>
            <p className="text-xs text-ios-secondary opacity-90">
              Financial Assistant
            </p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => {
              setShowHistory(!showHistory);
              if (!showHistory && chatHistory.length === 0) {
                fetchChatHistory();
              }
            }}
            className="p-2 hover:bg-ios-hover rounded-full transition-colors text-ios-secondary hover:text-ios-primary"
            title="السجل"
          >
            <History className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* History Panel */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="absolute inset-0 top-[73px] bg-ios-surface z-40 flex flex-col border-r border-ios-border"
          >
            <div className="p-4 border-b border-ios-border flex items-center justify-between bg-ios-bg/50">
              <h3 className="font-bold text-ios-text">سجل المحادثات</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="p-1 hover:bg-ios-hover rounded-lg transition-colors text-ios-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <button
                onClick={startNewChat}
                className="w-full p-3 text-left bg-ios-primary/10 text-ios-primary rounded-lg font-medium text-sm hover:bg-ios-primary/20 transition-colors mb-2 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                محادثة جديدة
              </button>

              {loadingHistory ? (
                <div className="text-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-ios-secondary" />
                </div>
              ) : chatHistory.length === 0 ? (
                <div className="text-center py-8 text-ios-secondary text-sm">
                  لا توجد محادثات سابقة
                </div>
              ) : (
                chatHistory.map((chat) => (
                  <motion.button
                    key={chat._id}
                    whileHover={{ x: 2 }}
                    onClick={() => loadPreviousChat(chat._id)}
                    className={`w-full p-3 text-left rounded-lg transition-colors group border border-transparent hover:border-ios-border ${
                      currentChatId === chat._id
                        ? "bg-ios-primary/5 border-ios-primary/20"
                        : "bg-ios-bg hover:bg-ios-hover"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-medium text-sm truncate ${
                            currentChatId === chat._id
                              ? "text-ios-primary"
                              : "text-ios-text"
                          }`}
                        >
                          {chat.title}
                        </p>
                        <p className="text-xs text-ios-secondary">
                          {new Date(chat.createdAt).toLocaleDateString(
                            "ar-EG",
                            {
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                      <button
                        onClick={(e) => deleteChat(chat._id, e)}
                        className="p-1 opacity-0 group-hover:opacity-100 hover:bg-ios-error/10 text-ios-error rounded transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-ios-bg scrollbar-thin">
        {messages.map((msg, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={idx}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm ${
                msg.role === "user"
                  ? "bg-ios-primary text-white rounded-br-none"
                  : msg.isError
                  ? "bg-ios-error/10 text-ios-error border border-ios-error/30 rounded-bl-none"
                  : "bg-ios-surface text-ios-text border border-ios-border rounded-bl-none"
              }`}
            >
              {msg.role === "assistant" && !msg.isError && (
                <div className="flex items-center gap-2 mb-2 text-xs font-medium text-ios-primary">
                  <Sparkles className="w-3 h-3" />
                  AI Assistant
                </div>
              )}
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {msg.role === "assistant"
                  ? formatMessage(msg.content)
                  : msg.content}
              </div>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-ios-surface rounded-2xl rounded-bl-none p-4 shadow-sm border border-ios-border">
              <div className="flex gap-1.5">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                  className="w-2 h-2 bg-ios-primary rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                  className="w-2 h-2 bg-ios-primary rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                  className="w-2 h-2 bg-ios-primary rounded-full"
                />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-ios-surface border-t border-ios-border shrink-0 z-10">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اسألني عن أي حسابات أو نصايح..."
            disabled={isLoading}
            variant="filled"
            wrapperClassName="flex-1"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-ios-primary hover:bg-ios-hover text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-12"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
        <div className="mt-2 text-center">
          <p className="text-[10px] text-ios-secondary flex items-center justify-center gap-1">
            <Calculator className="w-3 h-3" />
            Powered by Gemini AI • Can make mistakes
          </p>
        </div>
      </div>

      {/* Under Construction Overlay */}
      <div className="absolute inset-0 bg-ios-surface/60 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-ios-card p-8 rounded-3xl shadow-xl border border-ios-border max-w-sm transform  transition-transform duration-300">
          <div className="w-16 h-16 bg-ios-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-ios-primary" />
          </div>
          <h2 className="text-2xl font-bold text-ios-text mb-3">تحت الصيانة</h2>
          <p className="text-ios-secondary leading-relaxed">
            مساعد بادجتلي الذكي بيتم تحديثه دلوقتي عشان يكون أذكى وأسرع.
            <br />
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIPage;
