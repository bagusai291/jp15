import { useState } from 'react';
import { useAffiliateAdmin } from '@/hooks/useAffiliateAdmin';
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
import { Search, DollarSign, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';

const CommissionsAdminTable = () => {
  const { commissions, loading, approveCommission, rejectCommission, selectedMonth, setSelectedMonth, availableMonths } = useAffiliateAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCommissionId, setSelectedCommissionId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const filteredCommissions = commissions.filter(commission => 
    commission.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    commission.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCommissions = filteredCommissions.filter(commission => commission.status === 'pending');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Disetujui</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Ditolak</Badge>;
      case 'paid':
        return <Badge className="bg-primary">Dibayar</Badge>;
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

  // Format month for display
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  const currentMonthDisplay = selectedMonth ? formatMonth(selectedMonth) : 'Bulan Ini';

  const handleApprove = async (commissionId: string) => {
    try {
      setIsProcessing(true);
      console.log('Approving commission:', commissionId);
      await approveCommission(commissionId);
      toast({
        title: 'Berhasil',
        description: 'Komisi berhasil disetujui',
      });
      // Force refresh data after approval
      window.location.reload();
    } catch (error) {
      console.error('Error approving commission:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Gagal menyetujui komisi',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedCommissionId) return;
    
    try {
      setIsProcessing(true);
      console.log('Rejecting commission:', selectedCommissionId, 'with reason:', rejectionReason);
      await rejectCommission(selectedCommissionId, rejectionReason);
      toast({
        title: 'Berhasil',
        description: 'Komisi berhasil ditolak',
      });
      setRejectionReason('');
      setSelectedCommissionId(null);
      // Force refresh data after rejection
      window.location.reload();
    } catch (error) {
      console.error('Error rejecting commission:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Gagal menolak komisi',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Manajemen Komisi
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
            <div className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              <span>Manajemen Komisi</span>
              {pendingCommissions.length > 0 && (
                <Badge variant="outline" className="ml-2 bg-yellow-50 text-yellow-700 border-yellow-200">
                  {pendingCommissions.length} Pending
                </Badge>
              )}
              <Badge variant="outline" className="ml-2">
                {currentMonthDisplay}
              </Badge>
            </div>
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Pilih Bulan" />
              </SelectTrigger>
              <SelectContent>
                {availableMonths.map((month) => (
                  <SelectItem key={month} value={month}>
                    {formatMonth(month)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari komisi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {commissions.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada komisi</h3>
            <p className="text-gray-500 text-sm mb-4">
              Komisi akan muncul saat ada pembelian melalui link affiliate
            </p>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Affiliate</TableHead>
                  <TableHead>Total Order</TableHead>
                  <TableHead>Komisi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCommissions.map((commission) => {
                  const isPending = commission.status === 'pending';
                  
                  return (
                    <TableRow key={commission.id}>
                      <TableCell className="font-medium">
                        {commission.orderId.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        {commission.affiliateId.slice(0, 8)}...
                      </TableCell>
                      <TableCell>¥{commission.orderTotal.toLocaleString()}</TableCell>
                      <TableCell className="font-semibold text-primary">
                        ¥{commission.commissionAmount.toLocaleString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(commission.status)}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(commission.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        {isPending ? (
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApprove(commission.id)}
                              disabled={isProcessing}
                              className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Setujui
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isProcessing}
                                  className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                  onClick={() => setSelectedCommissionId(commission.id)}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Tolak
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Tolak Komisi</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Apakah Anda yakin ingin menolak komisi ini? Tindakan ini tidak dapat dibatalkan.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="py-4">
                                  <Label htmlFor="reason">Alasan Penolakan</Label>
                                  <Textarea
                                    id="reason"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Masukkan alasan penolakan"
                                    className="mt-2"
                                  />
                                </div>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => {
                                    setSelectedCommissionId(null);
                                    setRejectionReason('');
                                  }}>
                                    Batal
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={handleReject}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Tolak Komisi
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">
                            {commission.status === 'approved' ? 'Disetujui' : 
                             commission.status === 'rejected' ? 'Ditolak' : 
                             commission.status === 'paid' ? 'Dibayar' : '-'}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Label component for the form
const Label = ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) => (
  <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700">
    {children}
  </label>
);

export default CommissionsAdminTable;