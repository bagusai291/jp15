import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAffiliate } from '@/hooks/useAffiliate';
import { Copy, Share2, QrCode, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import QRCode from 'qrcode.react';

const ReferralLinkCard = () => {
  const { affiliate, referralLink, copyReferralLink } = useAffiliate();
  const { t } = useLanguage();
  const [showQR, setShowQR] = useState(false);
  
  // Add manual refresh function
  const handleRefresh = () => {
    console.log('Manually refreshing affiliate data');
    // Force a hard reload to get fresh data
    window.location.reload();
  };

  const handleCopyLink = () => {
    copyReferralLink();
    toast({
      title: 'Link disalin!',
      description: 'Link affiliate berhasil disalin ke clipboard',
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        // Check if we're in a secure context (https)
        if (window.location.protocol === 'https:') {
          await navigator.share({
            title: 'Injapan Food Affiliate',
            text: 'Belanja makanan Indonesia di Jepang dan dapatkan diskon dengan kode referral saya!',
            url: referralLink,
          });
        } else {
          // Fallback for non-secure contexts
          throw new Error('Share API requires HTTPS');
        }
      } catch (error) {
        copyReferralLink();
        toast({
          title: t('affiliate.linkCopied'),
          description: 'Dialog berbagi tidak tersedia. Link telah disalin ke clipboard.',
        });
      }
    } else {
      handleCopyLink();
    }
  };

  if (!affiliate) {
    return null;
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Share2 className="w-5 h-5 mr-2 text-primary" />
          {t('affiliate.yourAffiliateLink')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <div className="text-sm font-medium text-gray-700">{t('affiliate.referralCode')}</div>
          <div className="bg-gray-100 p-2 rounded-md font-mono text-center font-bold text-primary">
            {affiliate.referralCode}
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <div className="text-sm font-medium text-gray-700">{t('affiliate.yourAffiliateLink')}:</div>
          <div className="flex space-x-2">
            <Input
              value={referralLink}
              readOnly
              className="font-mono text-sm bg-gray-50"
            />
            <Button onClick={handleCopyLink} size="sm" className="shrink-0">
              <Copy className="w-4 h-4 mr-2" />
              {t('affiliate.copyLink')}
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-2">
          <Button onClick={handleShare} variant="outline" className="w-full">
            <Share2 className="w-4 h-4 mr-2" />
            {t('affiliate.shareLink')}
          </Button>
          <Button 
            onClick={() => setShowQR(!showQR)} 
            variant="outline" 
            className="w-full"
          >
            <QrCode className="w-4 h-4 mr-2" />
            {showQR ? t('affiliate.hideQR') : t('affiliate.showQR')}
          </Button>
        </div>

        {showQR && (
          <div className="flex flex-col items-center pt-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <QRCode 
                value={referralLink} 
                size={200} 
                level="H"
                includeMargin={true}
                renderAs="svg"
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {t('affiliate.scanQrToUse')}
            </p>
          </div>
        )}

        <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700 mt-4">
          <p>
            <span className="font-medium">{t('affiliate.tipTitle')}</span> {t('affiliate.tipMessage')}
          </p>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralLinkCard;