import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Package } from 'lucide-react';
import { Product } from '@/types';
import { Link } from 'react-router-dom';

interface InventoryAlertsProps {
  lowStockProducts: Product[];
  outOfStockProducts: Product[];
  loading: boolean;
}

const InventoryAlerts = ({ lowStockProducts, outOfStockProducts, loading }: InventoryAlertsProps) => {
  if (loading) {
    return (
      <Card className="mb-6 animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="h-40 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (lowStockProducts.length === 0 && outOfStockProducts.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6 border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-yellow-800 flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5" />
          <span>Peringatan Stok</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {outOfStockProducts.length > 0 && (
            <div>
              <h4 className="font-medium text-red-800 mb-2">Stok Habis ({outOfStockProducts.length} produk)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {outOfStockProducts.map((product) => (
                  <Link 
                    key={product.id} 
                    to={`/admin/edit-product/${product.id}`}
                    className="flex items-center justify-between p-2 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-red-600" />
                      <span className="font-medium text-red-800 truncate max-w-[150px]" title={product.name}>
                        {product.name}
                      </span>
                    </div>
                    <Badge variant="destructive">
                      Stok: 0
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          {lowStockProducts.length > 0 && (
            <div>
              <h4 className="font-medium text-yellow-800 mb-2">Stok Menipis ({lowStockProducts.length} produk)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {lowStockProducts.map((product) => (
                  <Link 
                    key={product.id} 
                    to={`/admin/edit-product/${product.id}`}
                    className="flex items-center justify-between p-2 bg-yellow-100 rounded-md hover:bg-yellow-200 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800 truncate max-w-[150px]" title={product.name}>
                        {product.name}
                      </span>
                    </div>
                    <Badge variant="outline" className="bg-yellow-200 text-yellow-800 border-yellow-300">
                      Stok: {product.stock}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryAlerts;