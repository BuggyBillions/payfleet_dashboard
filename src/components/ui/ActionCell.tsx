import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaEye } from "react-icons/fa6";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { TfiMore } from "react-icons/tfi";
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
  FloatingPortal,
} from "@floating-ui/react";

import type { ActionCellProps, OtherActionProps } from "../../lib/interfaces";
export type { OtherActionProps };

const ActionCell: React.FC<ActionCellProps> = ({
  rowId,
  onEdit,
  onDelete,
  onView,
  canView = false,
  otherActions = [],
  toggleAction,
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { refs, floatingStyles } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-end",
    middleware: [offset(6), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  const setReferenceRef = useCallback(
    (node: HTMLDivElement | null) => {
      refs.setReference(node);
    },
    [refs],
  );

  const setFloatingRef = useCallback(
    (node: HTMLDivElement | null) => {
      refs.setFloating(node);
    },
    [refs],
  );

  // Handle clicking outside since Portal moves it out of the local DOM tree
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        // Only close if the click isn't inside the floating element itself
        const floatingEl = refs.floating.current;
        if (floatingEl && floatingEl.contains(event.target as Node)) return;

        setOpen(false);
      }
    };

    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, refs.floating]);

  return (
    <div ref={dropdownRef}>
      <div
        ref={setReferenceRef}
        className={`hover:bg-primary/10 w-8 h-8 flex items-center justify-center rounded-md cursor-pointer ${open ? "bg-primary/20" : ""}`}
        onClick={() => {
          setOpen(!open);
          if (toggleAction) {
            toggleAction();
          }
        }}
      >
        <TfiMore size={16} className="rotate-90 text-primary" />
      </div>

      {/* 2. Wrap the menu in FloatingPortal */}
      {open && (
        <FloatingPortal>
          <div
            ref={setFloatingRef}
            style={{ ...floatingStyles, zIndex: 9999 }}
            className="flex flex-col bg-white dark:bg-tertiary text-textBlack rounded-lg shadow-xl border border-primary/10 min-w-32 text-xs overflow-hidden"
          >
            {(canView || onView) && (
              <button
                className="flex items-center gap-2 px-3 py-2 hover:bg-secondary cursor-pointer border-b border-primary/10 text-xs"
                onClick={() => {
                  onView?.(rowId);
                  setOpen(false);
                }}
              >
                <FaEye className="text-textBlack/70" /> View
              </button>
            )}
            {onEdit && (
              <button
                className="flex items-center gap-2 px-3 py-2 hover:bg-secondary cursor-pointer border-b border-primary/10 text-xs"
                onClick={() => {
                  onEdit(rowId);
                  setOpen(false);
                }}
              >
                <FiEdit className="text-textBlack/70" /> Edit
              </button>
            )}
            {onDelete && (
              <button
                className="flex items-center gap-2 px-3 py-2 hover:bg-secondary cursor-pointer text-red-600 border-b border-primary/10 text-xs"
                onClick={() => {
                  onDelete(rowId);
                  setOpen(false);
                }}
              >
                <FiTrash2 /> Delete
              </button>
            )}
            {otherActions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.action();
                  setOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 hover:bg-secondary cursor-pointer border-b border-primary/10 last:border-b-0 text-xs"
              >
                {action.icon && (
                  <span className="text-inherit">{action.icon}</span>
                )}
                {action.name}
              </button>
            ))}
          </div>
        </FloatingPortal>
      )}
    </div>
  );
};

export default ActionCell;
