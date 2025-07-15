import { CartItem, Product } from '@/types';

export const getCartFromStorage = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem('injapan-cart');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveCartToStorage = (cart: CartItem[]): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('injapan-cart', JSON.stringify(cart));
};

export const addToCart = (product: Product, quantity: number = 1): CartItem[] => {
  const cart = getCartFromStorage();
  
  // Create a unique identifier for products with variants
  const productId = product.selectedVariantName 
    ? `${product.id}-${product.selectedVariantName.replace(/\s+/g, '-')}`
    : product.id;
  
  const existingItemIndex = cart.findIndex(item => item.id === productId);
  
  if (existingItemIndex !== -1) {
    // Update existing item
    cart[existingItemIndex].quantity += quantity;
  } else {
    // Add new item
    const cartItem: CartItem = {
      id: productId,
      name: product.selectedVariantName 
        ? `${product.name} (${product.selectedVariantName})`
        : product.name,
      price: product.price,
      quantity,
      image_url: product.image_url || '/placeholder.svg',
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url || '/placeholder.svg',
        category: product.category,
        description: product.description || '',
        stock: product.stock
      },
      selectedVariants: product.selectedVariants || {},
      selectedVariantName: product.selectedVariantName || null,
      product_id: product.id // Add product_id for stock updates
    };
    
    cart.push(cartItem);
  }
  
  saveCartToStorage(cart);
  return cart;
};

export const removeFromCart = (itemId: string): CartItem[] => {
  const currentCart = getCartFromStorage();
  const updatedCart = currentCart.filter(item => item.id !== itemId);
  saveCartToStorage(updatedCart);
  return updatedCart;
};

export const updateCartItemQuantity = (itemId: string, quantity: number): CartItem[] => {
  const currentCart = getCartFromStorage();
  const updatedCart = currentCart.map(item => 
    item.id === itemId ? { ...item, quantity } : item
  ).filter(item => item.quantity > 0);
  
  saveCartToStorage(updatedCart);
  return updatedCart;
};

export const clearCart = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('injapan-cart');
};

export const getCartTotal = (cart: CartItem[]): number => {
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0
  }).format(price);
};
