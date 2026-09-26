import { useState, useCallback } from "react";
import { copyToClipboard, type CopyToClipboardOptions } from "../helpers/clipboardHelper";

export interface UseCopyToClipboardReturn {
  copiedValue: string | null;
  isCopied: boolean;
  copy: (
    text: string | number | null | undefined,
    optionsOrLabel?: string | CopyToClipboardOptions
  ) => Promise<boolean>;
  reset: () => void;
}

/**
 * React hook that manages copied state and provides the copy function.
 *
 * @param resetDelay Milliseconds before resetting copied status (default: 2000)
 */
export const useCopyToClipboard = (resetDelay = 2000): UseCopyToClipboardReturn => {
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  const copy = useCallback(
    async (
      text: string | number | null | undefined,
      optionsOrLabel?: string | CopyToClipboardOptions
    ): Promise<boolean> => {
      const success = await copyToClipboard(text, optionsOrLabel);
      if (success) {
        const valueKey =
          typeof optionsOrLabel === "string"
            ? optionsOrLabel
            : optionsOrLabel?.label || String(text ?? "");
        setCopiedValue(valueKey);
        setTimeout(() => {
          setCopiedValue((current) => (current === valueKey ? null : current));
        }, resetDelay);
      }
      return success;
    },
    [resetDelay]
  );

  const reset = useCallback(() => {
    setCopiedValue(null);
  }, []);

  return {
    copiedValue,
    isCopied: Boolean(copiedValue),
    copy,
    reset,
  };
};

export default useCopyToClipboard;
