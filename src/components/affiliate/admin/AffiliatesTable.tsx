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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Users, RefreshCw, Eye } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
 } from '@/components/ui/select';
 import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AffiliateUser } from '@/types/affiliate';

const AffiliatesTable = () => {
  const { affiliates, loading, selectedMonth, setSelectedMonth, availableMonths } = useAffiliateAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAffiliate, setSelectedAffiliate] = useState<AffiliateUser | null>(null);

  const filteredAffiliates = affiliates.filter(affiliate => 
    affiliate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    affiliate.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    affiliate.referralCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
            <Users className="w-5 h-5 mr-2" />
            Daftar Affiliate
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
              <Users className="w-5 h-5 mr-2" />
              <span>Daftar Affiliate ({affiliates.length})</span>
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
                placeholder="Cari affiliate..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {affiliates.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada affiliate</h3>
            <p className="text-gray-500 text-sm mb-4">
              Belum ada pengguna yang bergabung dengan program affiliate
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
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Kode Referral</TableHead>
                  <TableHead>Total Klik</TableHead>
                  <TableHead>Total Referral</TableHead>
                  <TableHead>Total Komisi</TableHead>
                  <TableHead>Bergabung</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAffiliates.map((affiliate) => (
                  <TableRow key={affiliate.id}>
                    <TableCell className="font-medium">
                      {affiliate.displayName}
                    </TableCell>
                    <TableCell>{affiliate.email}</TableCell>
                    <TableCell>
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {affiliate.referralCode}
                      </code>
                    </TableCell>
                    <TableCell>{affiliate.totalClicks}</TableCell>
                    <TableCell>{affiliate.totalReferrals}</TableCell>
                    <TableCell className="font-semibold">
                      ¥{affiliate.totalCommission.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(affiliate.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedAffiliate(affiliate)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Detail
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Detail Affiliate</DialogTitle>
                          </DialogHeader>
                          {selectedAffiliate && (
                            <div className="space-y-4 py-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500">Nama</h4>
                                  <p>{selectedAffiliate.displayName}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500">Email</h4>
                                  <p>{selectedAffiliate.email}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500">Kode Referral</h4>
                                  <p>{selectedAffiliate.referralCode}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500">Bergabung</h4>
                                  <p>{formatDate(selectedAffiliate.createdAt)}</p>
                                </div>
                              </div>

                              <div className="border-t pt-4 mt-4">
                                <h4 className="text-sm font-medium text-gray-500 mb-2">Statistik</h4>
                                <div className="grid grid-cols-3 gap-4">
                                  <div className="bg-gray-50 p-3 rounded-md">
                                    <p className="text-xs text-gray-500">Total Klik</p>
                                    <p className="text-lg font-semibold">{selectedAffiliate.totalClicks}</p>
                                  </div>
                                  <div className="bg-gray-50 p-3 rounded-md">
                                    <p className="text-xs text-gray-500">Total Referral</p>
                                    <p className="text-lg font-semibold">{selectedAffiliate.totalReferrals}</p>
                                  </div>
                                  <div className="bg-gray-50 p-3 rounded-md">
                                    <p className="text-xs text-gray-500">Konversi</p>
                                    <p className="text-lg font-semibold">
                                      {selectedAffiliate.totalClicks > 0 
                                        ? `${((selectedAffiliate.totalReferrals / selectedAffiliate.totalClicks) * 100).toFixed(1)}%`
                                        : '0%'
                                      }
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="border-t pt-4 mt-4">
                                <h4 className="text-sm font-medium text-gray-500 mb-2">Komisi</h4>
                                <div className="grid grid-cols-3 gap-4">
                                  <div className="bg-blue-50 p-3 rounded-md">
                                    <p className="text-xs text-blue-500">Total Komisi</p>
                                    <p className="text-lg font-semibold text-blue-700">
                                      ¥{selectedAffiliate.totalCommission.toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="bg-yellow-50 p-3 rounded-md">
                                    <p className="text-xs text-yellow-500">Komisi Pending</p>
                                    <p className="text-lg font-semibold text-yellow-700">
                                      ¥{selectedAffiliate.pendingCommission.toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="bg-green-50 p-3 rounded-md">
                                    <p className="text-xs text-green-500">Komisi Dibayar</p>
                                    <p className="text-lg font-semibold text-green-700">
                                      ¥{selectedAffiliate.paidCommission.toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {selectedAffiliate.bankInfo && (
                                <div className="border-t pt-4 mt-4">
                                  <h4 className="text-sm font-medium text-gray-500 mb-2">Informasi Bank</h4>
                                  <div className="bg-gray-50 p-3 rounded-md">
                                    <p><span className="font-medium">Bank:</span> {selectedAffiliate.bankInfo.bankName}</p>
                                    <p><span className="font-medium">No. Rekening:</span> {selectedAffiliate.bankInfo.accountNumber}</p>
                                    <p><span className="font-medium">Atas Nama:</span> {selectedAffiliate.bankInfo.accountName}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
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

export default AffiliatesTable;