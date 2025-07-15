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
import { Search, Users, RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { AffiliateReferral } from '@/types/affiliate';

const ReferralsTable = () => {
  const { referrals, loading } = useAffiliate();
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Add manual refresh function
  const handleRefresh = () => {
    console.log('Manually refreshing referrals data');
    // Force a hard reload to get fresh data
    window.location.reload();
  };

  const filteredReferrals = referrals.filter(referral => 
    referral.referredUserEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    referral.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'clicked':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Diklik</Badge>;
      case 'registered':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Terdaftar</Badge>;
      case 'ordered':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Order</Badge>;
      case 'approved':
        return <Badge className="bg-green-500">Disetujui</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Ditolak</Badge>;
      case 'paid':
        return <Badge className="bg-primary">Dibayar</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
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
            <Users className="w-5 h-5 mr-2" />
            Referral Anda
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
            <Users className="w-5 h-5 mr-2" />
            Referral Anda
          </CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Cari referral..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {referrals.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada referral</h3>
            <p className="text-gray-500 text-sm mb-4">
              Bagikan link affiliate Anda untuk mendapatkan referral
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
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal Klik</TableHead>
                  <TableHead>Tanggal Order</TableHead>
                  <TableHead className="text-right">Komisi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReferrals.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell className="font-medium">
                      {referral.referredUserEmail || 'Pengunjung'}
                    </TableCell>
                    <TableCell>{getStatusBadge(referral.status)}</TableCell>
                    <TableCell>{formatDate(referral.clickedAt)}</TableCell>
                    <TableCell>{formatDate(referral.orderedAt)}</TableCell>
                    <TableCell className="text-right">
                      {referral.commissionAmount 
                        ? `¥${referral.commissionAmount.toLocaleString()}`
                        : '-'
                      }
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

export default ReferralsTable;