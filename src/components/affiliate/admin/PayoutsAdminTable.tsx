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
import { Search, CreditCard, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
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

const PayoutsAdminTable = () => {
  const { payouts, loading, processPayout, selectedMonth, setSelectedMonth, availableMonths } = useAffiliateAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPayoutId, setSelectedPayoutId] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<'processing' | 'completed' | 'rejected' | null>(null);
  const [notes, setNotes] = useState('');

  const filteredPayouts = payouts.filter(payout => 
    payout.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payout.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payout.affiliateId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingPayouts = filteredPayouts.filter(payout => payout.status === 'pending');
  const processingPayouts = filteredPayouts.filter(payout => payout.status === 'processing');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Diproses</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Selesai</Badge>;
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

  const handleProcessPayout = async () => {
    if (!selectedPayoutId || !selectedAction) return;
    
    try {
      setIsProcessing(true);
      await processPayout(selectedPayoutId, selectedAction, notes);
      
      toast({
        title: 'Berhasil',
        description: `Pencairan berhasil ${
          selectedAction === 'processing' ? 'diproses' : 
          selectedAction === 'completed' ? 'diselesaikan' : 
          'ditolak'
        }`,
      });
      
      setNotes('');
      setSelectedPayoutId(null);
      setSelectedAction(null);
    } catch (error) {
      console.error('Error processing payout:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Gagal memproses pencairan',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Format month for display
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  const currentMonthDisplay = selectedMonth ? formatMonth(selectedMonth) : 'Bulan Ini';

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Manajemen Pencairan
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
              <CreditCard className="w-5 h-5 mr-2" />
              <span>Manajemen Pencairan</span>
              {pendingPayouts.length > 0 && (
                <Badge variant="outline" className="ml-2 bg-yellow-50 text-yellow-700 border-yellow-200">
                  {pendingPayouts.length} Pending
                </Badge>
              )}
              {processingPayouts.length > 0 && (
                <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                  {processingPayouts.length} Diproses
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
                placeholder="Cari pencairan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {payouts.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada pencairan</h3>
            <p className="text-gray-500 text-sm mb-4">
              Belum ada permintaan pencairan dari affiliate
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
                  <TableHead>Affiliate ID</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal Pengajuan</TableHead>
                  <TableHead>Tanggal Selesai</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayouts.map((payout) => {
                  const isPending = payout.status === 'pending';
                  const isProcessing = payout.status === 'processing';
                  
                  return (
                    <TableRow key={payout.id}>
                      <TableCell className="font-medium">
                        {payout.affiliateId.slice(0, 8)}...
                      </TableCell>
                      <TableCell className="font-semibold">
                        ¥{payout.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>{payout.method}</TableCell>
                      <TableCell>{getStatusBadge(payout.status)}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(payout.requestedAt)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(payout.completedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        {isPending && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isProcessing}
                                className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                                onClick={() => {
                                  setSelectedPayoutId(payout.id);
                                  setSelectedAction('processing');
                                }}
                              >
                                <Clock className="w-4 h-4 mr-1" />
                                Proses
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Proses Pencairan</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin memproses pencairan ini? Status akan berubah menjadi "Diproses".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="py-4">
                                <label className="text-sm font-medium text-gray-700">
                                  Catatan (Opsional)
                                </label>
                                <Textarea
                                  value={notes}
                                  onChange={(e) => setNotes(e.target.value)}
                                  placeholder="Masukkan catatan jika diperlukan"
                                  className="mt-2"
                                />
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => {
                                  setSelectedPayoutId(null);
                                  setSelectedAction(null);
                                  setNotes('');
                                }}>
                                  Batal
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleProcessPayout}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  Proses Pencairan
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        
                        {isProcessing && (
                          <div className="flex justify-end space-x-2">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isProcessing}
                                  className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                  onClick={() => {
                                    setSelectedPayoutId(payout.id);
                                    setSelectedAction('completed');
                                  }}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Selesai
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Selesaikan Pencairan</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Apakah Anda yakin ingin menyelesaikan pencairan ini? Status akan berubah menjadi "Selesai".
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="py-4">
                                  <label className="text-sm font-medium text-gray-700">
                                    Catatan (Opsional)
                                  </label>
                                  <Textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Masukkan catatan jika diperlukan"
                                    className="mt-2"
                                  />
                                </div>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => {
                                    setSelectedPayoutId(null);
                                    setSelectedAction(null);
                                    setNotes('');
                                  }}>
                                    Batal
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={handleProcessPayout}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Selesaikan Pencairan
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isProcessing}
                                  className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                  onClick={() => {
                                    setSelectedPayoutId(payout.id);
                                    setSelectedAction('rejected');
                                  }}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Tolak
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Tolak Pencairan</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Apakah Anda yakin ingin menolak pencairan ini? Status akan berubah menjadi "Ditolak".
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="py-4">
                                  <label className="text-sm font-medium text-gray-700">
                                    Alasan Penolakan
                                  </label>
                                  <Textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Masukkan alasan penolakan"
                                    className="mt-2"
                                    required
                                  />
                                </div>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => {
                                    setSelectedPayoutId(null);
                                    setSelectedAction(null);
                                    setNotes('');
                                  }}>
                                    Batal
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={handleProcessPayout}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Tolak Pencairan
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                        
                        {!isPending && !isProcessing && (
                          <span className="text-xs text-gray-500">
                            {payout.status === 'completed' ? 'Selesai' : 
                             payout.status === 'rejected' ? 'Ditolak' : '-'}
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

export default PayoutsAdminTable;