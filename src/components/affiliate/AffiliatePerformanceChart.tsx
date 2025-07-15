import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAffiliate } from '@/hooks/useAffiliate';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, BarChart2 } from 'lucide-react';

const AffiliatePerformanceChart = () => {
  const { referrals, commissions } = useAffiliate();
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days' | 'all'>('30days');

  // Generate chart data based on referrals and commissions
  useEffect(() => {
    if (!referrals.length && !commissions.length) return;

    // Get date range based on selected time range
    const getDateRange = () => {
      const now = new Date();
      let startDate = new Date();
      
      switch (timeRange) {
        case '7days':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30days':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90days':
          startDate.setDate(now.getDate() - 90);
          break;
        case 'all':
          // Find earliest date from referrals and commissions
          const earliestReferral = referrals.reduce((earliest, ref) => {
            const date = new Date(ref.createdAt || 0);
            return date < earliest ? date : earliest;
          }, new Date());
          
          const earliestCommission = commissions.reduce((earliest, comm) => {
            const date = new Date(comm.createdAt || 0);
            return date < earliest ? date : earliest;
          }, new Date());
          
          startDate = earliestReferral < earliestCommission ? earliestReferral : earliestCommission;
          break;
      }
      
      return { startDate, endDate: now };
    };

    const { startDate, endDate } = getDateRange();
    
    // Generate date array between start and end dates
    const getDates = () => {
      const dates = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return dates;
    };
    
    const dates = getDates();
    
    // Format date for display
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    
    // Count referrals and commissions for each date
    const data = dates.map(date => {
      const dateString = date.toISOString().split('T')[0];
      
      // Count referrals for this date
      const dateReferrals = referrals.filter(ref => {
        const refDate = new Date(ref.createdAt || 0);
        return refDate.toISOString().split('T')[0] === dateString;
      });
      
      // Count commissions for this date
      const dateCommissions = commissions.filter(comm => {
        const commDate = new Date(comm.createdAt || 0);
        return commDate.toISOString().split('T')[0] === dateString;
      });
      
      // Calculate total commission amount for this date
      const commissionAmount = dateCommissions.reduce((sum, comm) => sum + comm.commissionAmount, 0);
      
      return {
        date: formatDate(date),
        clicks: dateReferrals.filter(ref => ref.status === 'clicked').length,
        registrations: dateReferrals.filter(ref => ref.status === 'registered').length,
        orders: dateReferrals.filter(ref => ['ordered', 'approved'].includes(ref.status)).length,
        commission: commissionAmount
      };
    });
    
    // Group data by week or month if time range is large
    let groupedData = data;
    if (timeRange === '90days' || timeRange === 'all') {
      // Group by week
      const weeks: Record<string, any> = {};
      
      data.forEach(day => {
        const date = new Date(day.date);
        const weekNum = Math.floor(date.getDate() / 7);
        const monthYear = `${date.toLocaleDateString('en-US', { month: 'short' })}-${weekNum}`;
        
        if (!weeks[monthYear]) {
          weeks[monthYear] = {
            date: `${date.toLocaleDateString('en-US', { month: 'short' })} W${weekNum+1}`,
            clicks: 0,
            registrations: 0,
            orders: 0,
            commission: 0
          };
        }
        
        weeks[monthYear].clicks += day.clicks;
        weeks[monthYear].registrations += day.registrations;
        weeks[monthYear].orders += day.orders;
        weeks[monthYear].commission += day.commission;
      });
      
      groupedData = Object.values(weeks);
    }
    
    setChartData(groupedData);
  }, [referrals, commissions, timeRange]);

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-md shadow-md">
          <p className="font-medium text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'Commission' ? `¥${entry.value.toLocaleString()}` : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-primary/10 hover:shadow-md transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <CardTitle className="flex items-center text-xl">
          <TrendingUp className="w-5 h-5 mr-2 text-primary" />
          Performance Analytics
        </CardTitle>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          
          <Tabs value={chartType} onValueChange={(value: any) => setChartType(value)} className="w-[140px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="line" className="px-2">
                <TrendingUp className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="bar" className="px-2">
                <BarChart2 className="w-4 h-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="h-80">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                  />
                  <YAxis 
                    yAxisId="left"
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                    tickFormatter={(value) => `¥${value}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: 10 }} />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="clicks" 
                    name="Clicks" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="registrations" 
                    name="Registrations" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="orders" 
                    name="Orders" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="commission" 
                    name="Commission" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              ) : (
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                  />
                  <YAxis 
                    yAxisId="left"
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                    tickFormatter={(value) => `¥${value}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: 10 }} />
                  <Bar 
                    yAxisId="left"
                    dataKey="clicks" 
                    name="Clicks" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    yAxisId="left"
                    dataKey="registrations" 
                    name="Registrations" 
                    fill="#10b981" 
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    yAxisId="left"
                    dataKey="orders" 
                    name="Orders" 
                    fill="#f59e0b" 
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    yAxisId="right"
                    dataKey="commission" 
                    name="Commission" 
                    fill="#8b5cf6" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500 mb-2">No data available for the selected time range</p>
                <p className="text-sm text-gray-400">Start sharing your affiliate link to see performance data</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AffiliatePerformanceChart;