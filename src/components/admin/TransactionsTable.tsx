import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';

interface Transaction {
  id: string;
  date: string;
  category: 'sales' | 'expense' | 'refund' | 'other';
  type: 'income' | 'expense';
  amount: number;
  description: string;
}

interface TransactionsTableProps {
  transactions: Transaction[];
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  isLoading: boolean;
}

const TransactionsTable = ({ 
  transactions, 
  totalRevenue, 
  totalExpenses, 
  netProfit,
  isLoading
}: TransactionsTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Format currency as Yen
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Filter transactions based on search term
  const filteredTransactions = transactions.filter(transaction => 
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <CardTitle>Laporan Transaksi Keuangan</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Cari transaksi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Masuk/Keluar</TableHead>
                <TableHead className="text-right">Nominal</TableHead>
                <TableHead>Keterangan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                    <div className="mt-2">Memuat data transaksi...</div>
                  </TableCell>
                </TableRow>
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    {searchTerm ? 'Tidak ada transaksi yang cocok dengan pencarian' : 'Tidak ada data transaksi untuk periode ini'}
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{new Date(transaction.date).toLocaleDateString('ja-JP')}</TableCell>
                      <TableCell>
                        <Badge className={
                          transaction.category === 'sales' ? 'bg-green-100 text-green-800' : 
                          transaction.category === 'expense' ? 'bg-red-100 text-red-800' : 
                          transaction.category === 'refund' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'
                        }>
                          {transaction.category === 'sales' ? 'Penjualan' : 
                           transaction.category === 'expense' ? 'Pengeluaran' : 
                           transaction.category === 'refund' ? 'Refund' : 
                           'Lainnya'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                          {transaction.type === 'income' ? 'Masuk' : 'Keluar'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(transaction.amount)}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{transaction.description}</TableCell>
                    </TableRow>
                  ))}
                  
                  {/* Summary row */}
                  <TableRow className="bg-gray-50 font-bold">
                    <TableCell colSpan={3} className="text-right">Total:</TableCell>
                    <TableCell className="text-right">{formatCurrency(netProfit)}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionsTable;