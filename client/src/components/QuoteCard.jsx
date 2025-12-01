import React, { useState, useEffect } from "react";
import { Quote, RefreshCw } from "lucide-react";
import { egyptianQuotes } from "../utils/quotes";

const QuoteCard = () => {
  const [quote, setQuote] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  const getRandomQuote = () => {
    setIsAnimating(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * egyptianQuotes.length);
      setQuote(egyptianQuotes[randomIndex]);
      setIsAnimating(false);
    }, 300);
  };

  useEffect(() => {
    getRandomQuote();
    const interval = setInterval(getRandomQuote, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-(--color-surface) rounded-lg sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-(--color-border) relative overflow-hidden group hover:shadow-xl transition-all duration-300 font-decorative Quote-Card">
      <div className="absolute top-0 right-0 p-2 sm:p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Quote size={32} className="sm:w-12 sm:h-12 text-(--color-primary)" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-sm sm:text-lg font-bold text-(--color-primary) font-cairo flex items-center gap-1 sm:gap-2 animate-pulse">
            <Quote size={16} className="sm:w-5 sm:h-5" />
            <span>حكمة اليوم</span>
          </h3>
          <button
            onClick={getRandomQuote}
            className="p-1.5 sm:p-2 rounded-full hover:bg-(--color-hover) text-(--color-secondary) transition-colors"
            title="حكمة تانية"
          >
            <RefreshCw
              size={16}
              className={`sm:w-[18px] sm:h-[18px] ${
                isAnimating ? "animate-spin" : ""
              }`}
            />
          </button>
        </div>

        <div
          className={`min-h-16 sm:min-h-20 flex items-center justify-center transition-opacity duration-300 ${
            isAnimating ? "opacity-0" : "opacity-100"
          }`}
        >
          <p className="text-sm sm:text-lg md:text-2xl text-center font-bold text-(--color-dark) font-cairo leading-relaxed">
            "{quote}"
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuoteCard;
