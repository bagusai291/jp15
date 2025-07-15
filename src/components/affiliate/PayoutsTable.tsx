import { useState } from 'react';
import { useAffiliate } from '@/hooks/useAffiliate';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, CreditCard, RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

const PayoutsTable = () => {
  const { payouts, loading } = useAffiliate();
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Add manual refresh function
  const handleRefresh = () => {
    console.log('Manually refreshing payouts data');
    // Force a hard reload to get fresh data
    window.location.reload();
  };

  const filteredPayouts = payouts.filter(payout => 
    payout.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payout.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Diproses</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Selesai</Badge>;
     case 'paid':
       return <Badge className="bg-green-600">Telah Dibayarkan</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Ditolak</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Riwayat Pencairan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Riwayat Pencairan
          </CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Cari pencairan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {payouts.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada pencairan</h3>
            <p className="text-gray-500 text-sm mb-4">
              Ajukan pencairan komisi Anda melalui form pencairan
            </p>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal Pengajuan</TableHead>
                  <TableHead>Tanggal Selesai</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayouts.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell className="font-medium">
                      ¥{payout.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>{payout.method}</TableCell>
                    <TableCell>{getStatusBadge(payout.status)}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(payout.requestedAt)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                     {payout.status === 'paid' ? formatDate(payout.paidAt) : 
                      payout.status === 'completed' ? formatDate(payout.completedAt) : 
                      '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PayoutsTable;