import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Sparkles } from "lucide-react";
import AIAssistant from "./AIAssistant";

const _motion = motion;

const AIButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 left-6 z-50 hidden lg:flex flex-col items-end gap-2">
        {/* Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
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
        </motion.button>
      </div>

      {/* Chat Interface */}
      <AIAssistant isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default AIButton;
