import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { deleteProduct } from '@/services/productService';
import { toast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Edit, Trash, Search, Filter, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { getCategoriesWithVariants, getCategoryIcon } from '@/utils/categoryVariants';

const ProductsList = () => {
  const { data: products = [], refetch, isLoading } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [deletingProducts, setDeletingProducts] = useState<Set<string>>(new Set());

  const categories = getCategoriesWithVariants();

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteProduct = async (product: any) => {
    setDeletingProducts(prev => new Set(prev).add(product.id));

    try {
      await deleteProduct(product.id);

      toast({
        title: "Berhasil",
        description: "Produk telah dihapus permanent",
      });

      await refetch();
      
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Terjadi Kesalahan",
        description: "Gagal menghapus produk",
        variant: "destructive"
      });
    } finally {
      setDeletingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kelola Produk</h1>
            <p className="text-gray-600">Lihat dan kelola semua produk dengan varian tanpa batas</p>
          </div>
          <Link to="/admin/add-product">
            <Button className="bg-green-600 hover:bg-green-700">
              Tambah Produk Baru
            </Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filter & Pencarian</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Cari produk..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      <div className="flex items-center space-x-2">
                        <span>{getCategoryIcon(category)}</span>
                        <span>{category}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Produk ({filteredProducts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className={`flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-all ${
                  deletingProducts.has(product.id) ? 'opacity-50 pointer-events-none' : ''
                }`}>
                  <img 
                    src={product.image_url || '/placeholder.svg'} 
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <div className="flex items-center space-x-3 mt-2">
                      <span className="font-bold text-red-600 text-lg">¥{product.price}</span>
                      <Badge variant="secondary" className="flex items-center space-x-1">
                        <span>{getCategoryIcon(product.category)}</span>
                        <span>{product.category}</span>
                      </Badge>
                      <span className={`px-2 py-1 rounded text-xs ${
                        product.stock > 10 
                          ? 'bg-green-100 text-green-800' 
                          : product.stock > 0 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        Stok: {product.stock}
                      </span>
                      
                      {product.variants && product.variants.length > 0 && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {product.variants.length} Varian
                        </Badge>
                      )}
                    </div>
                    
                    {/* Display available variants */}
                    {product.variants && product.variants.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {product.variants.slice(0, 3).map((variant, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                            {variant.name}
                          </span>
                        ))}
                        {product.variants.length > 3 && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                            +{product.variants.length - 3} lainnya
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link to={`/products/${product.id}`}>
                      <Button size="sm" variant="outline" title="Lihat Produk">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Link to={`/admin/edit-product/${product.id}`}>
                      <Button size="sm" variant="outline" title="Edit Produk">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          disabled={deletingProducts.has(product.id)}
                          title="Hapus Produk"
                        >
                          {deletingProducts.has(product.id) ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash className="w-4 h-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Konfirmasi Penghapusan Produk</AlertDialogTitle>
                          <AlertDialogDescription>
                            Produk "<strong>{product.name}</strong>" akan dihapus secara permanen dari database. 
                            Tindakan ini tidak dapat dibatalkan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteProduct(product)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Hapus Permanen
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
              
              {filteredProducts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {products.length === 0 ? 'Belum ada produk yang ditambahkan' : 'Tidak ada produk yang ditemukan'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ProductsList;