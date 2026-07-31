"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ShieldCheck } from "lucide-react";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PreviewModal({ isOpen, onClose }: PreviewModalProps) {
  // Close on ESC key press
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-modal-title"
        >
          {/* Dark Translucent Backdrop with Strong Blur & Vignette */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(24px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 bg-radial-vignette cursor-pointer"
          />

          {/* Ambient Glowing Lighting Spheres */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-[#610000]/30 via-[#e51c10]/20 to-[#8b0000]/30 rounded-full blur-3xl pointer-events-none animate-pulse" />

          {/* Modal Box Container with Animated Glowing Gradient Border */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg rounded-[32px] p-[1.5px] bg-gradient-to-br from-[#e51c10] via-[#8b0000] to-[#3d2c2a] shadow-[0_32px_64px_-16px_rgba(97,0,0,0.5)] z-10 overflow-hidden"
          >
            {/* Inner Glassmorphism Content Box */}
            <div className="relative bg-[#181110]/92 backdrop-blur-2xl rounded-[30px] p-6 sm:p-8 text-center text-white space-y-6 overflow-hidden">
              {/* Glass Reflection Highlight */}
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

              {/* Top Close Button */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 p-2 rounded-full text-[#e3beb8] hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close Preview Modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Animated Floating ✨ Icon Header */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8b0000] to-[#e51c10] text-white shadow-[0_8px_24px_rgba(229,28,16,0.4)] border border-white/20 mx-auto"
              >
                <Sparkles className="w-8 h-8 text-white animate-spin-slow" />
              </motion.div>

              {/* Title & Metadata Badges */}
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#ff907f]">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#8b0000]/60 border border-[#ff907f]/30">
                    Preview Build
                  </span>
                  <span>•</span>
                  <span>Version 0.9</span>
                </div>

                <h2
                  id="preview-modal-title"
                  className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight"
                >
                  Exclusive Client Preview
                </h2>
              </div>

              {/* Description Copy */}
              <div className="text-xs sm:text-sm text-[#e3beb8] leading-relaxed space-y-3 font-normal max-w-md mx-auto text-center">
                <p>
                  You are currently viewing an exclusive preview of the{" "}
                  <strong className="text-white font-semibold">Shop-O-Holics</strong> premium digital showroom.
                </p>
                <p>
                  This presentation highlights the visual experience, premium interactions and overall design direction.
                </p>
                <p className="text-xs text-[#e3beb8]/80">
                  The remaining customer journey, including shopping, checkout, account management and administration, is currently being finalized and will be demonstrated in the next presentation.
                </p>
                <p className="text-xs font-medium text-[#ff907f]">
                  We appreciate your feedback on the showroom experience.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto flex-1 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#8b0000] to-[#e51c10] hover:from-[#a00000] hover:to-[#ff281b] text-white font-bold text-xs tracking-wide transition-all shadow-lg hover:shadow-xl active:scale-95"
                >
                  Continue Exploring
                </button>

                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-[#e3beb8] hover:text-white font-bold text-xs tracking-wide border border-white/15 transition-all"
                >
                  Close Preview
                </button>
              </div>

              {/* Subtle Footer Note */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-center gap-1.5 text-[11px] text-[#8e706b]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#ff907f]" />
                <span>Prepared exclusively for Shop-O-Holics</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
