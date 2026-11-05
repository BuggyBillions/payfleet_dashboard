import { useSyncExternalStore, useCallback } from "react";
import {
  getPinInfo,
  setPinInfo as setStoragePinInfo,
  PIN_INFO_CHANGED_EVENT,
  PIN_INFO_STORAGE_KEY,
} from "../helpers/pinStorage";

function subscribe(callback: () => void) {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === PIN_INFO_STORAGE_KEY || e.key === null) {
      callback();
    }
  };

  window.addEventListener("storage", handleStorageChange);
  window.addEventListener(PIN_INFO_CHANGED_EVENT, callback);
  window.addEventListener("focus", callback);

  return () => {
    window.removeEventListener("storage", handleStorageChange);
    window.removeEventListener(PIN_INFO_CHANGED_EVENT, callback);
    window.removeEventListener("focus", callback);
  };
}

export const usePinInfo = () => {
  const hasChangedPin = useSyncExternalStore(subscribe, getPinInfo, () => false);

  const updatePinInfo = useCallback((value: boolean) => {
    setStoragePinInfo(value);
  }, []);

  return {
    pinInfo: hasChangedPin,
    isDefaultPin: !hasChangedPin,
    setPinInfo: updatePinInfo,
  };
};
