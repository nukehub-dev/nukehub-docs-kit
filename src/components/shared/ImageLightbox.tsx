import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ImageLightboxProps {
  src: string;
  alt: string;
  caption?: string;
  open: boolean;
  onClose: () => void;
}

export function ImageLightbox({ src, alt, caption, open, onClose }: ImageLightboxProps) {
  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    document.body.classList.add("overflow-hidden");
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.classList.remove("overflow-hidden");
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/60 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close image"
          >
            <X size={24} />
          </button>

          <img src={src} alt={alt} className="max-h-[85vh] max-w-full rounded-xl object-contain" />

          {caption && <p className="max-w-2xl text-center text-sm text-white/80">{caption}</p>}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
