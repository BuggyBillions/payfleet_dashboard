import React from "react";
import type { ActionButtonProps } from "../../lib/interfaces";
const ActionButton: React.FC<ActionButtonProps> = ({
  text,
  loadingText,
  icon,
  loading,
  action,
  onClick,
  disabled,
  buttonStyle,
  overideBg,
  title,
  type = "button"
}) => {
  return (
    <button
      className={`${overideBg ? "" : `action-btn text-white`} h-10 px-4 min-w-25 rounded-md text-sm flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${buttonStyle}`}
      type={type}
      onClick={onClick || action}
      disabled={disabled || loading}
      title={title ? title : ""}
    >
      {icon && !loading && icon}
      {loading && (
        <span className="size-4 border-3 border-t-transparent border-primary/10 rounded-full animate-spin"></span>
      )}
      {loading && loadingText ? loadingText : text}
    </button>
  );
};

export default ActionButton;