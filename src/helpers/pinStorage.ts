export const PIN_INFO_STORAGE_KEY = "pin_info";
export const PIN_INFO_CHANGED_EVENT = "payfleet_pin_info_changed";

/**
 * Check if the company has updated their transaction PIN.
 * Returns true if PIN has been changed, or false if the PIN is still default (1234) / unset.
 */
export const getPinInfo = (): boolean => {
  try {
    const value = localStorage.getItem(PIN_INFO_STORAGE_KEY);
    if (value === null) {
      return false; // Default created PIN is 1234, so unconfigured by default
    }
    return value === "true";
  } catch {
    return false;
  }
};

/**
 * Set the PIN status in localStorage ("true" if changed/customized, "false" if default/unconfigured).
 * Dispatches a custom event so active UI components update immediately.
 */
export const setPinInfo = (hasChangedPin: boolean): void => {
  try {
    localStorage.setItem(PIN_INFO_STORAGE_KEY, hasChangedPin ? "true" : "false");
    window.dispatchEvent(new Event(PIN_INFO_CHANGED_EVENT));
  } catch (error) {
    console.error("Failed to write pin_info to localStorage:", error);
  }
};

/**
 * Initialize pin_info in localStorage if not already present.
 */
export const initPinInfo = (defaultValue: boolean = false): void => {
  try {
    if (localStorage.getItem(PIN_INFO_STORAGE_KEY) === null) {
      localStorage.setItem(PIN_INFO_STORAGE_KEY, defaultValue ? "true" : "false");
      window.dispatchEvent(new Event(PIN_INFO_CHANGED_EVENT));
    }
  } catch {
    // Ignore storage errors in restricted contexts
  }
};

/**
 * Remove pin_info on logout.
 */
export const clearPinInfo = (): void => {
  try {
    localStorage.removeItem(PIN_INFO_STORAGE_KEY);
    window.dispatchEvent(new Event(PIN_INFO_CHANGED_EVENT));
  } catch {
    // Ignore storage errors
  }
};
