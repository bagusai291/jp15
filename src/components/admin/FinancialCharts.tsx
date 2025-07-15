import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Sector } from 'recharts';
import { TrendingUp, CreditCard, DollarSign } from 'lucide-react';

interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  orderCount: number;
}

interface PaymentMethodData {
  name: string;
  value: number;
  color: string;
}

interface FinancialChartsProps {
  monthlyData: MonthlyData[];
  paymentMethods: PaymentMethodData[];
  isLoading: boolean;
}

const FinancialCharts = ({ monthlyData, paymentMethods, isLoading }: FinancialChartsProps) => {
  const [activePaymentMethodIndex, setActivePaymentMethodIndex] = useState<number | undefined>(undefined);

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
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
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
          {payload.name.length > 15 ? payload.name.substring(0, 15) + '...' : payload.name}
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

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Tabs defaultValue="bar" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="bar" className="flex items-center">
          <TrendingUp className="w-4 h-4 mr-2" />
          Bar Chart
        </TabsTrigger>
        <TabsTrigger value="line" className="flex items-center">
          <DollarSign className="w-4 h-4 mr-2" />
          Line Chart
        </TabsTrigger>
        <TabsTrigger value="payment" className="flex items-center">
          <CreditCard className="w-4 h-4 mr-2" />
          Metode Pembayaran
        </TabsTrigger>
      </TabsList>

      <TabsContent value="bar">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Tren Keuangan 6 Bulan Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
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
      </TabsContent>

      <TabsContent value="line">
        <Card>
          <CardHeader>
            <CardTitle>Tren Laba Bersih</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyData}
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
                  <Line type="monotone" dataKey="orderCount" name="Jumlah Pesanan" stroke="#8884d8" yAxisId="right" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="payment">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Distribusi Metode Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {paymentMethods.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      activeIndex={activePaymentMethodIndex}
                      activeShape={renderActiveShape}
                      data={paymentMethods}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      onMouseEnter={(_, index) => setActivePaymentMethodIndex(index)}
                    >
                      {paymentMethods.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No payment data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default FinancialCharts;