import { AlertCircle } from "lucide-react";
import Loader from "../Loader"; // Check if path is correct relative to where this file will be

export default function AuthCard({
  title,
  subtitle,
  error,
  loading,
  loadingText,
  children,
  footer,
}) {
  return (
    <div className="flex items-center justify-center min-h-[85vh] font-primary">
      <div className="bg-ios-surface backdrop-blur-xl p-10 rounded-3xl shadow-2xl w-full max-w-md border border-ios-border">
        {/* Logo & Header */}
        <div className="flex justify-center mb-6">
          <img
            src="/assets/logo.png"
            alt="بدجتلي - Budgetly"
            className="w-28 h-auto dark:invert"
          />
        </div>

        <div className="text-center mb-8">
          {title && (
            <h1 className="text-3xl font-bold text-ios-dark mb-2">{title}</h1>
          )}
          {subtitle && <p className="text-ios-secondary">{subtitle}</p>}
        </div>

        {loading ? (
          <Loader text={loadingText || "لحظة واحدة..."} />
        ) : (
          <>
            {error && (
              <div
                className="bg-ios-error/10 text-ios-error p-4 rounded-2xl mb-6 text-sm text-center border border-ios-error/20 flex items-center gap-2 justify-center"
                role="alert"
                aria-live="polite"
              >
                <AlertCircle size={18} aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            {children}

            {footer && <div className="mt-6 text-center">{footer}</div>}
          </>
        )}
      </div>
    </div>
  );
}
