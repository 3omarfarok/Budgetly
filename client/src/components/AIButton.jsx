import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Sparkles } from "lucide-react";
import AIAssistant from "./AIAssistant";

const AIButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {/* Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`relative group flex items-center cursor-pointer justify-center w-14 h-14 rounded-full shadow-lg shadow-ios-primary/30 transition-all duration-300 ${
            isOpen
              ? "bg-ios-surface text-white rotate-90"
              : "bg-ios-primary text-white"
          }`}
        >
          {/* Ping animation */}
          {!isOpen && (
            <span className="absolute inline-flex h-full w-full rounded-full bg-ios-primary opacity-20 animate-ping" />
          )}

          <div className="relative z-10">
            {isOpen ? (
              <Sparkles className="w-6 h-6" />
            ) : (
              <Bot className="w-7 h-7" />
            )}
          </div>

          {/* Sparkle decoration */}
          {!isOpen && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles className="w-4 h-4 text-yellow-300 drop-shadow-sm" />
            </motion.div>
          )}
        </motion.button>
      </div>

      {/* Chat Interface */}
      <AIAssistant isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default AIButton;
