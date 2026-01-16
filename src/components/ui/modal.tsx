"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function Modal({ isOpen, onClose, children, title, className }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Prevent scrolling when modal is open
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted) return null;
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity" 
        onClick={onClose}
      />

      {/* Content */}
      <div 
        className={cn(
          "relative w-full max-w-lg rounded-xl bg-white p-4 md:p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200",
          className
        )}
      >
        <button 
             onClick={onClose}
             className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
             <X className="h-4 w-4" />
             <span className="sr-only">Close</span>
        </button>
        
        {title && (
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-foreground tracking-tight">{title}</h2>
            </div>
        )}
        
        {children}
      </div>
    </div>,
    document.body
  );
}
