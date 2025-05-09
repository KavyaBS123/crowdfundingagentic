import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export const PwaInstallBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if already installed or previously dismissed
    const isPwaInstalled = window.matchMedia('(display-mode: standalone)').matches;
    const isDismissed = localStorage.getItem('pwaInstallDismissed') === 'true';
    
    if (isPwaInstalled || isDismissed) {
      setIsVisible(false);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 76+ from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show the install banner
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // Reset the deferredPrompt variable
    setDeferredPrompt(null);
    
    // Hide the banner regardless of outcome
    setIsVisible(false);
    
    // Log the outcome
    console.log(`User ${outcome} the A2HS prompt`);
  };

  const handleDismiss = () => {
    // Mark as dismissed in localStorage
    localStorage.setItem('pwaInstallDismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-16 lg:bottom-4 left-4 right-4 lg:left-auto lg:right-4 lg:w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 z-40 slide-in">
      <div className="flex items-center">
        <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mr-4">
          <i className="ri-hand-heart-line text-white text-xl"></i>
        </div>
        <div className="flex-1">
          <h3 className="font-bold mb-1">Install App</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Add CrowdChain to your home screen</p>
        </div>
        <Button onClick={handleInstall} variant="link" className="text-primary font-medium">
          Install
        </Button>
        <Button onClick={handleDismiss} variant="ghost" className="ml-1 text-gray-400">
          <i className="ri-close-line"></i>
        </Button>
      </div>
    </div>
  );
};
