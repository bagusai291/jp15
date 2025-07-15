import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAffiliateAdmin } from '@/hooks/useAffiliateAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { Settings, Save } from 'lucide-react';

const settingsSchema = z.object({
  defaultCommissionRate: z.string()
    .min(1, 'Komisi wajib diisi')
    .refine(val => !isNaN(Number(val)), {
      message: 'Komisi harus berupa angka',
    })
    .refine(val => Number(val) > 0 && Number(val) <= 100, {
      message: 'Komisi harus antara 1-100%',
    }),
  minPayoutAmount: z.string()
    .min(1, 'Jumlah minimum wajib diisi')
    .refine(val => !isNaN(Number(val)), {
      message: 'Jumlah minimum harus berupa angka',
    })
    .refine(val => Number(val) > 0, {
      message: 'Jumlah minimum harus lebih dari 0',
    }),
  termsAndConditions: z.string()
    .min(10, 'Syarat dan ketentuan minimal 10 karakter'),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const AffiliateSettingsForm = () => {
  const { settings, updateSettings, loading } = useAffiliateAdmin();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      defaultCommissionRate: settings ? settings.defaultCommissionRate.toString() : '5',
      minPayoutAmount: settings ? settings.minPayoutAmount.toString() : '5000',
      termsAndConditions: settings ? settings.termsAndConditions : '',
    },
  });

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      setIsSubmitting(true);
      
      await updateSettings({
        defaultCommissionRate: Number(data.defaultCommissionRate),
        minPayoutAmount: Number(data.minPayoutAmount),
        termsAndConditions: data.termsAndConditions,
      });
      
      toast({
        title: 'Berhasil',
        description: 'Pengaturan affiliate berhasil diperbarui',
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Gagal memperbarui pengaturan',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !settings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Pengaturan Affiliate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded w-full"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
            <div className="h-40 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Pengaturan Affiliate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="defaultCommissionRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Komisi Default (%)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="1"
                        max="100"
                        step="0.1"
                      />
                    </FormControl>
                    <p className="text-xs text-gray-500">
                      Persentase komisi yang diberikan untuk setiap pembelian
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minPayoutAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah Minimum Pencairan (¥)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="1"
                      />
                    </FormControl>
                    <p className="text-xs text-gray-500">
                      Jumlah minimum komisi yang bisa dicairkan
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="termsAndConditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Syarat dan Ketentuan</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={8}
                      placeholder="Masukkan syarat dan ketentuan program affiliate"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Pengaturan
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AffiliateSettingsForm;