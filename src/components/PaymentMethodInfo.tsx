import { useState, useEffect } from 'react';
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter';
import { useLanguage } from '@/hooks/useLanguage';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CreditCard, RefreshCw, QrCode, Info, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaymentMethodInfoProps {
  paymentMethod: string;
  totalAmount: number;
}

const PaymentMethodInfo = ({ paymentMethod, totalAmount }: PaymentMethodInfoProps) => {
  const { convertedRupiah, isLoading, error, refreshRate, lastUpdated, isRefreshing } = useCurrencyConverter(totalAmount, paymentMethod);
  const { t } = useLanguage();
  const [showRefreshAnimation, setShowRefreshAnimation] = useState(false);

  const handleRefreshRate = () => {
    setShowRefreshAnimation(true);
    refreshRate();
    setTimeout(() => setShowRefreshAnimation(false), 1000);
  };

  if (!paymentMethod) return null;

  // Common header for all payment methods
  const renderHeader = () => (
    <div className="flex items-center space-x-2 mb-4">
      <CreditCard className="w-5 h-5 text-primary" />
      <h3 className="font-semibold text-gray-800 text-lg">{t('checkout.paymentInfo')}</h3>
    </div>
  );

  // Common payment amount display for all methods
  const renderPaymentAmount = () => (
    <div className="bg-primary/5 p-4 rounded-lg mb-4 text-center">
      <p className="text-sm text-gray-600 mb-1">{t('cart.total')}</p>
      <p className="text-2xl font-bold text-primary">¥{totalAmount.toLocaleString()}</p>
    </div>
  );

  // Render Bank Transfer (Rupiah) method
  const renderBankTransferRupiah = () => (
    <>
      {renderHeader()}
      {renderPaymentAmount()}
      
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
        <h4 className="font-medium text-blue-800 mb-3 flex items-center">
          <CreditCard className="w-4 h-4 mr-2" />
          {t('checkout.totalInRupiah')} 
        </h4>
        
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            {isLoading || isRefreshing ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                <span className="text-blue-600">{t('checkout.converting')}</span>
              </div>
            ) : (
              <span className="font-bold text-blue-700 text-xl">
                Rp {convertedRupiah?.toLocaleString('id-ID') || '-'}
              </span>
            )}
          </div>
          <Button 
            onClick={handleRefreshRate}
            variant="outline"
            size="sm"
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${showRefreshAnimation ? 'animate-spin' : ''}`} />
            {isRefreshing ? t('checkout.refreshing') : t('checkout.refreshRate')}
          </Button>
        </div>
        
        {lastUpdated && (
          <p className="text-xs text-blue-600 flex items-center mb-3">
            <Info className="w-3 h-3 mr-1" />
            {t('checkout.automaticRate')} {lastUpdated}
          </p>
        )}
        
        {error && (
          <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-md text-xs text-yellow-700 mb-3">
            <p className="flex items-center">
              <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0" />
              {error}
            </p>
          </div>
        )}
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
        <h4 className="font-medium text-gray-800 mb-3">{t('checkout.accountInfo')}</h4>
        <div className="space-y-2">
          <div>
            <span className="text-gray-600 block">{t('checkout.bank')}</span>
            <span className="font-medium">Bank BRI</span>
          </div>
          <div>
            <span className="text-gray-600 block">{t('checkout.accountNumber')}</span>
            <span className="font-medium">0409 0100 2213 564</span>
          </div>
          <div>
            <span className="text-gray-600 block">{t('checkout.accountName')}</span>
            <span className="font-medium">INJAPAN LINK INDONESIA</span>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
        <h4 className="font-medium text-blue-800 mb-2">{t('checkout.paymentInstructions')}</h4>
        <ol className="list-decimal ml-5 space-y-1 text-blue-700 text-sm">
          <li>Lakukan transfer ke rekening berikut: Bank BRI 0409 0100 2213 564 a.n. INJAPAN LINK INDONESIA</li>
          <li>Transfer dengan nominal yang tepat: ¥{totalAmount} / Rp{convertedRupiah?.toLocaleString('id-ID') || '-'}</li>
          <li>Simpan bukti pembayaran (screenshot atau foto resi transfer)</li>
          <li>{t('checkout.uploadProofStep')}</li>
        </ol>
      </div>
    </>
  );

  // Render Bank Transfer (Yucho) method
  const renderBankTransferYucho = () => (
    <>
      {renderHeader()}
      {renderPaymentAmount()}
      
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
        <h4 className="font-medium text-gray-800 mb-3">{t('checkout.accountInfo')}</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">{t('checkout.bank')}</span>
            <span className="font-medium">Yucho Bank (ゆうちょ銀行)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t('checkout.accountNumber')}</span>
            <span className="font-medium">22210551</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t('checkout.accountName')}</span>
            <span className="font-medium">Heri Kurnianta</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Bank code:</span>
            <span className="font-medium">11170</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Branch code:</span>
            <span className="font-medium">118</span>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
        <h4 className="font-medium text-blue-800 mb-2">{t('checkout.paymentInstructions')}</h4>
        <ol className="list-decimal ml-5 space-y-1 text-blue-700 text-sm">
          <li>{t('checkout.transferYuchoStep1')}</li>
          <li>{t('checkout.transferYuchoStep2')}</li>
          <li>{t('checkout.transferYuchoStep3')}</li>
          <li>{t('checkout.uploadProofStep')}</li>
        </ol>
      </div>
    </>
  );

  // Render QRIS / QR Code method
  const renderQRIS = () => (
    <>
      {renderHeader()}
      {renderPaymentAmount()}
      
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
        <h4 className="font-medium text-blue-800 mb-3 text-center">{t('checkout.scanQrCode')}</h4>
        
        {/* Currency conversion display */}
        {(paymentMethod === 'QRIS / QR Code' || paymentMethod === 'QRIS / QR Code (IDR)') && (
          <div className="bg-white p-3 rounded-lg mb-4 text-center">
            <p className="text-sm text-gray-600 mb-1">{t('checkout.totalInRupiah')}</p>
            {isLoading || isRefreshing ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                <span className="text-blue-600">{t('checkout.converting')}</span>
              </div>
            ) : (
              <>
                <p className="text-xl font-bold text-blue-700">
                  Rp {convertedRupiah?.toLocaleString('id-ID') || '-'}
                </p>
                {lastUpdated && (
                  <p className="text-xs text-blue-600 flex items-center justify-center mt-1">
                    <Info className="w-3 h-3 mr-1" />
                    {t('checkout.automaticRate')} {lastUpdated}
                  </p>
                )}
              </>
            )}
            
            {error && (
              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-md text-xs text-yellow-700 mt-2">
                <p className="flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                  {error}
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* QR Code display */}
        <div className="flex justify-center mb-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <img
              src="/lovable-uploads/1751983369470.jpeg"
              alt="QR Code Pembayaran QRIS INJAPAN FOOD INDONESIA NMID: ID1025415188982"
              className="w-[280px] h-auto"
            />
          </div>
        </div>
        
        <p className="text-sm text-blue-700 text-center mb-4">
          {t('checkout.scanWithApp')}
        </p>
      </div>
      
      <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
        <h4 className="font-medium text-blue-800 mb-2">{t('checkout.paymentInstructions')}</h4>
        <ol className="list-decimal ml-5 space-y-1 text-blue-700 text-sm">
          <li>{t('checkout.scanQrCodeStep')}</li>
          <li>{t('checkout.enterAmountStep')} <strong>(¥{totalAmount.toLocaleString()} / Rp{convertedRupiah?.toLocaleString('id-ID') || '-'})</strong></li>
          <li>{t('checkout.completePaymentStep')}</li>
          <li>{t('checkout.uploadProofStep')}</li>
        </ol>
      </div>
    </>
  );

  // Render COD method
  const renderCOD = () => (
    <>
      {renderHeader()}
      {renderPaymentAmount()}
      
      <div className="bg-green-50 p-4 rounded-lg border border-green-100">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-green-800 mb-2">{t('checkout.codInformation')}</h4>
            <p className="text-sm text-green-700">
              {t('checkout.codMessage')}
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <Card className="mt-4">
      <CardContent className="pt-6">
        {paymentMethod === 'Bank Transfer (Rupiah)' && renderBankTransferRupiah()}
        {paymentMethod === 'Bank Transfer (Yucho / ゆうちょ銀行)' && renderBankTransferYucho()}
        {(paymentMethod === 'QRIS / QR Code' || paymentMethod === 'QRIS / QR Code (IDR)') && renderQRIS()}
        {paymentMethod === 'COD (Cash on Delivery)' && renderCOD()}
      </CardContent>
    </Card>
  );
};

export default PaymentMethodInfo;