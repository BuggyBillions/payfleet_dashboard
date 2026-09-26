import { toast } from "sonner";

export interface CopyToClipboardOptions {
  /** Custom notification message on success (e.g. "Account number copied!") */
  message?: string;
  /** Field label used for generating message (e.g. "Reference" -> "Reference copied to clipboard") */
  label?: string;
  /** Whether to show a toast notification (default: true) */
  showToast?: boolean;
  /** Type of toast to display (default: "success") */
  toastType?: "success" | "info";
  /** Custom notification message on failure */
  errorMessage?: string;
}

/**
 * Copies the provided text to clipboard with automatic fallback and toast feedback.
 *
 * @param text The text or number to copy
 * @param optionsOrLabel Label string or configuration options
 * @returns Promise<boolean> indicating whether the copy operation succeeded
 *
 * @example
 * // Simple copy with default toast ("Copied to clipboard")
 * copyToClipboard("PAY-12345");
 *
 * // Copy with field label ("Reference copied to clipboard")
 * copyToClipboard("PAY-12345", "Reference");
 *
 * // Copy with custom message
 * copyToClipboard("support@payfleet.ng", { message: "Support email copied!" });
 *
 * // Copy silently without toast
 * copyToClipboard("0123456789", { showToast: false });
 */
export const copyToClipboard = async (
  text: string | number | null | undefined,
  optionsOrLabel?: string | CopyToClipboardOptions
): Promise<boolean> => {
  if (text === null || text === undefined || text === "" || text === "—") {
    return false;
  }

  const str = String(text).trim();
  if (!str) return false;

  const options: CopyToClipboardOptions =
    typeof optionsOrLabel === "string"
      ? { label: optionsOrLabel }
      : optionsOrLabel || {};

  const {
    message,
    label,
    showToast = true,
    toastType = "success",
    errorMessage = "Failed to copy to clipboard",
  } = options;

  let success = false;

  // 1. Try modern navigator.clipboard API
  if (
    typeof navigator !== "undefined" &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === "function"
  ) {
    try {
      await navigator.clipboard.writeText(str);
      success = true;
    } catch {
      success = false;
    }
  }

  // 2. Fallback to document.execCommand('copy')
  if (!success && typeof document !== "undefined") {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = str;
      textArea.style.position = "fixed";
      textArea.style.top = "-9999px";
      textArea.style.left = "-9999px";
      textArea.style.opacity = "0";
      textArea.setAttribute("readonly", "");
      document.body.appendChild(textArea);
      textArea.select();
      textArea.setSelectionRange(0, 99999);
      success = document.execCommand("copy");
      document.body.removeChild(textArea);
    } catch {
      success = false;
    }
  }

  // 3. Trigger feedback toast
  if (showToast) {
    if (success) {
      const successMsg =
        message ||
        (label
          ? label.toLowerCase().includes("copied")
            ? label
            : `${label} copied to clipboard`
          : "Copied to clipboard");

      if (toastType === "info") {
        toast.info(successMsg);
      } else {
        toast.success(successMsg);
      }
    } else {
      toast.error(errorMessage);
    }
  }

  return success;
};

export default copyToClipboard;
