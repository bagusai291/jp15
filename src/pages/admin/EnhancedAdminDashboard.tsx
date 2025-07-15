import { useAdminStats } from '@/hooks/useAdminStats';
import { useAdminLogs } from '@/hooks/useAdminLogs';
import { useInventoryMonitoring } from '@/hooks/useInventoryMonitoring';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DashboardStatsCards from '@/components/admin/DashboardStatsCards';
import InventoryAlerts from '@/components/admin/InventoryAlerts';
import AdminLayout from '@/components/admin/AdminLayout';
import SeedDataButton from '@/components/admin/SeedDataButton';
import FinancialSummaryCards from '@/components/admin/FinancialSummaryCards';

const EnhancedAdminDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: logs = [], isLoading: logsLoading } = useAdminLogs();
  const { lowStockProducts, outOfStockProducts, loading: inventoryLoading } = useInventoryMonitoring(5);
  
  // Get current year and month
  const getCurrentYearMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };
  
  // Format month for display
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  if (statsLoading) {
    return (
      <AdminLayout>
        <div className="p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout>
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error loading dashboard</h1>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin Injapan Food</h1>
            <p className="text-gray-600">Selamat datang di panel admin yang telah ditingkatkan</p>
          </div>
          <SeedDataButton />
        </div>

        <DashboardStatsCards stats={stats} />

        {/* Inventory Alerts */}
        <InventoryAlerts
          lowStockProducts={lowStockProducts}
          outOfStockProducts={outOfStockProducts}
          loading={inventoryLoading}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 5 Produk Stok Terendah */}
          <Card>
            <CardHeader>
              <CardTitle>5 Produk Stok Terendah</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.lowStockProducts.length > 0 ? (
                  stats.lowStockProducts.map((product) => (
                    <div key={product.id} className="flex items-center space-x-4">
                      <img 
                        src={product.image_url || '/placeholder.svg'} 
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">¥{product.price}</p>
                      </div>
                      <div className="text-sm">
                        <Badge 
                          variant={product.stock <= 5 ? "destructive" : "secondary"}
                        >
                          Stok: {product.stock}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Semua produk memiliki stok yang cukup</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Log Aktivitas Terbaru */}
          <Card>
            <CardHeader>
              <CardTitle>Aktivitas Admin Terbaru</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                {!logsLoading && logs.length > 0 ? (
                  logs.slice(0, 10).map((log) => (
                    <div key={log.id} className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        log.action.includes('delete') ? 'bg-red-500' :
                        log.action.includes('create') ? 'bg-green-500' :
                        log.action.includes('update') ? 'bg-blue-500' : 'bg-gray-500'
                      }`}></div>
                      <span className="flex-1">{log.action} {log.target_type}</span>
                      <span className="text-gray-500">
                        {new Date(log.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    {logsLoading ? 'Memuat log...' : 'Belum ada aktivitas'}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EnhancedAdminDashboard;
