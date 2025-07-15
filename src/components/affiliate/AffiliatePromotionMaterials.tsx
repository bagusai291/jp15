import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAffiliate } from '@/hooks/useAffiliate';
import { toast } from '@/hooks/use-toast';
import { Copy, Download, Image, FileText, Link } from 'lucide-react';

const AffiliatePromotionMaterials = () => {
  const { affiliate, referralLink } = useAffiliate();
  const [activeTab, setActiveTab] = useState('banners');
  
  if (!affiliate) return null;
  
  // Sample banner images (in a real app, these would come from your backend)
  const banners = [
    {
      id: 'banner1',
      title: 'Indonesian Food Banner',
      description: 'Horizontal banner for websites and blogs',
      imageUrl: '/placeholder.svg',
      width: 728,
      height: 90
    },
    {
      id: 'banner2',
      title: 'Square Promo',
      description: 'Perfect for social media posts',
      imageUrl: '/placeholder.svg',
      width: 300,
      height: 300
    },
    {
      id: 'banner3',
      title: 'Vertical Banner',
      description: 'For sidebars and narrow spaces',
      imageUrl: '/placeholder.svg',
      width: 160,
      height: 600
    }
  ];
  
  // Sample text templates
  const textTemplates = [
    {
      id: 'text1',
      title: 'Social Media Post',
      content: `Rindu masakan Indonesia di Jepang? Cek Injapan Food untuk makanan Indonesia asli dengan pengiriman cepat ke seluruh Jepang! Gunakan kode referral saya ${affiliate.referralCode} atau klik link ini untuk diskon: ${referralLink}`
    },
    {
      id: 'text2',
      title: 'WhatsApp Message',
      content: `Halo! Saya ingin merekomendasikan Injapan Food untuk kebutuhan makanan Indonesia di Jepang. Mereka punya koleksi lengkap dengan harga terjangkau. Gunakan kode referral saya ${affiliate.referralCode} untuk mendapatkan diskon: ${referralLink}`
    },
    {
      id: 'text3',
      title: 'Email Template',
      content: `Subject: Temukan Makanan Indonesia Asli di Jepang\n\nHai,\n\nSaya baru saja menemukan toko online yang menjual berbagai makanan Indonesia di Jepang. Namanya Injapan Food dan mereka menawarkan pengiriman ke seluruh Jepang.\n\nJika kamu rindu masakan Indonesia, coba kunjungi website mereka dan gunakan kode referral saya ${affiliate.referralCode} untuk mendapatkan diskon.\n\n${referralLink}\n\nSalam,\n[Nama Kamu]`
    }
  ];
  
  // Sample HTML snippets
  const htmlSnippets = [
    {
      id: 'html1',
      title: 'Banner with Link',
      content: `<a href="${referralLink}" target="_blank" title="Injapan Food - Indonesian Food in Japan">
  <img src="https://injapanfood.com/banners/banner1.jpg" alt="Injapan Food" width="728" height="90" />
</a>`
    },
    {
      id: 'html2',
      title: 'Text Link with Referral',
      content: `<a href="${referralLink}" target="_blank">Get authentic Indonesian food in Japan with my referral code: ${affiliate.referralCode}</a>`
    },
    {
      id: 'html3',
      title: 'Call to Action Button',
      content: `<a href="${referralLink}" target="_blank" style="display: inline-block; background-color: #b91c1c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Shop Indonesian Food Now</a>`
    }
  ];
  
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard!',
      description: 'You can now paste this text wherever you want',
    });
  };
  
  const handleDownloadBanner = (banner: any) => {
    // In a real app, this would download the actual banner
    // For this example, we'll just show a toast
    toast({
      title: 'Banner download started',
      description: `Downloading ${banner.title}...`,
    });
  };

  return (
    <Card className="border-primary/10 hover:shadow-md transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 pb-4">
        <CardTitle className="flex items-center text-xl">
          <Image className="w-5 h-5 mr-2 text-primary" />
          Promotion Materials
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="mb-6">
          <p className="text-gray-600">
            Use these ready-made promotional materials to share your affiliate link and earn more commissions.
            Simply copy and paste these materials into your website, social media, or messages.
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="banners" className="flex items-center">
              <Image className="w-4 h-4 mr-2" />
              Banners
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Text Templates
            </TabsTrigger>
            <TabsTrigger value="html" className="flex items-center">
              <Link className="w-4 h-4 mr-2" />
              HTML Snippets
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="banners" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {banners.map((banner) => (
                <div key={banner.id} className="border rounded-lg overflow-hidden">
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    <img 
                      src={banner.imageUrl} 
                      alt={banner.title}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-1">{banner.title}</h3>
                    <p className="text-sm text-gray-500 mb-3">{banner.description}</p>
                    <div className="text-xs text-gray-500 mb-3">
                      {banner.width} × {banner.height} pixels
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleDownloadBanner(banner)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="text" className="space-y-6">
            {textTemplates.map((template) => (
              <div key={template.id} className="border rounded-lg overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                  <h3 className="font-medium text-gray-900">{template.title}</h3>
                </div>
                <div className="p-4">
                  <div className="bg-gray-50 p-4 rounded-lg mb-4 whitespace-pre-wrap text-sm text-gray-700">
                    {template.content}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleCopyText(template.content)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Text
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="html" className="space-y-6">
            {htmlSnippets.map((snippet) => (
              <div key={snippet.id} className="border rounded-lg overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                  <h3 className="font-medium text-gray-900">{snippet.title}</h3>
                </div>
                <div className="p-4">
                  <div className="bg-gray-50 p-4 rounded-lg mb-4 overflow-x-auto">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                      {snippet.content}
                    </pre>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleCopyText(snippet.content)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy HTML
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AffiliatePromotionMaterials;