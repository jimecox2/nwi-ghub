"use client";

// Lightweight modal Dialog primitive (plain Tailwind, no Radix). Controlled via
// `open` / `onOpenChange`, matching the API the ported components expect.
import { useEffect } from "react";

export function Dialog({ open, onOpenChange, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onOpenChange?.(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={() => onOpenChange?.(false)} />
      {children}
    </div>
  );
}

export function DialogContent({ className = "", children, ...props }) {
  return (
    <div className={`relative z-10 w-full max-w-lg rounded-lg bg-white p-6 shadow-xl ${className}`} {...props}>
      {children}
    </div>
  );
}

export function DialogHeader({ className = "", ...props }) {
  return <div className={`mb-4 ${className}`} {...props} />;
}

export function DialogTitle({ className = "", ...props }) {
  return <h2 className={`text-lg font-semibold text-gray-900 ${className}`} {...props} />;
}

export function DialogDescription({ className = "", ...props }) {
  return <p className={`mt-1 text-sm text-gray-500 ${className}`} {...props} />;
}

export function DialogFooter({ className = "", ...props }) {
  return <div className={`mt-6 flex justify-end gap-2 ${className}`} {...props} />;
}

export default Dialog;
