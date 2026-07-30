"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    const isInStandalone = window.matchMedia("(display-mode: standalone)").matches
      || (navigator as any).standalone;
    setIsStandalone(isInStandalone);
    if (isInStandalone) return;

    // Detect iOS
    const ios = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    setIsIOS(ios);

    // Listen for install prompt (Android/Chrome)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Show iOS banner after a delay
    if (ios) {
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handler);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
  };

  if (!showBanner || isStandalone) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 200 }}
        className="fixed bottom-4 left-4 right-4 z-50 safe-bottom"
      >
        <div className="glass-card p-4 flex items-center gap-4 shadow-2xl border border-primary-500/20">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shrink-0">
            <Download className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary">Install Home Control Center</p>
            <p className="text-xs text-text-muted mt-0.5">
              {isIOS
                ? "Tap the Share button and select 'Add to Home Screen'"
                : "Add to your home screen for quick access"}
            </p>
          </div>

          {isIOS ? (
            <button
              onClick={() => setShowBanner(false)}
              className="p-2 rounded-lg bg-bg-elevated border border-border-default text-text-muted hover:text-text-secondary shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowBanner(false)}
                className="p-2 rounded-lg text-text-muted hover:text-text-secondary"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={handleInstall}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-medium"
              >
                Install
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
