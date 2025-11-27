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
    <div className="bg-(--color-surface) rounded-2xl p-6 shadow-lg border border-(--color-border) relative overflow-hidden group hover:shadow-xl transition-all duration-300 font-decorative Quote-Card">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Quote size={48} className="text-(--color-primary)" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-(--color-primary) font-cairo flex items-center gap-2 animate-pulse">
            <Quote size={20} />
            حكمة اليوم
          </h3>
          <button
            onClick={getRandomQuote}
            className="p-2 rounded-full hover:bg-(--color-hover) text-(--color-secondary) transition-colors"
            title="حكمة تانية"
          >
            <RefreshCw
              size={18}
              className={isAnimating ? "animate-spin" : ""}
            />
          </button>
        </div>

        <div
          className={`min-h-[80px] flex items-center justify-center transition-opacity duration-300 ${
            isAnimating ? "opacity-0" : "opacity-100"
          }`}
        >
          <p className=" text-center font-bold text-(--color-dark) font-cairo leading-relaxed sm:text-2xl text-lg  ">
            "{quote}"
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuoteCard;
