import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useFirebaseAuth';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Save, ArrowLeft, X, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import ProductVariants from '@/components/admin/ProductVariants';
import { addProduct, uploadProductImages } from '@/services/productService';
import { getCategoriesWithVariants, getCategoryIcon } from '@/utils/categoryVariants';

const AddProduct = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: ''
  });
  const [variants, setVariants] = useState([]);

  const categories = getCategoriesWithVariants();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      handleInputChange('price', value);
    }
  };

  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      handleInputChange('stock', value);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate files
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: `File ${file.name} terlalu besar. Maksimal 5MB`,
          variant: "destructive"
        });
        return false;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Error",
          description: `Format file ${file.name} tidak didukung`,
          variant: "destructive"
        });
        return false;
      }
      return true;
    });

    setImageFiles(prev => [...prev, ...validFiles]);

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.category || !formData.stock) {
      toast({
        title: "Error",
        description: "Semua field wajib diisi",
        variant: "destructive"
      });
      return;
    }

    const priceNum = parseInt(formData.price);
    const stockNum = parseInt(formData.stock);
    
    if (isNaN(priceNum) || priceNum < 0) {
      toast({
        title: "Error",
        description: "Harga harus berupa angka yang valid",
        variant: "destructive"
      });
      return;
    }
    
    if (isNaN(stockNum) || stockNum < 0) {
      toast({
        title: "Error",
        description: "Stok harus berupa angka yang valid",
        variant: "destructive"
      });
      return;
    }

    // Validate variants if any
    if (variants.length > 0) {
      const invalidVariants = variants.filter(v => !v.name || v.price <= 0 || v.stock < 0);
      if (invalidVariants.length > 0) {
        toast({
          title: "Error",
          description: "Semua varian harus memiliki nama, harga, dan stok yang valid",
          variant: "destructive"
        });
        return;
      }
    }

    if (!user) {
      toast({
        title: "Error",
        description: "Anda harus login terlebih dahulu",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Upload images if provided
      let imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        imageUrls = await uploadProductImages(imageFiles);
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: priceNum,
        category: formData.category,
        stock: stockNum,
        images: imageUrls.length > 0 ? imageUrls : ['/placeholder.svg'],
        image_url: imageUrls.length > 0 ? imageUrls[0] : '/placeholder.svg',
        variants: variants || [],
        status: 'active' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await addProduct(productData);

      toast({
        title: "Berhasil!",
        description: `Produk berhasil ditambahkan${variants.length > 0 ? ` dengan ${variants.length} varian` : ''}`,
      });

      navigate('/admin/products');
    } catch (error) {
      console.error('Product addition error:', error);
      
      let errorMessage = "Gagal menambahkan produk";
      if (error instanceof Error) {
        if (error.message.includes('storage')) {
          errorMessage = "Gagal mengupload gambar. Silakan coba lagi";
        } else if (error.message.includes('permission')) {
          errorMessage = "Tidak memiliki izin untuk menambahkan produk";
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center space-x-4 mb-8">
          <Link to="/admin/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tambah Produk Baru</h1>
            <p className="text-gray-600">Lengkapi form untuk menambahkan produk dengan varian tanpa batas</p>
            {user && (
              <p className="text-sm text-green-600 mt-1">
                Logged in as: {user.email}
              </p>
            )}
          </div>
        </div>

        <div className="max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Produk</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Nama Produk *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Masukkan nama produk"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Masukkan deskripsi produk"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Kategori *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => {
                      handleInputChange('category', value);
                      setVariants([]);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Harga Dasar (¥) *</Label>
                    <Input
                      id="price"
                      type="text"
                      inputMode="numeric"
                      value={formData.price}
                      onChange={handlePriceChange}
                      placeholder="0"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Harga dasar produk (jika ada varian, harga ini akan diabaikan)
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="stock">Stok *</Label>
                    <Input
                      id="stock"
                      type="text"
                      inputMode="numeric"
                      value={formData.stock}
                      onChange={handleStockChange}
                      placeholder="0"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Stok produk (jika ada varian, stok ini akan diabaikan)
                    </p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <ProductVariants
                    category={formData.category}
                    variants={variants}
                    onChange={setVariants}
                  />
                </div>

                <div>
                  <Label htmlFor="images">Foto Produk (Multi-upload)</Label>
                  <div className="mt-2">
                    <Input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="mb-4"
                    />
                    <p className="text-sm text-gray-500 mb-2">
                      Format: JPEG, PNG, WebP, GIF. Maksimal 5MB per file. Bisa upload beberapa gambar sekaligus.
                    </p>
                    
                    {imagePreviews.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">Preview ({imagePreviews.length} gambar):</p>
                        <div className="grid grid-cols-3 gap-4">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative">
                              <img 
                                src={preview} 
                                alt={`Preview ${index + 1}`} 
                                className="w-full h-24 object-cover rounded-lg border"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Simpan Produk
                  </Button>
                  <Link to="/admin/products">
                    <Button type="button" variant="outline">
                      Batal
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddProduct;