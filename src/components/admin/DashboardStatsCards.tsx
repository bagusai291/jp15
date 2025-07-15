
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, TrendingDown, CheckCircle, AlertTriangle, ShoppingCart } from 'lucide-react';
import { DashboardStats } from '@/types';

interface DashboardStatsCardsProps {
  stats: DashboardStats;
}

const DashboardStatsCards = ({ stats }: DashboardStatsCardsProps) => {
  const statCards = [
    {
      title: 'Total Produk',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-500'
    },
    {
      title: 'Produk Aktif',
      value: stats.activeProducts,
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      title: 'Stok Habis',
      value: stats.outOfStockProducts,
      icon: TrendingDown,
      color: 'bg-red-500'
    },
    {
      title: 'Stok Kritis',
      value: stats.criticalStockProducts.length,
      icon: AlertTriangle,
      color: 'bg-orange-500'
    },
    {
      title: 'Total Pesanan',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-purple-500'
    }
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.color}`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Critical Stock Alert */}
      {stats.criticalStockProducts.length > 0 && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Peringatan Stok Kritis!</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.criticalStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between">
                  <span className="font-medium">{product.name}</span>
                  <Badge variant="destructive">
                    Stok: {product.stock}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default DashboardStatsCards;
