import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAffiliate } from '@/hooks/useAffiliate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { DollarSign, CreditCard, AlertCircle } from 'lucide-react';

const payoutSchema = z.object({
  amount: z.string()
    .min(1, 'Jumlah wajib diisi')
    .refine(val => !isNaN(Number(val)), {
      message: 'Jumlah harus berupa angka',
    })
    .refine(val => Number(val) > 0, {
      message: 'Jumlah harus lebih dari 0',
    }),
  method: z.string().min(1, 'Metode pembayaran wajib dipilih'),
  bankName: z.string().min(1, 'Nama bank wajib diisi'),
  accountNumber: z.string().min(1, 'Nomor rekening wajib diisi'),
  accountName: z.string().min(1, 'Nama pemilik rekening wajib diisi'),
});

type PayoutFormValues = z.infer<typeof payoutSchema>;

const PayoutRequestForm = () => {
  const { affiliate, settings, requestPayout } = useAffiliate();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PayoutFormValues>({
    resolver: zodResolver(payoutSchema),
    defaultValues: {
      amount: '',
      method: '',
      bankName: affiliate?.bankInfo?.bankName || '',
      accountNumber: affiliate?.bankInfo?.accountNumber || '',
      accountName: affiliate?.bankInfo?.accountName || '',
    },
  });

  const onSubmit = async (data: PayoutFormValues) => {
    if (!affiliate) {
      toast({
        title: 'Error',
        description: 'Anda belum terdaftar sebagai affiliate',
        variant: 'destructive',
      });
      return;
    }

    const amount = Number(data.amount);
    
    // Check if amount is greater than pending commission
    if (amount > affiliate.pendingCommission) {
      toast({
        title: 'Error',
        description: 'Jumlah melebihi komisi yang tersedia',
        variant: 'destructive',
      });
      return;
    }

    // Check if amount is greater than minimum payout
    if (settings && amount < settings.minPayoutAmount) {
      toast({
        title: 'Error',
        description: `Jumlah minimum pencairan adalah ¥${settings.minPayoutAmount.toLocaleString()}`,
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const bankInfo = {
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        accountName: data.accountName,
      };
      
      await requestPayout(amount, data.method, bankInfo);
      
      toast({
        title: 'Berhasil',
        description: 'Permintaan pencairan berhasil diajukan',
      });
      
      form.reset({
        amount: '',
        method: data.method,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        accountName: data.accountName,
      });
    } catch (error) {
      console.error('Error requesting payout:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Gagal mengajukan pencairan',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!affiliate || !settings) {
    return null;
  }

  const minAmount = settings.minPayoutAmount;
  const maxAmount = affiliate.pendingCommission;
  const canRequestPayout = maxAmount >= minAmount;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          {t('affiliate.requestPayout')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!canRequestPayout ? (
          <div className="bg-yellow-50 p-4 rounded-md flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800">{t('affiliate.notEligibleForPayout')}</h4>
              <p className="text-sm text-yellow-700 mt-1">
                {t('affiliate.pendingCommissionMessage', { 
                  available: maxAmount.toLocaleString(), 
                  minimum: minAmount.toLocaleString() 
                })}
              </p>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('affiliate.payoutAmount')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={minAmount}
                        max={maxAmount}
                        placeholder={`Min: ¥${minAmount.toLocaleString()}`}
                      />
                    </FormControl>
                    <p className="text-xs text-gray-500">
                      {t('affiliate.available')} ¥{maxAmount.toLocaleString()} | {t('affiliate.minimum')} ¥{minAmount.toLocaleString()}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('affiliate.paymentMethod')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih metode pembayaran" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {settings.payoutMethods.map((method) => (
                          <SelectItem key={method} value={method}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="bg-gray-50 p-4 rounded-md space-y-4">
                <div className="flex items-center">
                  <CreditCard className="w-5 h-5 text-gray-500 mr-2" /> 
                  <h4 className="font-medium">{t('affiliate.bankInfo')}</h4>
                </div>

                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('affiliate.bankName')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Contoh: BCA, Mandiri, BNI" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('affiliate.accountNumber')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Masukkan nomor rekening" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accountName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('affiliate.accountHolderName')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Masukkan nama pemilik rekening" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
              >
                {isSubmitting ? 'Memproses...' : 'Ajukan Pencairan'}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
};

export default PayoutRequestForm;