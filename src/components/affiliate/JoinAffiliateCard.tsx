import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAffiliate } from '@/hooks/useAffiliate';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { DollarSign, Check, AlertCircle } from 'lucide-react';

const JoinAffiliateCard = () => {
  const { joinAffiliate, loading, settings } = useAffiliate();
  const { t } = useLanguage();
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async () => {
    try {
      setIsJoining(true);
      await joinAffiliate();
      toast({
        title: 'Berhasil bergabung!',
        description: 'Anda telah berhasil bergabung dengan program affiliate',
      });
    } catch (error) {
      console.error('Error joining affiliate program:', error);
      toast({
        title: 'Gagal bergabung',
        description: 'Terjadi kesalahan saat bergabung dengan program affiliate',
        variant: 'destructive',
      });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="bg-primary/5">
        <CardTitle className="flex items-center text-primary">
          <DollarSign className="w-5 h-5 mr-2" />
          {t('affiliate.title')} Injapan Food
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {t('affiliate.earnExtra')}
          </h3>
          <p className="text-gray-600">
            {t('affiliate.shareLink')}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="bg-green-100 p-1 rounded-full">
              <Check className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{t('affiliate.attractiveCommission')}</h4>
              <p className="text-sm text-gray-600">
                {t('affiliate.commissionRate', { rate: settings?.defaultCommissionRate || 5 })}
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="bg-green-100 p-1 rounded-full">
              <Check className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{t('affiliate.easyToUse')}</h4>
              <p className="text-sm text-gray-600">
                {t('affiliate.shareToFriends')}
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="bg-green-100 p-1 rounded-full">
              <Check className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{t('affiliate.fastPayout')}</h4>
              <p className="text-sm text-gray-600">
                {t('affiliate.minimumPayout', { amount: settings?.minPayoutAmount?.toLocaleString() || '5,000' })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-md flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800">{t('affiliate.termsConditions')}</h4>
            <p className="text-sm text-blue-700 mt-1">
              {t('affiliate.termsMessage')}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleJoin} 
          disabled={isJoining || loading}
          className="w-full"
        >
          {isJoining ? t('affiliate.processing') : t('affiliate.join')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default JoinAffiliateCard;