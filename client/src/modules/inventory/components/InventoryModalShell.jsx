import { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const Motion = motion;
const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const INITIAL_FOCUS_SELECTOR =
  '[data-modal-initial-focus="true"], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button[type="submit"]:not([disabled]), button:not([disabled]):not([data-modal-close="true"])';

export default function InventoryModalShell({
  isOpen,
  onClose,
  title,
  description,
  icon,
  iconClassName = "bg-ios-primary/10 text-ios-primary",
  maxWidthClassName = "max-w-2xl",
  isBusy = false,
  children,
}) {
  const titleId = useId();
  const descriptionId = useId();
  const closeButtonRef = useRef(null);
  const dialogRef = useRef(null);
  const previouslyFocusedElementRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    previouslyFocusedElementRef.current = document.activeElement;
    const rootElement = document.getElementById("root");

    const previousOverflow = document.body.style.overflow;
    const previousAriaHidden = rootElement?.getAttribute("aria-hidden");
    const previousInert = rootElement?.inert;
    document.body.style.overflow = "hidden";
    if (rootElement) {
      rootElement.setAttribute("aria-hidden", "true");
      rootElement.inert = true;
    }

    const focusTimer = window.setTimeout(() => {
      const initialFocusElement = dialogRef.current?.querySelector(INITIAL_FOCUS_SELECTOR);

      if (initialFocusElement) {
        initialFocusElement.focus();
        return;
      }

      closeButtonRef.current?.focus();
    }, 0);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      if (rootElement) {
        if (previousAriaHidden === null) {
          rootElement.removeAttribute("aria-hidden");
        } else {
          rootElement.setAttribute("aria-hidden", previousAriaHidden);
        }
        rootElement.inert = previousInert || false;
      }
      previouslyFocusedElementRef.current?.focus?.();
    };
  }, [isOpen]);

  const handleDialogKeyDown = (event) => {
    if (event.key === "Escape" && !isBusy) {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = dialogRef.current?.querySelectorAll(FOCUSABLE_SELECTOR);

    if (!focusableElements?.length) {
      event.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;
    const activeIndex = Array.from(focusableElements).indexOf(activeElement);

    if (activeElement === dialogRef.current || activeIndex === -1) {
      event.preventDefault();
      if (event.shiftKey) {
        lastElement.focus();
      } else {
        firstElement.focus();
      }
      return;
    }

    if (event.shiftKey && activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 bg-black/35 backdrop-blur-sm"
          />

          <div
            dir="rtl"
            className="fixed inset-0 z-60 flex items-center justify-center p-4"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !isBusy) {
                onClose();
              }
            }}
          >
            <Motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              role="dialog"
              aria-modal="true"
              aria-busy={isBusy}
              aria-labelledby={titleId}
              aria-describedby={description ? descriptionId : undefined}
              ref={dialogRef}
              tabIndex={-1}
              onKeyDown={handleDialogKeyDown}
              onMouseDown={(event) => event.stopPropagation()}
              className={`relative max-h-[calc(100vh-2rem)] w-full overflow-hidden rounded-[32px] border border-ios-border bg-ios-surface shadow-2xl ${maxWidthClassName}`}
            >
              <div className="flex max-h-[calc(100vh-2rem)] flex-col overflow-hidden">
                <div className="flex items-start justify-between border-b border-ios-border px-6 py-5">
                  <div>
                    {icon ? (
                      <div
                        className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl ${iconClassName}`}
                        aria-hidden="true"
                      >
                        {icon}
                      </div>
                    ) : null}
                    <h2 id={titleId} className="text-2xl font-black text-ios-dark">
                      {title}
                    </h2>
                    {description ? (
                      <p id={descriptionId} className="mt-2 text-sm leading-6 text-ios-secondary">
                        {description}
                      </p>
                    ) : null}
                  </div>

                  <button
                    ref={closeButtonRef}
                    type="button"
                    data-modal-close="true"
                    onClick={onClose}
                    disabled={isBusy}
                    className="rounded-2xl border border-ios-border p-2 text-ios-secondary transition-colors hover:bg-ios-light hover:text-ios-dark disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label="إغلاق"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="overflow-y-auto">{children}</div>
              </div>
            </Motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
