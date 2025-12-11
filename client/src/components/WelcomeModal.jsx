import React, { useEffect, useState } from "react";
import { X, ExternalLink, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const WelcomeModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has seen the welcome modal
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
    if (!hasSeenWelcome) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("hasSeenWelcome", "true");
  };

  const handleStartGuide = () => {
    handleClose();
    navigate("/guide");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-300">
      <div
        className="bg-ios-surface border border-ios-border rounded-3xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-300"
        role="dialog"
        aria-labelledby="welcome-title"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 left-4 p-2 rounded-full hover:bg-black/5 transition-colors text-ios-secondary"
          aria-label="إغلاق الترحيب"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="text-center pt-4">
          <div className="mx-auto bg-ios-primary/10 w-20 h-20 rounded-full flex items-center justify-center mb-6">
            <Sparkles className="text-ios-primary w-10 h-10" />
          </div>

          <h2
            id="welcome-title"
            className="text-2xl font-bold text-ios-dark mb-3"
          >
            أهلاً بيك في Budgetly! 👋
          </h2>

          <p className="text-ios-secondary mb-8 leading-relaxed">
            مبسوطين إنك انضميت لينا. عشان تستفيد أقصى استفادة من الموقع، عملنا
            دليل سريع يشرحلك كل المميزات وازاي تدير ميزانيتك بسهولة.
          </p>

          <div className="space-y-3">
            <button
              onClick={handleStartGuide}
              className="w-full bg-ios-primary hover:bg-ios-primary/90 text-white font-bold py-3.5 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <span>ابدأ الجولة التعريفية</span>
              <ExternalLink size={18} />
            </button>

            <button
              onClick={handleClose}
              className="w-full bg-transparent hover:bg-black/5 text-ios-secondary font-medium py-3 px-6 rounded-2xl transition-colors"
            >
              لا شكراً، هكتشف بنفسي
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
