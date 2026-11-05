import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import Modal from "./Modal";
import PaymentReceipt from "../PaymentReceipt";
import type { SalaryPayment } from "../../lib/interfaces";

export interface PaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: SalaryPayment | null;
  companyName?: string;
  companyLogo?: string;
  senderEmail?: string;
}

/**
 * Replaces modern color functions (color-mix, oklab, oklch) in CSS text
 * with safe sRGB fallbacks so html2canvas doesn't throw unsupported color errors.
 */
const sanitizeCssColors = (cssText: string): string => {
  const prefixes = ["color-mix(", "oklab(", "oklch("];
  let res = cssText;

  for (const prefix of prefixes) {
    let result = "";
    let idx = 0;
    while (true) {
      const matchIdx = res.indexOf(prefix, idx);
      if (matchIdx === -1) {
        result += res.slice(idx);
        break;
      }
      result += res.slice(idx, matchIdx);
      let depth = 1;
      let endIdx = matchIdx + prefix.length;
      while (endIdx < res.length && depth > 0) {
        if (res[endIdx] === "(") depth++;
        else if (res[endIdx] === ")") depth--;
        endIdx++;
      }
      result += "#2a5d56";
      idx = endIdx;
    }
    res = result;
  }

  return res;
};

const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  isOpen,
  onClose,
  payment,
  companyName,
  companyLogo,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !payment) return null;

  const handleDownload = async () => {
    if (!receiptRef.current) return;
    setIsDownloading(true);
    const toastId = toast.loading("Generating receipt image...");

    try {
      // Small pause to ensure DOM rendering, images, and fonts are completely stable
      await new Promise((r) => setTimeout(r, 150));

      const target = receiptRef.current;

      const canvas = await html2canvas(target, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: target.scrollWidth,
        windowHeight: target.scrollHeight,
        ignoreElements: (element) =>
          element.classList?.contains("no-capture") ||
          element.classList?.contains("print:hidden"),
        onclone: (clonedDoc: Document, clonedTarget: HTMLElement) => {
          // 1. Force solid background color on root elements of the cloned document
          if (clonedDoc.documentElement) {
            clonedDoc.documentElement.style.backgroundColor = "#ffffff";
          }
          if (clonedDoc.body) {
            clonedDoc.body.style.backgroundColor = "#ffffff";
          }

          // 2. Sanitize all <style> elements in cloned document to remove any oklab/oklch/color-mix
          const styleTags = clonedDoc.querySelectorAll("style");
          styleTags.forEach((tag) => {
            if (
              tag.textContent &&
              (tag.textContent.includes("oklab") ||
                tag.textContent.includes("oklch") ||
                tag.textContent.includes("color-mix"))
            ) {
              tag.textContent = sanitizeCssColors(tag.textContent);
            }
          });

          // 3. Convert all element colors to sRGB using native 2D canvas context
          const offscreenCanvas = clonedDoc.createElement("canvas");
          offscreenCanvas.width = 1;
          offscreenCanvas.height = 1;
          const ctx = offscreenCanvas.getContext("2d");
          if (!ctx) return;

          const elements = [
            clonedTarget,
            ...Array.from(clonedTarget.querySelectorAll("*")),
          ] as HTMLElement[];

          const colorProps = [
            "color",
            "backgroundColor",
            "borderColor",
            "borderTopColor",
            "borderBottomColor",
            "borderLeftColor",
            "borderRightColor",
            "outlineColor",
            "textDecorationColor",
            "fill",
            "stroke",
          ] as const;

          const getComputed = (el: Element) =>
            clonedDoc.defaultView?.getComputedStyle(el) ||
            window.getComputedStyle(el);

          elements.forEach((el) => {
            if (!el || !el.style) return;
            const computed = getComputed(el);

            // Convert standard color properties
            colorProps.forEach((prop) => {
              const val = computed[prop as keyof CSSStyleDeclaration] as string;
              if (
                val &&
                typeof val === "string" &&
                (val.includes("oklab") ||
                  val.includes("oklch") ||
                  val.includes("color-mix") ||
                  val.includes("lab"))
              ) {
                try {
                  ctx.fillStyle = "#ffffff";
                  ctx.fillStyle = val;
                  const srgb = ctx.fillStyle;
                  if (
                    srgb &&
                    !srgb.includes("oklab") &&
                    !srgb.includes("oklch")
                  ) {
                    el.style.setProperty(prop, srgb);
                  } else {
                    el.style.setProperty(prop, "#2a5d56");
                  }
                } catch {
                  el.style.setProperty(prop, "#2a5d56");
                }
              }
            });

            // Convert box-shadow
            const boxShadow = computed.boxShadow;
            if (
              boxShadow &&
              typeof boxShadow === "string" &&
              (boxShadow.includes("oklab") ||
                boxShadow.includes("oklch") ||
                boxShadow.includes("color-mix"))
            ) {
              try {
                el.style.boxShadow = sanitizeCssColors(boxShadow);
              } catch {
                el.style.boxShadow = "none";
              }
            }
          });
        },
      });

      const safeRef = String(payment.reference || payment.id).replace(
        /[^a-zA-Z0-9_-]/g,
        "_",
      );
      const filename = `receipt-${safeRef}.png`;

      // Use toBlob for robust browser download without base64 URI length limits
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/png", 1.0);
      });

      const link = document.createElement("a");
      link.download = filename;

      if (blob) {
        const objectUrl = URL.createObjectURL(blob);
        link.href = objectUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
      } else {
        link.href = canvas.toDataURL("image/png");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      toast.success("Receipt downloaded successfully!", { id: toastId });
    } catch (err) {
      console.error("Failed to download receipt:", err);
      toast.error("Could not generate receipt image. Please try again.", {
        id: toastId,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Modal onClose={onClose} customMode={true}>
      <div className="relative max-w-lg w-full max-h-[92vh] overflow-y-auto styled-scrollbar p-1">
        <div ref={receiptRef}>
          <PaymentReceipt
            payment={payment}
            companyName={companyName}
            companyLogo={companyLogo}
            onClose={onClose}
            onDownload={handleDownload}
            isDownloading={isDownloading}
            showActions={true}
          />
        </div>
      </div>
    </Modal>
  );
};

export default PaymentReceiptModal;
