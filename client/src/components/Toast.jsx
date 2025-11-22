import { useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

const Toast = ({ message, type = "info", onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle size={20} />,
    error: <XCircle size={20} />,
    warning: <AlertCircle size={20} />,
    info: <Info size={20} />,
  };

  const styles = {
    success: "bg-green-50 text-green-800 border-green-200",
    error: "bg-red-50 text-red-800 border-red-200",
    warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
    info: "bg-blue-50 text-blue-800 border-blue-200",
  };

  const iconColors = {
    success: "text-green-600",
    error: "text-red-600",
    warning: "text-yellow-600",
    info: "text-blue-600",
  };

  return (
    <div
      className={`${styles[type]} border rounded-2xl p-4 shadow-lg backdrop-blur-sm flex items-start gap-3 min-w-[300px] max-w-md animate-slide-in`}
      role="alert"
      aria-live="polite"
    >
      <div className={`${iconColors[type]} flex-shrink-0 mt-0.5`}>
        {icons[type]}
      </div>
      <p className="flex-1 text-sm font-medium leading-relaxed">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-black/5"
        aria-label="إقفل"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
