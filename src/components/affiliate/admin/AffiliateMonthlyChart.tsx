import { useState, useEffect } from 'react';
import { useAffiliateAdmin } from '@/hooks/useAffiliateAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AffiliateMonthlyChart = () => {
  const { commissions, referrals, selectedMonth, availableMonths } = useAffiliateAdmin();
  const [chartData, setChartData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'commissions' | 'referrals'>('commissions');

  // Format month for display
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('id-ID', { month: 'short' });
  };

  // Prepare chart data
  useEffect(() => {
    // Group data by month
    const groupByMonth = (items: any[], dateField: string) => {
      const grouped: Record<string, any[]> = {};
      
      items.forEach(item => {
        if (!item[dateField]) return;
        
        const date = new Date(item[dateField]);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!grouped[monthKey]) {
          grouped[monthKey] = [];
        }
        
        grouped[monthKey].push(item);
      });
      
      return grouped;
    };
    
    // Get last 6 months
    const getLastMonths = (count: number) => {
      const months = [];
      const now = new Date();
      
      for (let i = 0; i < count; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        months.push(monthKey);
      }
      
      return months;
    };
    
    const lastMonths = getLastMonths(6).reverse();
    
    if (activeTab === 'commissions') {
      const groupedCommissions = groupByMonth(commissions, 'createdAt');
      
      const data = lastMonths.map(month => {
        const monthCommissions = groupedCommissions[month] || [];
        const totalAmount = monthCommissions.reduce((sum, commission) => sum + commission.commissionAmount, 0);
        const pendingAmount = monthCommissions
          .filter(commission => commission.status === 'pending')
          .reduce((sum, commission) => sum + commission.commissionAmount, 0);
        const approvedAmount = monthCommissions
          .filter(commission => commission.status === 'approved')
          .reduce((sum, commission) => sum + commission.commissionAmount, 0);
        
        return {
          month: formatMonth(month),
          total: totalAmount,
          pending: pendingAmount,
          approved: approvedAmount
        };
      });
      
      setChartData(data);
    } else {
      const groupedReferrals = groupByMonth(referrals, 'createdAt');
      
      const data = lastMonths.map(month => {
        const monthReferrals = groupedReferrals[month] || [];
        const totalClicks = monthReferrals.filter(ref => ref.status === 'clicked').length;
        const registrations = monthReferrals.filter(ref => ref.status === 'registered').length;
        const orders = monthReferrals.filter(ref => ['ordered', 'approved'].includes(ref.status)).length;
        
        return {
          month: formatMonth(month),
          clicks: totalClicks,
          registrations: registrations,
          orders: orders
        };
      });
      
      setChartData(data);
    }
  }, [commissions, referrals, activeTab]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Statistik Bulanan</span>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'commissions' | 'referrals')}>
            <TabsList>
              <TabsTrigger value="commissions">Komisi</TabsTrigger>
              <TabsTrigger value="referrals">Referral</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              
              {activeTab === 'commissions' ? (
                <>
                  <Bar dataKey="total" name="Total Komisi" fill="#8884d8" />
                  <Bar dataKey="pending" name="Pending" fill="#ffc658" />
                  <Bar dataKey="approved" name="Disetujui" fill="#82ca9d" />
                </>
              ) : (
                <>
                  <Bar dataKey="clicks" name="Klik" fill="#8884d8" />
                  <Bar dataKey="registrations" name="Registrasi" fill="#82ca9d" />
                  <Bar dataKey="orders" name="Order" fill="#ffc658" />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AffiliateMonthlyChart;