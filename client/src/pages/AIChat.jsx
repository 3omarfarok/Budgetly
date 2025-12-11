import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../utils/api";
import { Send, Trash2, Plus, MessageCircle } from "lucide-react";
import Loader from "../components/Loader";
import Input from "../components/Input";

const AIChat = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const messagesEndRef = useRef(null);

  // Fetch all chats on mount
  useEffect(() => {
    fetchChats();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchChats = async () => {
    try {
      setLoadingChats(true);
      const { data } = await api.get("/ai/chats");
      setChats(data.chats);
    } catch (error) {
      console.error("خطأ في تحميل المحادثات:", error);
      toast.error("فيه مشكلة في تحميل المحادثات");
    } finally {
      setLoadingChats(false);
    }
  };

  const loadChat = async (chatId) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/ai/chats/${chatId}`);
      setCurrentChat(data.chat);
      setMessages(data.chat.messages || []);
    } catch (error) {
      console.error("خطأ في تحميل المحادثة:", error);
      toast.error("فيه مشكلة في تحميل المحادثة");
    } finally {
      setLoading(false);
    }
  };

  const newChat = () => {
    setCurrentChat(null);
    setMessages([]);
    setInput("");
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await api.post("/ai/chat", {
        message: input,
        chatId: currentChat?._id,
      });

      const assistantMessage = {
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setCurrentChat({ ...currentChat, _id: data.chatId });

      // Refresh chats list
      fetchChats();
    } catch (error) {
      console.error("خطأ في إرسال الرسالة:", error);
      toast.error("فيه مشكلة في إرسال الرسالة");
      setMessages((prev) => prev.slice(0, -1)); // Remove user message on error
    } finally {
      setLoading(false);
    }
  };

  const deleteChat = async (chatId) => {
    try {
      await api.delete(`/ai/chats/${chatId}`);
      if (currentChat?._id === chatId) {
        newChat();
      }
      fetchChats();
      toast.success("تم حذف المحادثة");
    } catch (error) {
      console.error("خطأ في حذف المحادثة:", error);
      toast.error("فيه مشكلة في حذف المحادثة");
    }
  };

  if (loadingChats && chats.length === 0) {
    return <Loader text="بنحمّل المحادثات..." />;
  }

  return (
    <div className="flex h-screen bg-ios-bg">
      {/* Sidebar */}
      <div className="w-64 bg-ios-card border-r border-ios-border flex flex-col overflow-hidden">
        <div className="p-4 border-b border-ios-border">
          <button
            onClick={newChat}
            className="w-full flex items-center justify-center gap-2 bg-ios-primary text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition"
          >
            <Plus size={20} />
            محادثة جديدة
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="p-4 text-center text-ios-secondary text-sm">
              لا توجد محادثات بعد
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat._id}
                className={`p-3 border-b border-ios-border cursor-pointer hover:bg-ios-bg transition ${
                  currentChat?._id === chat._id
                    ? "bg-ios-primary bg-opacity-10 border-l-2 border-l-ios-primary"
                    : ""
                }`}
                onClick={() => loadChat(chat._id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ios-text truncate">
                      {chat.title}
                    </p>
                    <p className="text-xs text-ios-secondary">
                      {new Date(chat.createdAt).toLocaleDateString("ar-EG")}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat._id);
                    }}
                    className="text-ios-error hover:text-ios-error hover:bg-ios-error hover:bg-opacity-10 p-1 rounded transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-ios-card border-b border-ios-border p-4 flex items-center gap-3">
          <MessageCircle className="text-ios-primary" size={24} />
          <div>
            <h1 className="text-lg font-semibold text-ios-text">
              مساعد بادجتلي
            </h1>
            <p className="text-sm text-ios-secondary">
              {currentChat ? "محادثة محفوظة" : "محادثة جديدة"}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-ios-bg">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <MessageCircle
                  size={48}
                  className="text-ios-secondary mx-auto mb-4 opacity-30"
                />
                <p className="text-ios-secondary text-lg">ابدأ محادثة جديدة</p>
                <p className="text-ios-secondary text-sm">
                  اسأل مساعد بادجتلي أي سؤال عن الفلوس والحسابات
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.role === "user"
                      ? "bg-ios-primary text-white rounded-br-none"
                      : "bg-ios-card text-ios-text rounded-bl-none border border-ios-border"
                  }`}
                >
                  <p className="text-sm wrap-break-word">{msg.content}</p>
                  <p
                    className={`text-xs mt-1 opacity-70 ${
                      msg.role === "user" ? "text-white" : "text-ios-secondary"
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString("ar-EG")}
                  </p>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-ios-card border border-ios-border text-ios-text px-4 py-2 rounded-lg rounded-bl-none">
                <p className="text-sm">جاري الكتابة...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-ios-card border-t border-ios-border p-4">
          <form onSubmit={sendMessage} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب رسالتك..."
              disabled={loading}
              variant="filled"
              wrapperClassName="flex-1"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-ios-primary text-white p-2 rounded-lg hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
