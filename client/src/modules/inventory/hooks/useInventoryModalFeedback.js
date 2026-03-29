import { useEffect, useState } from "react";

export function useInventoryModalFeedback({
  isOpen,
  isSubmitting,
  onClose,
  onReset,
  submitErrorMessage,
}) {
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSubmitError("");
    }
  }, [isOpen]);

  const clearSubmitError = () => {
    setSubmitError("");
  };

  const markSubmitFailure = () => {
    setSubmitError(submitErrorMessage);
  };

  const runWithSubmitFeedback = async (action) => {
    const didSucceed = await action();

    if (!didSucceed) {
      markSubmitFailure();
    }

    return didSucceed;
  };

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    clearSubmitError();
    onReset?.();
    onClose();
  };

  return {
    submitError,
    clearSubmitError,
    markSubmitFailure,
    runWithSubmitFeedback,
    handleClose,
  };
}
