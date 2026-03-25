'use client';

import { Download } from 'lucide-react';
import { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    setIsInstalling(true);

    try {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
    } finally {
      setDeferredPrompt(null);
      setIsInstalling(false);
    }
  };

  if (isStandalone || !deferredPrompt) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleInstall}
      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-blue-500 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
      aria-label="Install SetVenue app"
      disabled={isInstalling}
    >
      <Download className="h-4 w-4" />
      {isInstalling ? 'Installing…' : 'Install App'}
    </button>
  );
}
