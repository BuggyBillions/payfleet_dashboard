import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";
import {
  evaluatePassword,
  type PasswordEvaluation,
} from "../../helpers/passwordUtils";

export interface PasswordStrengthIndicatorProps {
  password?: string;
  showWhenEmpty?: boolean;
  className?: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password = "",
  showWhenEmpty = false,
  className = "",
}) => {
  const isTyping = password.length > 0;
  const shouldRender = showWhenEmpty || isTyping;

  const evaluation: PasswordEvaluation = evaluatePassword(password);

  return (
    <AnimatePresence>
      {shouldRender && (
        <motion.div
          initial={{ opacity: 0, height: 0, y: -4 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          exit={{ opacity: 0, height: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className={`overflow-hidden flex flex-col gap-2 pt-1 text-xs ${className}`}
        >
          {/* Target match & strength header */}
          <div className="flex items-center justify-between text-[11px] font-medium">
            <span className="text-textBlack/70 dark:text-gray-300">
              Target match:{" "}
              <span className="font-semibold text-textBlack dark:text-white">
                {evaluation.metCount} of {evaluation.totalCriteria}
              </span>{" "}
              <span className="text-textBlack/50 dark:text-gray-400">
                ({evaluation.progressPercent}%)
              </span>
            </span>

            <span className="flex items-center gap-1.5">
              <span className="text-textBlack/60 dark:text-gray-400">Strength:</span>
              <span
                className={`font-semibold capitalize px-1.5 py-0.5 rounded text-[10px] tracking-wide ${
                  evaluation.strength === "strong"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300"
                    : evaluation.strength === "good"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300"
                    : evaluation.strength === "fair"
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300"
                    : evaluation.strength === "weak"
                    ? "bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300"
                    : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {evaluation.strengthLabel}
              </span>
            </span>
          </div>

          {/* Progress bar of target match */}
          <div
            className="grid grid-cols-5 gap-1.5 h-1.5 w-full"
            role="progressbar"
            aria-valuenow={evaluation.progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Password target match progress"
          >
            {Array.from({ length: evaluation.totalCriteria }).map((_, index) => {
              const isFilled = index < evaluation.metCount;
              return (
                <div
                  key={index}
                  className={`h-full rounded-full transition-all duration-300 ${
                    isFilled
                      ? evaluation.barColorClass
                      : "bg-gray-200 dark:bg-gray-700/60"
                  }`}
                />
              );
            })}
          </div>

          {/* Criteria checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1 pt-0.5">
            {evaluation.criteria.map((c) => (
              <div
                key={c.id}
                className={`flex items-center gap-1.5 transition-colors duration-200 ${
                  c.met
                    ? "text-emerald-600 dark:text-emerald-400 font-medium"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 transition-colors duration-200 ${
                    c.met
                      ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {c.met ? (
                    <FiCheck className="w-2.5 h-2.5 stroke-[3]" />
                  ) : (
                    <span className="w-1 h-1 rounded-full bg-current opacity-70" />
                  )}
                </span>
                <span className="text-[11px] leading-tight">{c.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PasswordStrengthIndicator;
