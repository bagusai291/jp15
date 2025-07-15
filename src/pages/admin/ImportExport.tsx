
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Download, Upload, AlertTriangle } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { getAllProducts } from '@/services/productService';
import { getAllOrders } from '@/services/orderService';
import { getAllUsers } from '@/services/userService';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ImportExport = () => {
  const [loading, setLoading] = useState(false);

  const exportData = async (type: 'products' | 'orders' | 'users') => {
    setLoading(true);
    try {
      let data;
      let filename;

      switch (type) {
        case 'products':
          data = await getAllProducts();
          filename = `products-${new Date().toISOString().split('T')[0]}.json`;
          break;
        case 'orders':
          data = await getAllOrders();
          filename = `orders-${new Date().toISOString().split('T')[0]}.json`;
          break;
        case 'users':
          data = await getAllUsers();
          filename = `users-${new Date().toISOString().split('T')[0]}.json`;
          break;
        default:
          throw new Error('Invalid export type');
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Berhasil",
        description: `Data ${type} berhasil diekspor`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Gagal",
        description: `Gagal mengekspor data ${type}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      console.log('Imported data:', data);
      
      toast({
        title: "Import Berhasil",
        description: `File ${file.name} berhasil diimpor (preview mode)`,
      });
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Gagal",
        description: "Format file tidak valid atau terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Import & Export Data</h1>
          <p className="text-gray-600">Kelola data dengan import dan export file JSON</p>
        </div>

        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Fitur import masih dalam tahap pengembangan. Saat ini hanya mendukung preview data yang diimport.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="w-5 h-5" />
                <span>Export Data</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Ekspor data dari Firebase ke file JSON
              </p>
              
              <div className="space-y-3">
                <Button
                  onClick={() => exportData('products')}
                  disabled={loading}
                  className="w-full"
                  variant="outline"
                >
                  Export Produk
                </Button>
                
                <Button
                  onClick={() => exportData('orders')}
                  disabled={loading}
                  className="w-full"
                  variant="outline"
                >
                  Export Pesanan
                </Button>
                
                <Button
                  onClick={() => exportData('users')}
                  disabled={loading}
                  className="w-full"
                  variant="outline"
                >
                  Export Users
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="w-5 h-5" />
                <span>Import Data</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Import data dari file JSON (Preview Mode)
              </p>
              
              <div>
                <Label htmlFor="import-file">Pilih File JSON</Label>
                <Input
                  id="import-file"
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  disabled={loading}
                  className="mt-2"
                />
              </div>
              
              <p className="text-xs text-gray-500">
                Format yang didukung: JSON hasil export dari sistem ini
              </p>
            </CardContent>
          </Card>
        </div>

        {loading && (
          <div className="mt-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-600">Memproses...</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ImportExport;
