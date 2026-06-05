// contexts/DoubleClickToExit.tsx (نسخة مبسطة)
"use client";

import React, { useEffect, useRef, useState } from "react";

interface DoubleClickToExitProps {
  children: React.ReactNode;
  message?: string;
  timeout?: number;
}

declare global {
  interface Window {
    electronAPI?: {
      closeApp: () => void;
    };
  }
}

const DoubleClickToExit: React.FC<DoubleClickToExitProps> = ({
  children,
  message: customMessage = "اضغط مرة أخرى للخروج من التطبيق",
  timeout = 1000,
}) => {
  const backPressCount = useRef<number>(0);
  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  const [toastMessage, setToastMessage] = useState<string>("");

  const showToast = (message: string): void => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 2000);
  };

  const exitApp = (): void => {
    showToast("جاري الخروج...");
    setTimeout(() => {
      if (window.electronAPI?.closeApp) {
        window.electronAPI.closeApp();
      }
      window.close();
      setTimeout(() => {
        if (!window.closed) {
        //   window.location.href = "about:blank";
        }
      }, 3000);
    }, 300);
  };

  const resetCounter = (): void => {
    backPressCount.current = 0;
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
      timeoutId.current = null;
    }
  };

  useEffect(() => {
    history.pushState(null, "", location.href);

    const handlePopState = (event: PopStateEvent): void => {
      event.preventDefault();
      history.pushState(null, "", location.href);
      backPressCount.current++;

      if (backPressCount.current === 1) {
        showToast(customMessage);
        timeoutId.current = setTimeout(resetCounter, timeout);
      } else if (backPressCount.current >= 2) {
        if (timeoutId.current) clearTimeout(timeoutId.current);
        exitApp();
        resetCounter();
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (timeoutId.current) clearTimeout(timeoutId.current);
    };
  }, [customMessage, timeout]);

  return (
    <>
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#333",
            color: "white",
            padding: "10px 20px",
            borderRadius: "8px",
            zIndex: 9999,
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
          }}
        >
          ⚠️ {toastMessage}
        </div>
      )}
      {children}
    </>
  );
};

export default DoubleClickToExit;
