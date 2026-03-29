import { useEffect, useRef } from "react";

export function useResetOnModalOpen({ isOpen, itemId = null, onReset }) {
  const previousIsOpenRef = useRef(false);
  const previousItemIdRef = useRef(itemId);

  useEffect(() => {
    const isOpening = isOpen && !previousIsOpenRef.current;
    const switchedItemWhileOpen = isOpen && previousItemIdRef.current !== itemId;

    if (isOpening || switchedItemWhileOpen) {
      onReset();
    }

    previousIsOpenRef.current = isOpen;
    previousItemIdRef.current = itemId;
  }, [isOpen, itemId, onReset]);
}
