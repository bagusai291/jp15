
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { FileText, Search, Filter, Activity } from 'lucide-react';
import { useAdminLogs } from '@/hooks/useAdminLogs';
import AdminLayout from '@/components/admin/AdminLayout';

const AdminLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const { data: logs = [], isLoading } = useAdminLogs();

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.target_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = !actionFilter || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create_product':
      case 'add_product':
        return 'bg-green-100 text-green-800';
      case 'update_product':
      case 'edit_product':
        return 'bg-blue-100 text-blue-800';
      case 'delete_product':
        return 'bg-red-100 text-red-800';
      case 'export_products':
      case 'import_products':
        return 'bg-purple-100 text-purple-800';
      case 'restore_item':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionLabel = (action: string) => {
    const actionLabels: { [key: string]: string } = {
      'create_product': 'Tambah Produk',
      'add_product': 'Tambah Produk',
      'update_product': 'Edit Produk',
      'edit_product': 'Edit Produk',
      'delete_product': 'Hapus Produk',
      'export_products': 'Export Produk',
      'import_products': 'Import Produk',
      'restore_item': 'Pulihkan Item'
    };
    return actionLabels[action] || action;
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
          <h1 className="text-3xl font-bold text-gray-900">Log Aktivitas Admin</h1>
          <p className="text-gray-600">Pantau semua aktivitas admin di sistem</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Riwayat Aktivitas</span>
            </CardTitle>
            
            {/* Search and Filter */}
            <div className="flex space-x-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cari berdasarkan aksi atau target..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter Aksi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Aksi</SelectItem>
                  <SelectItem value="create_product">Tambah Produk</SelectItem>
                  <SelectItem value="update_product">Edit Produk</SelectItem>
                  <SelectItem value="delete_product">Hapus Produk</SelectItem>
                  <SelectItem value="export_products">Export Produk</SelectItem>
                  <SelectItem value="import_products">Import Produk</SelectItem>
                  <SelectItem value="restore_item">Pulihkan Item</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent>
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada aktivitas yang tercatat</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Aksi</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Detail</TableHead>
                      <TableHead>Waktu</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge className={getActionColor(log.action)}>
                            {getActionLabel(log.action)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{log.target_type}</div>
                            {log.target_id && (
                              <div className="text-sm text-gray-500 font-mono">
                                ID: {log.target_id.slice(0, 8)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {log.details?.name && (
                              <div className="font-medium">{log.details.name}</div>
                            )}
                            {log.details?.count && (
                              <div className="text-gray-600">
                                Jumlah: {log.details.count}
                              </div>
                            )}
                            {log.details?.changes && (
                              <div className="text-gray-600">
                                Perubahan: {Object.keys(log.details.changes).join(', ')}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatDate(log.created_at)}
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

export default AdminLogs;
