// hooks/usePWAInstall.ts
"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // التحقق مما إذا كان التطبيق مثبتاً مسبقاً
    const checkInstalled = () => {
      const storedInstallState = localStorage.getItem('pwa_installed');
      if (storedInstallState === 'true') {
        setIsInstalled(true);
        return true;
      }

      // التحقق من حالة display-mode
      if (window.matchMedia('(display-mode: standalone)').matches) {
        localStorage.setItem('pwa_installed', 'true');
        setIsInstalled(true);
        return true;
      }

      return false;
    };

    // إذا كان مثبتاً مسبقاً، لا نستمع للأحداث
    if (checkInstalled()) {
      return;
    }

    // الاستماع لحدث beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // الاستماع لحدث التثبيت الناجح
    const handleAppInstalled = () => {
      localStorage.setItem('pwa_installed', 'true');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('✅ تم تثبيت التطبيق بنجاح');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // مراقبة تغيير display-mode
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        localStorage.setItem('pwa_installed', 'true');
        setIsInstalled(true);
      }
    };
    mediaQuery.addEventListener('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      mediaQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  const installApp = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      console.log('⚠️ لا يمكن التثبيت الآن');
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        localStorage.setItem('pwa_installed', 'true');
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
        console.log('✅ المستخدم وافق على التثبيت');
        return true;
      } else {
        // المستخدم رفض - سنحاول مرة أخرى لاحقاً
        localStorage.setItem('pwa_install_declined_at', Date.now().toString());
        console.log('❌ المستخدم رفض التثبيت');
        return false;
      }
    } catch (error) {
      console.error('❌ فشل التثبيت:', error);
      return false;
    }
  };

  const resetInstallPrompt = () => {
    localStorage.removeItem('pwa_installed');
    localStorage.removeItem('pwa_install_declined_at');
    setIsInstalled(false);
    setIsInstallable(false);
    setDeferredPrompt(null);
  };

  return {
    isInstallable,
    isInstalled,
    installApp,
    resetInstallPrompt
  };
}