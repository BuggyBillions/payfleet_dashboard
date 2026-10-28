import React, { useRef, useEffect, useState } from "react";
import { LuEye, LuEyeOff } from "react-icons/lu";

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  label?: string;
  error?: string;
  onComplete?: (value: string) => void;
  className?: string;
}

const PinInput: React.FC<PinInputProps> = ({
  value = "",
  onChange,
  length = 4,
  disabled = false,
  autoFocus = true,
  label = "Transaction PIN",
  error,
  onComplete,
  className = "",
}) => {
  const [showPin, setShowPin] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const digits = Array.from({ length }, (_, i) => value[i] || "");

  useEffect(() => {
    if (autoFocus && !disabled) {
      const firstEmptyIndex = digits.findIndex((d) => !d);
      const targetIndex = firstEmptyIndex === -1 ? 0 : firstEmptyIndex;
      inputRefs.current[targetIndex]?.focus();
    }
  }, []);

  const handleChange = (index: number, char: string) => {
    const cleanDigit = char.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = cleanDigit;
    const nextPin = newDigits.join("").slice(0, length);
    onChange(nextPin);

    if (cleanDigit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (nextPin.length === length) {
      onComplete?.(nextPin);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        onChange(newDigits.join(""));
      } else {
        const newDigits = [...digits];
        newDigits[index] = "";
        onChange(newDigits.join(""));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    const clean = pasted.replace(/\D/g, "").slice(0, length);
    if (!clean) return;

    onChange(clean);
    const nextFocusIndex = Math.min(clean.length, length - 1);
    inputRefs.current[nextFocusIndex]?.focus();

    if (clean.length === length) {
      onComplete?.(clean);
    }
  };

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <span className="font-medium text-xs text-textBlack">{label}</span>
          <button
            type="button"
            onClick={() => setShowPin((prev) => !prev)}
            tabIndex={-1}
            className="text-[11px] text-textBlack/50 hover:text-primary flex items-center gap-1 transition cursor-pointer"
          >
            {showPin ? <LuEyeOff size={13} /> : <LuEye size={13} />}
            <span>{showPin ? "Hide PIN" : "Show PIN"}</span>
          </button>
        </div>
      )}

      <div className="flex items-center justify-center gap-3">
        {Array.from({ length }, (_, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type={showPin ? "text" : "password"}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digits[i]}
            disabled={disabled}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className={`w-12 h-13 sm:w-13 sm:h-14 text-center text-xl font-bold text-textBlack bg-secondary border rounded-xl outline-none transition select-none ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                : "border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-label={`PIN digit ${i + 1}`}
          />
        ))}
      </div>

      {error && (
        <span className="text-[11px] text-red-500 text-center font-medium">
          {error}
        </span>
      )}
    </div>
  );
};

export default PinInput;