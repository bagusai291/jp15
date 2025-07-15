import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProduct, useProducts } from '@/hooks/useProducts';
import { formatPrice, addToCart as addToCartUtil } from '@/utils/cart';
import { useLanguage } from '@/hooks/useLanguage';
import { useCartAnimation } from '@/hooks/useCartAnimation';
import { ShoppingCart, Truck, Check } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FlyingProductAnimation from '@/components/FlyingProductAnimation';
import ProductVariantDisplay from '@/components/ProductVariantDisplay';
import { useCart } from '@/hooks/useCart';
import { toast } from '@/hooks/use-toast';
import { ProductVariant } from '@/types';
import { Badge } from '@/components/ui/badge';
import { getCategoryIcon, getCategoryTranslation } from '@/utils/categoryVariants';
import VariantSelectionPopup from '@/components/VariantSelectionPopup';

const ProductDetail = () => {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [variantSelectionError, setVariantSelectionError] = useState<string | null>(null);
  const [showVariantPopup, setShowVariantPopup] = useState(false);
  const quantityRef = useRef<HTMLDivElement>(null);
  
  const { data: product, isLoading } = useProduct(id!);
  const { data: allProducts = [] } = useProducts();
  const { addToCart } = useCart();
  
  const {
    animatingProduct,
    startPosition,
    targetPosition,
    isAnimating,
    shouldAnimateCart,
    triggerAnimation,
    resetAnimation
  } = useCartAnimation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    // Reset variant selection when product changes
    console.log('Product changed, resetting variants');
    setSelectedVariant(null);
    setVariantSelectionError(null);
  }, [product]);

  const handleVariantSelect = (variant: ProductVariant) => {
    console.log('Variant selected:', variant);
    setSelectedVariant(variant);
    setVariantSelectionError(null);
  };

  const getEffectivePrice = () => {
    if (!product) return 0;
    
    if (selectedVariant) {
      // For variants, use the variant price as the total price (not additional)
      return selectedVariant.price;
    }
    
    return product.price;
  };

  const getEffectiveStock = () => {
    if (selectedVariant) {
      return selectedVariant.stock;
    }
    return product?.stock || 0;
  };

  // Helper function to get the appropriate product description
  const getProductDescription = () => {
    if (!product) return '';
    
    // Try to get translation by product ID
    const translationKey = `productDescriptions.${product.id}`;
    const translatedDescription = t(translationKey);
    
    // If translation key is returned as-is, it means no translation was found
    // In that case, return the original description in Indonesian
    if (translatedDescription === translationKey || !translatedDescription) {
      return product.description || t('productDetail.noDescription');
    }
    
    // Return the translated description if available, otherwise fall back to original
    return translatedDescription !== product.id ? translatedDescription : (product.description || t('productDetail.noDescription'));
  };

  const handleAddToCart = (position: { x: number; y: number }) => {
    if (!product) return;

    const hasVariants = product.variants && product.variants.length > 0;

    console.log('Add to cart - hasVariants:', hasVariants);
    console.log('Add to cart - selectedVariant:', selectedVariant);

    // Check if variants are required but not selected
    if (hasVariants && !selectedVariant) {
      toast({
        title: t('productDetail.selectVariantRequired'), 
        description: t('productDetail.selectVariantMessage'),
        variant: "destructive"
      });
      setVariantSelectionError(t('productDetail.selectVariantMessage'));
      setShowVariantPopup(true);
      return;
    }

    // Check stock
    const effectiveStock = getEffectiveStock();
    if (effectiveStock < quantity) {
      toast({
        title: t('productDetail.insufficientStock'),
        description: t('productDetail.availableStockOnly', { stock: effectiveStock }),
        variant: "destructive"
      });
      return;
    }

    // Create product object with variant information
    const productToAdd = {
      ...product,
      price: getEffectivePrice(),
      selectedVariantName: selectedVariant?.name || null,
      selectedVariants: selectedVariant ? { variant: selectedVariant.name } : {}
    };

    addToCart(productToAdd, quantity);
    
    // Trigger animation
    const cartPosition = {
      x: window.innerWidth - 100,
      y: 80
    };
    
    triggerAnimation(product, position, cartPosition);

    toast({
      title: "✅ Berhasil",
      description: `${product.name}${selectedVariant ? ` (${selectedVariant.name})` : ''} berhasil ditambahkan ke keranjang.`,
    });
  };

  const handleVariantAddToCart = (selectedVariant, quantity) => {
    // Create product with variant information
    const productToAdd = {
      ...product,
      price: selectedVariant ? selectedVariant.price : product.price,
      selectedVariantName: selectedVariant?.name || null,
      selectedVariants: selectedVariant ? { variant: selectedVariant.name } : {}
    };
    
    // Add to cart
    addToCartUtil(productToAdd, quantity);
    
    // Show success toast
    toast({
      title: "✅ Berhasil",
      description: `${product.name}${selectedVariant ? ` (${selectedVariant.name})` : ''} berhasil ditambahkan ke keranjang.`,
    });
    
    // Trigger animation
    const rect = quantityRef.current?.getBoundingClientRect();
    if (rect) {
      handleAddToCart({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header shouldAnimateCart={shouldAnimateCart} />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat produk...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">😵</div>
          <h1 className="text-2xl font-bold mb-4">Produk Tidak Ditemukan</h1>
          <Link to="/products" className="btn-primary">
            Kembali ke Katalog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const effectiveStock = getEffectiveStock();
  const effectivePrice = getEffectivePrice();
  const hasVariants = product.variants && product.variants.length > 0;

  console.log('ProductDetail render - hasVariants:', hasVariants);
  console.log('ProductDetail render - product.variants:', product.variants);
  console.log('ProductDetail render - selectedVariant:', selectedVariant);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header shouldAnimateCart={shouldAnimateCart} />
      
      <FlyingProductAnimation
        product={animatingProduct}
        startPosition={startPosition}
        targetPosition={targetPosition}
        isAnimating={isAnimating}
        onComplete={resetAnimation}
      />
      
      <div className="container mx-auto px-4 py-8">
        <nav className="flex space-x-2 text-sm text-gray-600 mb-8">
          <Link to="/" className="hover:text-primary">Beranda</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary">Produk</Link>
          <span>/</span>
          <span className="text-primary">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="space-y-4">
            <div className="bg-white rounded-lg overflow-hidden shadow-md">
              <img
                src={product.image_url || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <Badge className="mb-3 flex items-center space-x-1 w-fit">
                <span>{getCategoryIcon(product.category)}</span>
                <span>{getCategoryTranslation(product.category, language)}</span>
              </Badge>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              <div className="text-4xl font-bold text-primary mb-6">
                {formatPrice(effectivePrice)}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">{t('productDetail.description')}</h3>
              <div 
                className="text-gray-600 leading-relaxed product-description"
                dangerouslySetInnerHTML={{ __html: getProductDescription().replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/• (.*?)(?=\n|$)/g, '<li>$1</li>').replace(/<li>/g, '<ul class="list-disc pl-5 my-2"><li>').replace(/<\/li>(?!\s*<li>)/g, '</li></ul>') }}
              />
            </div>

            {/* Variant Display - Show variants in radio button style */}
            {hasVariants && (
              <div className="border-t pt-6">
                <ProductVariantDisplay
                  variants={product.variants}
                  selectedVariant={selectedVariant}
                  onVariantSelect={handleVariantSelect}
                  showPrice={true}
                />
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold mb-3">{t('productDetail.availability')}</h3>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                effectiveStock > 10 
                  ? 'bg-green-100 text-green-800' 
                  : effectiveStock > 0 
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              }`}>
                {effectiveStock > 0 ? `${t('productDetail.available')} (${effectiveStock})` : t('buttons.outOfStock')}
              </div>
            </div>

            {effectiveStock > 0 && (
              <div ref={quantityRef}>
                <h3 className="text-lg font-semibold mb-3">{t('productDetail.quantity')}</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 text-gray-600 hover:text-primary transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(effectiveStock, quantity + 1))}
                      className="px-4 py-2 text-gray-600 hover:text-primary transition-colors"
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="text-lg font-semibold">
                    {t('productDetail.total')} {formatPrice(effectivePrice * quantity)}
                  </div>
                </div>
              </div>
            )}

            {effectiveStock > 0 ? (
              <button
                onClick={() => {
                  // Clear any previous error
                  setVariantSelectionError(null);
                  
                  const rect = quantityRef.current?.getBoundingClientRect();
                  if (rect) {
                    handleAddToCart({
                      x: rect.left + rect.width / 2,
                      y: rect.top + rect.height / 2
                    });
                  }
                }}
                disabled={hasVariants && !selectedVariant}
                className={`w-full text-lg py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg flex items-center justify-center space-x-3 group ${
                  (hasVariants && !selectedVariant)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
                }`}
              >
                <ShoppingCart className="w-5 h-5 group-hover:animate-bounce" />
                <span>
                  {hasVariants && !selectedVariant 
                    ? t('productDetail.selectVariantRequired')
                    : t('buttons.addToCart')
                  }
                </span>
              </button>
            ) : (
              <button
                disabled
                className="w-full bg-gray-400 text-white text-lg py-4 rounded-xl cursor-not-allowed flex items-center justify-center space-x-3"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>{t('buttons.outOfStock')}</span>
              </button>
            )}
            
            {/* Variant Selection Error Message */}
            {variantSelectionError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {variantSelectionError}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Truck className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-sm font-semibold text-gray-800 mb-1">{t('productDetail.expressShipping')}</div>
                <div className="text-xs text-gray-600">{t('productDetail.shippedWith')}</div>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-sm font-semibold text-gray-800 mb-1">{t('productDetail.premiumQuality')}</div>
                <div className="text-xs text-gray-600">{t('productDetail.guaranteedQuality')}</div>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-8">{t('productDetail.similarProducts')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id} className="card-product p-4">
                  <Link to={`/products/${relatedProduct.id}`}>
                    <img
                      src={relatedProduct.image_url || '/placeholder.svg'}
                      alt={relatedProduct.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <h3 className="font-semibold mb-2">{relatedProduct.name}</h3>
                    <div className="text-xl font-bold text-primary">
                      {formatPrice(relatedProduct.price)}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Variant Selection Popup */}
      <VariantSelectionPopup
        isOpen={showVariantPopup}
        onClose={() => setShowVariantPopup(false)}
        product={product}
        onAddToCart={handleVariantAddToCart}
      />

      <Footer />
    </div>
  );
};

export default ProductDetail;