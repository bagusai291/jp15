import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, InputProps } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Sector } from 'recharts';
import { DollarSign, TrendingUp, Download, Calendar, ArrowDown, ArrowUp, FileText, Plus, Truck, CreditCard, Filter, RefreshCw } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useOrders } from '@/hooks/useOrders';
import { Order } from '@/types';
import { toast } from '@/hooks/use-toast';
import { collection, query, where, getDocs, Timestamp, orderBy, limit } from 'firebase/firestore';
import { db } from '@/config/firebase';

// Financial transaction type
interface FinancialTransaction {
  id: string;
  date: string;
  category: 'sales' | 'expense' | 'refund' | 'other';
  type: 'income' | 'expense';
  amount: number;
  description: string;
}

// Monthly financial data type
interface MonthlyFinancialData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  orderCount: number;
}

// Monthly summary type
interface MonthlySummary {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  orderCount: number;
  shippingCost: number;
  paymentMethods: Record<string, number>;
}

// Payment method distribution type
interface PaymentMethodDistribution {
  name: string;
  value: number;
  color: string;
}

const FinancialReports = () => {
  const { data: orders = [] } = useOrders();
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentYearMonth());
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [financialTransactions, setFinancialTransactions] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyFinancialData[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary | null>(null);
  const [paymentMethodDistribution, setPaymentMethodDistribution] = useState<PaymentMethodDistribution[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activePaymentMethodIndex, setActivePaymentMethodIndex] = useState<number | undefined>(undefined);
  const [newTransaction, setNewTransaction] = useState<Partial<FinancialTransaction>>({
    category: 'expense',
    type: 'expense',
    amount: 0,
    description: ''
  });
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [dateRange, setDateRange] = useState<{start: Date, end: Date}>({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
  });

  // Get current year and month in YYYY-MM format
  function getCurrentYearMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  // Format month for display
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });
  };

  // Generate available months (last 12 months)
  const getAvailableMonths = () => {
    const months = [];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.push(monthStr);
    }
    
    return months;
  };

  // Fetch financial data from Firebase
  const fetchFinancialData = async () => {
    setIsLoading(true);
    try {
      // Parse selected month
      const [year, month] = selectedMonth.split('-');
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0); // Last day of month
      console.log('Fetching financial data for period:', startDate.toISOString(), 'to', endDate.toISOString());
      
      setDateRange({start: startDate, end: endDate});
      
      // Fetch orders for the selected month
      const ordersRef = collection(db, 'orders');
      const ordersQuery = query(
        ordersRef,
        where('created_at', '>=', startDate.toISOString()),
        where('created_at', '<=', endDate.toISOString())
      );
      
      const ordersSnapshot = await getDocs(ordersQuery);
      const monthOrders = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order));
      
      // Fetch financial transactions
      const financialTransactionsRef = collection(db, 'financial_transactions');
      const financialQuery = query(
        financialTransactionsRef,
        where('date', '>=', startDate.toISOString())
      );
      
      const financialSnapshot = await getDocs(financialQuery);
      let financialTxs = financialSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Filter by end date in memory
      financialTxs = financialTxs.filter(tx => 
        tx.date <= endDate.toISOString()
      );
      
      console.log(`Found ${financialTxs.length} financial transactions`);
      setFinancialTransactions(financialTxs);
      
      // Calculate monthly summary
      const orderRevenue = monthOrders.reduce((sum, order) => sum + order.total_price, 0);
      const revenue = orderRevenue; // Only order revenue now that POS is removed
      const shippingCost = monthOrders.reduce((sum, order) => sum + (order.shipping_fee || 0), 0);
      const expenses = shippingCost; // For now, only shipping costs are considered as expenses
      const profit = revenue - expenses;
      
      // Calculate payment method distribution
      const paymentMethods: Record<string, number> = {};
      monthOrders.forEach(order => {
        const method = order.customer_info?.payment_method || 'Unknown';
        paymentMethods[method] = (paymentMethods[method] || 0) + order.total_price;
      });
      
      // Transform payment methods for pie chart
      const paymentMethodColors = {
        'COD (Cash on Delivery)': '#4ade80', // green
        'Bank Transfer (Rupiah)': '#3b82f6', // blue
        'Bank Transfer (Yucho / ゆうちょ銀行)': '#8b5cf6', // purple
        'Bank Transfer (Yucho)': '#8b5cf6', // purple (shortened version)
        'QRIS / QR Code': '#f59e0b', // amber
        'Unknown': '#94a3b8' // slate
      };
      
      const paymentMethodsArray = Object.entries(paymentMethods).map(([name, value]) => {
        // Shorten long payment method names for better display
        let displayName = name;
        if (name === 'Bank Transfer (Yucho / ゆうちょ銀行)') {
          displayName = 'Bank Transfer (Yucho)';
        }
        
        return {
          name: displayName,
          originalName: name,
          value,
          color: paymentMethodColors[displayName as keyof typeof paymentMethodColors] || 
                 paymentMethodColors[name as keyof typeof paymentMethodColors] || 
                 '#94a3b8'
        };
      });
      
      setPaymentMethodDistribution(paymentMethodsArray);
      
      // Set monthly summary
      setMonthlySummary({
        month: formatMonth(selectedMonth),
        revenue,
        expenses,
        profit,
        orderCount: monthOrders.length,
        shippingCost,
        paymentMethods
      });
      
      // Generate transactions from orders
      let allTransactions: FinancialTransaction[] = monthOrders.map(order => ({
        id: order.id,
        date: new Date(order.created_at).toISOString().split('T')[0],
        category: 'sales',
        type: 'income',
        amount: order.total_price,
        description: `Order #${order.id.slice(-8)} - ${order.customer_info.name}`
      }));
      
      // Add shipping expenses
      const shippingTransactionsData: FinancialTransaction[] = monthOrders
        .filter(order => order.shipping_fee && order.shipping_fee > 0)
        .map(order => ({
          id: `shipping-${order.id}`,
          date: new Date(order.created_at).toISOString().split('T')[0],
          category: 'expense',
          type: 'expense',
          amount: order.shipping_fee || 0,
          description: `Shipping for Order #${order.id.slice(-8)}`
        }));
      
      // Add financial transactions
      const financialTransactionsData: FinancialTransaction[] = financialTxs.map(tx => ({
        id: tx.id,
        date: new Date(tx.date).toISOString().split('T')[0],
        category: tx.category || 'sales',
        type: tx.type || 'income',
        amount: tx.amount || 0,
        description: tx.description || `Transaction ${tx.id.slice(-8)}`
      }));
      
      // Combine and sort transactions
      allTransactions = [...allTransactions, ...shippingTransactionsData, ...financialTransactionsData].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      console.log(`Total transactions: ${allTransactions.length}`);
      setTransactions(allTransactions);
      
      // Generate historical data for charts (last 6 months)
      await generateHistoricalData();
      
    } catch (error) {
      console.error('Error fetching financial data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch financial data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate historical data for charts
  const generateHistoricalData = async () => {
    try {
      const monthlyChartData: MonthlyFinancialData[] = [];
      const [year, month] = selectedMonth.split('-');
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(parseInt(year), parseInt(month) - 1 - i, 1);
        const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        const monthName = date.toLocaleDateString('ja-JP', { month: 'short' });
        
        // Fetch orders for this month
        const ordersRef = collection(db, 'orders');
        const ordersQuery = query(
          ordersRef,
          where('created_at', '>=', new Date(date.getFullYear(), date.getMonth(), 1).toISOString()),
          where('created_at', '<=', endDate.toISOString())
        );
        
        const ordersSnapshot = await getDocs(ordersQuery);
        const monthOrders = ordersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Order));
        
        // Calculate revenue and expenses including POS transactions
        const orderRevenue = monthOrders.reduce((sum, order) => sum + order.total_price, 0);
        const revenue = orderRevenue; // Only order revenue now that POS is removed
        const expenses = monthOrders.reduce((sum, order) => sum + (order.shipping_fee || 0), 0);
        
        monthlyChartData.push({
          month: monthName,
          revenue,
          expenses,
          profit: revenue - expenses,
          orderCount: monthOrders.length
        });
      }
      
      setMonthlyData(monthlyChartData);
      
    } catch (error) {
      console.error('Error generating historical data:', error);
    }
  };

  // Format currency as Yen
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="font-medium text-sm">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Render active shape for pie chart
  const renderActiveShape = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const RADIAN = Math.PI / 180;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 25) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 18;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" fontSize={12}>
          {payload.name.length > 12 ? payload.name.substring(0, 12) + '...' : payload.name}
        </text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" fontSize={12}>
          {`${(percent * 100).toFixed(2)}%`}
        </text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={36} textAnchor={textAnchor} fill="#333" fontSize={12}>
          {formatCurrency(value)}
        </text>
      </g>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Fetch data when component mounts or selected month changes
  useEffect(() => {
    fetchFinancialData();
  }, [selectedMonth]);

  // Calculate summary statistics
  const totalRevenue = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const netProfit = totalRevenue - totalExpenses;

  // Refresh data
  const handleRefresh = () => {
    fetchFinancialData();
    toast({ title: "Refreshing data", description: "Financial data is being refreshed" });
  };

  // Add new transaction
  const handleAddTransaction = () => {
    if (!newTransaction.description || !newTransaction.amount) {
      toast({
        title: "Input tidak lengkap",
        description: "Deskripsi dan jumlah wajib diisi",
        variant: "destructive"
      });
      return;
    }

    const transaction: FinancialTransaction = {
      id: `manual-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      category: newTransaction.category as 'sales' | 'expense' | 'refund' | 'other',
      type: newTransaction.category === 'expense' ? 'expense' : 'income',
      amount: Number(newTransaction.amount),
      description: newTransaction.description || ''
    };

    setTransactions([transaction, ...transactions]);
    setNewTransaction({
      category: 'expense',
      type: 'expense',
      amount: 0,
      description: ''
    });
    setShowAddTransaction(false);

    toast({
      title: "Transaksi berhasil ditambahkan",
      description: "Data keuangan telah diperbarui",
    });
  };

  // Export financial data to CSV
  const exportToCSV = () => {
    const headers = ['Tanggal', 'Kategori', 'Tipe', 'Jumlah (¥)', 'Deskripsi'];
    
    const csvData = transactions.map(t => [
      t.date,
      t.category,
      t.type,
      t.amount,
      `"${t.description.replace(/"/g, '""')}"`
    ]);
    
    // Add summary row
    csvData.push(['', '', '', '', '']);
    csvData.push(['TOTAL PENDAPATAN', '', '', totalRevenue, '']);
    csvData.push(['TOTAL PENGELUARAN', '', '', totalExpenses, '']);
    csvData.push(['LABA BERSIH', '', '', netProfit, '']);
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `laporan-keuangan-${selectedMonth}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Laporan Keuangan</h1>
          <p className="text-gray-600">Kelola dan pantau data keuangan Injapan Food</p>
        </div>

        {/* Month Selector */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <span className="font-medium">Periode: {formatMonth(selectedMonth)}</span>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Pilih bulan" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableMonths().map((month) => (
                  <SelectItem key={month} value={month}>
                    {formatMonth(month)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading}><RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Data</Button>
            <Button 
              variant="outline" 
              onClick={exportToCSV}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Laporan</span>
            </Button>
            
            <Button 
              onClick={() => setShowAddTransaction(!showAddTransaction)}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddTransaction ? 'Batal' : 'Tambah Transaksi'}</span>
            </Button>
          </div>
        </div>

        {/* Add Transaction Form */}
        {showAddTransaction && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Tambah Transaksi Manual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <Select 
                    value={newTransaction.category} 
                    onValueChange={(value) => setNewTransaction({...newTransaction, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Penjualan</SelectItem>
                      <SelectItem value="expense">Pengeluaran</SelectItem>
                      <SelectItem value="refund">Refund</SelectItem>
                      <SelectItem value="other">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah (¥)</label>
                  <Input 
                    type="number" 
                    value={newTransaction.amount || ''} 
                    onChange={(e) => setNewTransaction({...newTransaction, amount: Number(e.target.value)})}
                    placeholder="0"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                  <Input 
                    value={newTransaction.description || ''} 
                    onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                    placeholder="Deskripsi transaksi"
                  />
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button onClick={handleAddTransaction}>Simpan Transaksi</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                Total Omset
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700">{isLoading ? '...' : formatCurrency(totalRevenue)}</div>
              <p className="text-sm text-blue-600 mt-1">
                Periode {formatMonth(selectedMonth)}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-700 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Laba Bersih
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700">{isLoading ? '...' : formatCurrency(netProfit)}</div>
              <p className="text-sm text-green-600 mt-1">
                {netProfit > 0 ? (
                  <span className="flex items-center">
                    <ArrowUp className="w-3 h-3 mr-1" />
                    Profit
                  </span>
                ) : (
                  <span className="flex items-center">
                    <ArrowDown className="w-3 h-3 mr-1" />
                    Loss
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 flex items-center">
                <Truck className="w-4 h-4 mr-2" />
                Biaya Pengiriman
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-700">{isLoading ? '...' : formatCurrency(monthlySummary?.shippingCost || 0)}</div>
              <p className="text-sm text-purple-600 mt-1">
                {monthlySummary?.orderCount || 0} pesanan
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-700 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Total Pengeluaran
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-700">{isLoading ? '...' : formatCurrency(totalExpenses)}</div>
              <p className="text-sm text-red-600 mt-1">
                Periode {formatMonth(selectedMonth)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="transactions" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="transactions" className="flex items-center space-x-2">
              <FileText className="w-4 h-4 mr-2" />
              Transaksi
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Grafik
            </TabsTrigger>
            <TabsTrigger value="payment-methods" className="flex items-center">
              <CreditCard className="w-4 h-4 mr-2" />
              Metode Pembayaran
            </TabsTrigger>
          </TabsList>
          
          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Laporan Transaksi Keuangan</CardTitle>
              </CardHeader> 
              <CardContent>
                {transactions.length > 0 && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Menampilkan {transactions.length} transaksi untuk periode {formatMonth(selectedMonth)}
                    </p>
                  </div>
                )}
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
                            Tidak ada data transaksi untuk periode ini
                          </TableCell>
                        </TableRow>
                      ) : transactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            Tidak ada data transaksi untuk periode ini
                          </TableCell>
                        </TableRow>
                      ) : (
                        <>
                          {transactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                              <TableCell>{new Date(transaction.date).toLocaleDateString('ja-JP')}</TableCell>
                              <TableCell>
                                <Badge variant={transaction.category === 'sales' ? 'default' : 
                                              transaction.category === 'expense' ? 'destructive' : 
                                              transaction.category === 'refund' ? 'secondary' : 'outline'}>
                                  {transaction.category === 'sales' ? 'Penjualan' : 
                                   transaction.category === 'expense' ? 'Pengeluaran' : 
                                   transaction.category === 'refund' ? 'Refund' : 'Lainnya'}
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
          </TabsContent>
          
          <TabsContent value="charts">
            <div className="grid grid-cols-1 gap-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Tren Keuangan 6 Bulan Terakhir</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={isLoading ? [] : monthlyData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis 
                          tickFormatter={(value) => `¥${value.toLocaleString()}`}
                        />
                        <Tooltip 
                          content={<CustomTooltip />}
                          labelFormatter={(label) => `Bulan: ${label}`}
                        />
                        <Legend />
                        <Bar dataKey="revenue" name="Omzet" fill="#3b82f6" />
                        <Bar dataKey="expenses" name="Pengeluaran" fill="#ef4444" />
                        <Bar dataKey="profit" name="Laba Bersih" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card> 
              
              <Card>
                <CardHeader>
                  <CardTitle>Tren Laba Bersih</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={isLoading ? [] : monthlyData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis 
                          tickFormatter={(value) => `¥${value.toLocaleString()}`}
                        />
                        <Tooltip 
                          content={<CustomTooltip />}
                          labelFormatter={(label) => `Bulan: ${label}`}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="profit" name="Laba Bersih" stroke="#10b981" strokeWidth={2} />
                        <Line type="monotone" dataKey="orderCount" name="Jumlah Pesanan" stroke="#8884d8" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="payment-methods">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Distribusi Metode Pembayaran
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                      </div>
                    ) : paymentMethodDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend 
                            layout="horizontal" 
                            verticalAlign="bottom" 
                            align="center"
                            wrapperStyle={{ paddingTop: "20px" }}
                          />
                          <Pie 
                            activeIndex={activePaymentMethodIndex} 
                            activeShape={renderActiveShape} 
                            data={paymentMethodDistribution} 
                            cx="50%" 
                            cy="40%" 
                            innerRadius={60} 
                            outerRadius={80} 
                            fill="#8884d8" 
                            dataKey="value" 
                            label={false}
                            onMouseEnter={(_, index) => setActivePaymentMethodIndex(index)}
                          > 
                            {paymentMethodDistribution.map((entry, index) => ( 
                              <Cell key={`cell-${index}`} fill={entry.color} /> 
                            ))} 
                          </Pie> 
                        </PieChart>
                      </ResponsiveContainer>
                    ) : <div className="flex items-center justify-center h-full text-gray-500">No payment data available</div>}
                  </div>
                </CardContent>
              </Card>
              
              {/* Payment Methods Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Detail Metode Pembayaran
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center h-40">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  ) : paymentMethodDistribution.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Metode Pembayaran</TableHead>
                            <TableHead className="text-right">Jumlah</TableHead>
                            <TableHead className="text-right">Persentase</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paymentMethodDistribution.map((method) => (
                            <TableRow key={method.name}>
                              <TableCell>
                                <div className="flex items-center">
                                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: method.color }}></div>
                                  <span className="truncate max-w-[200px]" title={method.originalName || method.name}>
                                    {method.name}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-medium">{formatCurrency(method.value)}</TableCell>
                              <TableCell className="text-right">
                                {((method.value / totalRevenue) * 100).toFixed(1)}%
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-40 text-gray-500">
                      Tidak ada data metode pembayaran
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default FinancialReports;