import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Product, ProductVariant } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import ProductVariantDisplay from '@/components/ProductVariantDisplay';

interface VariantSelectionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onAddToCart: (variant: ProductVariant | null, quantity: number) => void;
}

const VariantSelectionPopup = ({ 
  isOpen, 
  onClose, 
  product, 
  onAddToCart 
}: VariantSelectionPopupProps) => {
  const { t } = useLanguage();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  
  // Reset state when product changes or dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedVariant(null);
      setQuantity(1);
      setError(null);
    }
  }, [isOpen, product]);
  
  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setError(null);
  };
  
  const handleAddToCart = () => {
    // Check if variants exist and one is selected
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      setError(t('productDetail.selectVariantMessage'));
      return;
    }
    
    // Check stock
    const effectiveStock = selectedVariant ? selectedVariant.stock : product.stock;
    if (effectiveStock < quantity) {
      setError(t('productDetail.insufficientStock'));
      return;
    }
    
    // Add to cart and close dialog
    onAddToCart(selectedVariant, quantity);
    onClose();
  };
  
  // Get effective price based on selected variant
  const getEffectivePrice = () => {
    if (selectedVariant) {
      return selectedVariant.price;
    }
    return product.price;
  };
  
  // Get effective stock based on selected variant
  const getEffectiveStock = () => {
    if (selectedVariant) {
      return selectedVariant.stock;
    }
    return product.stock;
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0
    }).format(price);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{t('productDetail.selectVariant')}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Product Info */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
              <img 
                src={product.image_url || '/placeholder.svg'} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{product.name}</h3>
              <p className="text-primary font-bold">
                {formatPrice(getEffectivePrice())}
              </p>
            </div>
          </div>
          
          {/* Variant Selection */}
          {product.variants && product.variants.length > 0 && (
            <ProductVariantDisplay
              variants={product.variants}
              selectedVariant={selectedVariant}
              onVariantSelect={handleVariantSelect}
            />
          )}
          
          {/* Quantity Selector */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">{t('productDetail.quantity')}:</h4>
            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-gray-600 hover:text-primary transition-colors"
                  type="button"
                >
                  -
                </button>
                <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(getEffectiveStock(), quantity + 1))}
                  className="px-4 py-2 text-gray-600 hover:text-primary transition-colors"
                  type="button"
                >
                  +
                </button>
              </div>
              
              <div className="text-lg font-semibold">
                {t('productDetail.total')} {formatPrice(getEffectivePrice() * quantity)}
              </div>
            </div>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            {t('buttons.close')}
          </Button>
          <Button 
            onClick={handleAddToCart}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90"
            disabled={product.variants && product.variants.length > 0 && !selectedVariant}
          >
            {t('buttons.addToCart')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VariantSelectionPopup;