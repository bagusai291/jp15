
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Trash2, RotateCcw, AlertTriangle, Package } from 'lucide-react';
import { useRecycleBin, useRestoreFromRecycleBin } from '@/hooks/useRecycleBin';
import { useLogAdminAction } from '@/hooks/useAdminLogs';
import { toast } from '@/hooks/use-toast';
import { RecycleBinItem } from '@/types';
import AdminLayout from '@/components/admin/AdminLayout';

const RecycleBin = () => {
  const { data: recycleBinItems = [], isLoading, refetch } = useRecycleBin();
  const restoreItem = useRestoreFromRecycleBin();
  const logAction = useLogAdminAction();

  const handleRestore = async (item: RecycleBinItem) => {
    try {
      await restoreItem.mutateAsync(item);
      logAction.mutate({
        action: 'restore_item',
        target_type: item.original_table,
        target_id: item.original_id,
        details: { name: item.data.name }
      });
      toast({
        title: "Item dipulihkan!",
        description: `${item.data.name} berhasil dipulihkan`,
      });
      refetch();
    } catch (error) {
      console.error('Error restoring item:', error);
      toast({
        title: "Error",
        description: "Gagal memulihkan item",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Recycle Bin</h1>
          <p className="text-gray-600">Kelola item yang telah dihapus</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trash2 className="w-5 h-5" />
              <span>Item Terhapus</span>
            </CardTitle>
            
            {recycleBinItems.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Item di recycle bin dapat dipulihkan. Pastikan untuk memulihkan item penting sebelum menghapus permanen.
                </AlertDescription>
              </Alert>
            )}
          </CardHeader>

          <CardContent>
            {recycleBinItems.length === 0 ? (
              <div className="text-center py-8">
                <Trash2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Recycle bin kosong</p>
                <p className="text-sm text-gray-400">Item yang dihapus akan muncul di sini</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Item</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Detail</TableHead>
                      <TableHead>Dihapus</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recycleBinItems.map((item: RecycleBinItem) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Package className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="font-medium">{item.data.name}</div>
                              <div className="text-sm text-gray-500">ID: {item.original_id.slice(0, 8)}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {item.original_table}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {item.original_table === 'products' && (
                              <>
                                <div>Kategori: {item.data.category}</div>
                                <div>Harga: ¥{item.data.price?.toLocaleString()}</div>
                                <div>Stok: {item.data.stock}</div>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatDate(item.deleted_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRestore(item)}
                              disabled={restoreItem.isPending}
                            >
                              <RotateCcw className="w-4 h-4 mr-1" />
                              Pulihkan
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default RecycleBin;
