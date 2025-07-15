import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { ProductVariant } from '@/types';

interface ProductVariantsProps {
  category: string;
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
}

const ProductVariants = ({ category, variants, onChange }: ProductVariantsProps) => {
  const [selectedVariants, setSelectedVariants] = useState<ProductVariant[]>(variants);

  useEffect(() => {
    setSelectedVariants(variants);
  }, [variants]);

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: Date.now().toString(),
      name: '',
      price: 0,
      stock: 0,
      rawSelections: {}
    };
    const updatedVariants = [...selectedVariants, newVariant];
    setSelectedVariants(updatedVariants);
    onChange(updatedVariants);
  };

  const removeVariant = (index: number) => {
    const updatedVariants = selectedVariants.filter((_, i) => i !== index);
    setSelectedVariants(updatedVariants);
    onChange(updatedVariants);
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const updatedVariants = selectedVariants.map((variant, i) => {
      if (i === index) {
        return { ...variant, [field]: value };
      }
      return variant;
    });
    setSelectedVariants(updatedVariants);
    onChange(updatedVariants);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-medium">Varian Produk</Label>
          <p className="text-sm text-gray-600 mt-1">
            Tambahkan varian untuk produk ini (opsional). Anda dapat menambahkan sebanyak yang diperlukan.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addVariant}
          className="flex items-center space-x-1 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Varian</span>
        </Button>
      </div>

      {selectedVariants.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-gray-400 text-4xl mb-2">📦</div>
          <p className="text-gray-500 text-sm">
            Belum ada varian ditambahkan
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Klik "Tambah Varian" untuk menambah varian baru
          </p>
        </div>
      )}

      {selectedVariants.map((variant, index) => (
        <div key={variant.id} className="border rounded-lg p-4 space-y-4 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-900">
              Varian {index + 1}
            </Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeVariant(index)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Variant Name */}
          <div>
            <Label htmlFor={`variant-name-${index}`} className="text-sm">
              Nama Varian *
            </Label>
            <Input
              id={`variant-name-${index}`}
              value={variant.name}
              onChange={(e) => updateVariant(index, 'name', e.target.value)}
              placeholder="Nama"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Berikan nama yang jelas dan deskriptif untuk varian ini
            </p>
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`variant-price-${index}`} className="text-sm">
                Harga Varian (¥) *
              </Label>
              <Input
                id={`variant-price-${index}`}
                type="number"
                value={variant.price}
                onChange={(e) => updateVariant(index, 'price', parseInt(e.target.value) || 0)}
                placeholder="0"
                min="0"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Harga untuk varian ini
              </p>
            </div>
            <div>
              <Label htmlFor={`variant-stock-${index}`} className="text-sm">
                Stok Varian *
              </Label>
              <Input
                id={`variant-stock-${index}`}
                type="number"
                value={variant.stock}
                onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                placeholder="0"
                min="0"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Jumlah stok untuk varian ini
              </p>
            </div>
          </div>

          {/* Preview */}
          {variant.name && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Label className="text-sm text-blue-800">Preview Varian:</Label>
              <div className="mt-1 flex items-center justify-between">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {variant.name}
                </Badge>
                <div className="text-sm text-blue-700">
                  ¥{variant.price.toLocaleString()} | Stok: {variant.stock}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {selectedVariants.length > 0 && (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="text-sm font-medium text-green-800 mb-2">
            ✅ Total {selectedVariants.length} Varian Ditambahkan
          </h4>
          <div className="space-y-1">
            {selectedVariants.map((variant, index) => (
              <div key={index} className="text-xs text-green-700 flex justify-between">
                <span>{variant.name || `Varian ${index + 1} (belum diberi nama)`}</span>
                <span>¥{variant.price.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-200">
            <h5 className="text-xs font-medium text-yellow-800 mb-1">💡 Tips Varian:</h5>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• Pastikan setiap varian memiliki nama yang unik dan jelas</li>
              <li>• Harga varian adalah harga total (bukan tambahan)</li>
              <li>• Stok varian terpisah dari stok produk utama</li>
              <li>• Anda dapat menambahkan varian sebanyak yang diperlukan</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductVariants;