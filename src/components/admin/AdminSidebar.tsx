import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  CheckCircle,
  Upload,
  Trash2,
  Truck,
  CreditCard,
  Percent,
  DollarSign,
  ShoppingBag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';
import { getCategoryTranslation } from '@/utils/categoryVariants';

const AdminSidebar = () => {
  const location = useLocation();
  const { language } = useLanguage();

  const menuItems = [
    {
      title: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
    },
    {
      title: 'Konfirmasi Pesanan',
      href: '/admin/order-confirmation',
      icon: CheckCircle,
      description: 'Pending orders'
    },
    {
      title: 'Verifikasi Pembayaran',
      href: '/admin/payment-verification',
      icon: CreditCard,
      description: 'Payment verification'
    },
    {
      title: 'Produk',
      href: '/admin/products',
      icon: Package,
    },
    {
      title: 'Tambah Produk',
      href: '/admin/add-product',
      icon: Package,
    },
    {
      title: 'Riwayat Pesanan',
      href: '/admin/orders-history',
      icon: ShoppingCart,
    },
    {
      title: 'Manajemen User',
      href: '/admin/users',
      icon: Users,
    },
    {
      title: 'Pengaturan Ongkir',
      href: '/admin/shipping-rates',
      icon: Truck,
    },
    {
      title: 'Program Affiliate',
      href: '/admin/affiliate',
      icon: Percent,
    },
    {
      title: 'Laporan Keuangan',
      href: '/admin/financial-reports',
      icon: DollarSign,
      description: 'Financial reports'
    },
    {
      title: 'Import/Export',
      href: '/admin/import-export',
      icon: Upload,
    },
    {
      title: 'Recycle Bin',
      href: '/admin/recycle-bin',
      icon: Trash2,
    }
  ];

  return (
    <div className="w-64 bg-white shadow-lg h-screen overflow-y-auto">
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
            <img 
              src="/logo.png" 
              alt="Injapan Food Logo" 
              className="w-full h-full object-contain bg-white p-1"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-sm text-gray-600">Injapan Food</p>
          </div>
        </div>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-red-50 text-red-700 border-r-2 border-red-700"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.title}</span>
                  {item.description && (
                    <span className="text-xs text-gray-500 ml-auto">
                      {item.description}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar;