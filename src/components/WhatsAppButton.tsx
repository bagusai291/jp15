import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useLanguage } from '@/hooks/useLanguage';

const InstallPWAButton = () => {
  const { 
    isInstallable, 
    isIOSDevice, 
    isStandalone,
    showIOSInstructions, 
    setShowIOSInstructions,
    handleInstallClick 
  } = usePWAInstall();

  const { t } = useLanguage();

  // Don't show the button if the app is already installed or not installable
  if (isStandalone || (!isInstallable && !isIOSDevice)) return null;

  return (
    <div className="fixed bottom-20 right-6 z-40">
      {showIOSInstructions ? (
        <div className="bg-white p-4 rounded-lg shadow-lg max-w-xs">
          <h3 className="font-bold mb-2">{t('pwa.iosInstallation') || 'iOS Installation:'}</h3>
          <ol className="text-sm space-y-1 list-decimal pl-4 mb-3">
            <li>{t('pwa.iosTapShare') || 'Tap the "Share" icon (box with arrow up)'}</li>
            <li>{t('pwa.iosScrollSelect') || 'Scroll and select "Add to Home Screen"'}</li>
            <li>{t('pwa.iosTapAdd') || 'Tap "Add" in the top right corner'}</li>
          </ol>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setShowIOSInstructions(false)}
            className="w-full"
          >
            {t('pwa.close') || 'Close'}
          </Button>
        </div>
      ) : (
        <Button 
          onClick={handleInstallClick}
          className="shadow-lg bg-primary hover:bg-primary/90 text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          ⬇️ Download Aplikasi
        </Button>
      )}
    </div>
  );
};

export default InstallPWAButton;