"use client";

import { useEffect, useRef, useState } from "react";
import { signout } from "@/app/actions/auth";
import { AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const INACTIVITY_LIMIT_MS = 2 * 60 * 60 * 1000; // 2 hours
const WARNING_TIME_MS = 5 * 60 * 1000; // 5 minutes before logout

export function SessionManager({ keepSignedIn }: { keepSignedIn: boolean }) {
  const [showWarning, setShowWarning] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>(null);
  const warningRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    // If they chose to keep signed in, we don't enforce inactivity logout
    if (keepSignedIn) return;

    const resetTimers = () => {
      setShowWarning(false);
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);

      warningRef.current = setTimeout(() => {
        setShowWarning(true);
      }, INACTIVITY_LIMIT_MS - WARNING_TIME_MS);

      timeoutRef.current = setTimeout(() => {
        // Log out immediately
        signout();
      }, INACTIVITY_LIMIT_MS);
    };

    const handleActivity = () => {
      resetTimers();
    };

    // Attach event listeners for activity
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, handleActivity, { passive: true }));

    resetTimers(); // Start initial timer

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [keepSignedIn]);

  return (
    <AnimatePresence>
      {showWarning && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-4 right-4 z-50 w-full max-w-sm"
        >
          <div className="bg-[var(--color-warning-light)] text-[var(--color-warning)] border border-[var(--color-warning)] flex items-start gap-3 p-4 rounded-lg shadow-xl">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold text-sm">Session Expiring Soon</h3>
              <p className="text-xs opacity-90">
                You will be logged out in 5 minutes due to inactivity. Move your mouse or click anywhere to stay signed in.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
