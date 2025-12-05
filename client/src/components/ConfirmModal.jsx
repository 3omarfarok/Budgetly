import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

/**
 * ConfirmModal Component
 * Reusable modal for confirming user actions
 *
 * @param {boolean} isOpen - Control modal visibility
 * @param {function} onClose - Function to close the modal
 * @param {function} onConfirm - Function to execute on confirmation
 * @param {string} title - Modal title
 * @param {string} message - Modal message/description
 * @param {string} type - 'danger' | 'warning' | 'info' (default: 'danger')
 */
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "danger",
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          iconColor: "var(--color-error)",
          buttonBg: "var(--color-error)",
          buttonText: "white",
        };
      case "warning":
        return {
          iconColor: "var(--color-warning)",
          buttonBg: "var(--color-warning)",
          buttonText: "white",
        };
      case "info":
        return {
          iconColor: "var(--color-info)",
          buttonBg: "var(--color-info)",
          buttonText: "white",
        };
      default:
        return {
          iconColor: "var(--color-primary)",
          buttonBg: "var(--color-primary)",
          buttonText: "white",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-60 backdrop-blur-sm bg-black/30"
          />
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden pointer-events-auto"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-border)",
                borderWidth: "1px",
              }}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="p-3 rounded-full bg-opacity-10"
                    style={{ backgroundColor: `${styles.iconColor}20` }}
                  >
                    <AlertTriangle
                      className="w-6 h-6"
                      style={{ color: styles.iconColor }}
                    />
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <h3
                  className="text-xl font-bold mb-2 "
                  style={{ color: "var(--color-dark)" }}
                >
                  {title}
                </h3>
                <p
                  className="text-base leading-relaxed mb-6"
                  style={{ color: "var(--color-muted)" }}
                >
                  {message}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={onConfirm}
                    className="flex-1 px-4 py-2.5 rounded-xl font-semibold transition-transform active:scale-95"
                    style={{
                      backgroundColor: styles.buttonBg,
                      color: styles.buttonText,
                    }}
                  >
                    تأكيد
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 rounded-xl font-semibold transition-colors"
                    style={{
                      backgroundColor: "var(--color-light)",
                      color: "var(--color-dark)",
                    }}
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
