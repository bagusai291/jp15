import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAffiliate } from '@/hooks/useAffiliate';
import { Copy, Share2, QrCode, RefreshCw, Facebook, Twitter, Linkedin, Mail, Link as LinkIcon, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import QRCode from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ModernReferralLinkCard = () => {
  const { affiliate, referralLink, copyReferralLink } = useAffiliate();
  const { t } = useLanguage();
  const [showQR, setShowQR] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isCodeCopied, setIsCodeCopied] = useState(false);
  const linkInputRef = useRef<HTMLInputElement>(null);
  
  const handleCopyLink = () => {
    copyReferralLink();
    setIsCopied(true);
    toast({
      title: t('affiliate.linkCopied'),
      description: 'Link affiliate berhasil disalin ke clipboard',
    });
    
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCopyCode = () => {
    if (affiliate?.referralCode) {
      navigator.clipboard.writeText(affiliate.referralCode);
      setIsCodeCopied(true);
      toast({
        title: 'Kode referral disalin!',
        description: 'Kode referral berhasil disalin ke clipboard',
      });
      
      setTimeout(() => setIsCodeCopied(false), 2000);
    }
  };

  const handleShare = async (platform: string) => {
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('Belanja makanan Indonesia di Jepang dan dapatkan diskon dengan kode referral saya!')}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent('Belanja makanan Indonesia di Jepang')}&body=${encodeURIComponent(`Halo! Saya ingin berbagi link belanja makanan Indonesia di Jepang. Gunakan link ini untuk mendapatkan diskon: ${referralLink}`)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`Halo! Saya ingin berbagi link belanja makanan Indonesia di Jepang. Gunakan link ini untuk mendapatkan diskon: ${referralLink}`)}`;
        break;
      default:
        // Default to copy
        handleCopyLink();
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    
    setShowShareOptions(false);
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById('affiliate-qr-code') as HTMLCanvasElement;
    if (!canvas) return;
    
    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = 'affiliate-qr-code.png';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    toast({
      title: 'QR Code diunduh!',
      description: 'QR Code berhasil diunduh',
    });
  };

  if (!affiliate) {
    return null;
  }

  return (
    <Card className="overflow-hidden border-primary/10 hover:shadow-md transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 pb-4">
        <CardTitle className="flex items-center text-xl">
          <LinkIcon className="w-5 h-5 mr-2 text-primary" />
          {t('affiliate.yourAffiliateLink')}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Referral Code Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700">{t('affiliate.referralCode')}</label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2 text-gray-500 hover:text-primary"
                  >
                    <Info className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">
                    Share this code with friends or use it in your promotions. When someone uses this code, you'll earn commission on their purchases.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="flex">
            <div className="bg-gray-50 p-3 rounded-l-lg border border-r-0 border-gray-200 font-mono text-center font-bold text-primary flex-1">
              {affiliate.referralCode}
            </div>
            <Button
              onClick={handleCopyCode}
              variant="outline"
              className={`rounded-l-none border-gray-200 ${isCodeCopied ? 'bg-green-50 text-green-600 border-green-200' : ''}`}
            >
              {isCodeCopied ? (
                <>
                  <span className="sr-only">Copied!</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Affiliate Link Section */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">{t('affiliate.yourAffiliateLink')}</label>
          <div className="flex">
            <Input
              ref={linkInputRef}
              value={referralLink}
              readOnly
              className="font-mono text-sm bg-gray-50 rounded-r-none border-r-0"
            />
            <Button
              onClick={handleCopyLink}
              variant="default"
              className={`rounded-l-none ${isCopied ? 'bg-green-600' : 'bg-primary'}`}
            >
              {isCopied ? (
                <>
                  <span className="sr-only">Copied!</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  <span>{t('affiliate.copyLink')}</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Share and QR Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Popover open={showShareOptions} onOpenChange={setShowShareOptions}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="flex-1 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary"
              >
                <Share2 className="w-4 h-4 mr-2" />
                {t('affiliate.shareLink')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" align="center">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-9 h-9 p-0 text-blue-600"
                  onClick={() => handleShare('facebook')}
                >
                  <Facebook className="w-4 h-4" />
                  <span className="sr-only">Share on Facebook</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-9 h-9 p-0 text-blue-400"
                  onClick={() => handleShare('twitter')}
                >
                  <Twitter className="w-4 h-4" />
                  <span className="sr-only">Share on Twitter</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-9 h-9 p-0 text-blue-700"
                  onClick={() => handleShare('linkedin')}
                >
                  <Linkedin className="w-4 h-4" />
                  <span className="sr-only">Share on LinkedIn</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-9 h-9 p-0 text-green-600"
                  onClick={() => handleShare('whatsapp')}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.515z"/>
                  </svg>
                  <span className="sr-only">Share on WhatsApp</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-9 h-9 p-0 text-gray-600"
                  onClick={() => handleShare('email')}
                >
                  <Mail className="w-4 h-4" />
                  <span className="sr-only">Share via Email</span>
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button 
            variant="outline" 
            className="flex-1 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary"
            onClick={() => setShowQR(!showQR)}
          >
            <QrCode className="w-4 h-4 mr-2" />
            {showQR ? t('affiliate.hideQR') : t('affiliate.showQR')}
          </Button>
        </div>

        {/* QR Code Section */}
        <AnimatePresence>
          {showQR && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col items-center pt-2">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <QRCode 
                    id="affiliate-qr-code"
                    value={referralLink} 
                    size={200} 
                    level="H"
                    includeMargin={true}
                    renderAs="canvas"
                    className="rounded-md"
                  />
                </div>
                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                  <p className="text-sm text-gray-500 mb-2 sm:mb-0 sm:mr-3 self-center">
                    {t('affiliate.scanQrToUse')}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={downloadQRCode}
                    className="text-primary border-primary/20"
                  >
                    Download QR
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tips Section */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-4">
          <div className="flex items-start">
            <div className="bg-blue-100 p-1.5 rounded-full text-blue-600 mr-3 mt-0.5">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-medium text-blue-800 text-sm mb-1">{t('affiliate.tipTitle')}</h4>
              <p className="text-sm text-blue-700">
                {t('affiliate.tipMessage')}
              </p>
              <ul className="mt-2 space-y-1 text-xs text-blue-700">
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                  Share on social media for maximum reach
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                  Include in your blog or website content
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                  Send directly to friends who might be interested
                </li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-gray-50 px-6 py-4 border-t">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => window.location.reload()} 
          className="text-gray-600 hover:text-primary hover:bg-primary/5 ml-auto"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ModernReferralLinkCard;