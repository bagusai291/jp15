
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CheckoutForm from '@/components/CheckoutForm';
import { Button } from '@/components/ui/button';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, total, clearCart } = useCart();

  const handleQuantityChange = (id: string, change: number) => {
    const item = cart.find(item => item.id === id);
    if (item) {
      const newQuantity = Math.max(0, item.quantity + change);
      if (newQuantity === 0) {
        removeFromCart(id);
      } else {
        updateQuantity(id, newQuantity);
      }
    }
  };

  const handleOrderComplete = () => {
    clearCart();
  };

  if (cart.length === 0) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
          <div className="container mx-auto px-4">
            <div className="text-center py-16">
              <div className="bg-white rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center shadow-lg">
                <ShoppingBag className="w-16 h-16 text-gray-300" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-3">Keranjang Kosong</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">Belum ada produk yang ditambahkan ke keranjang. Yuk mulai belanja sekarang!</p>
              <Link to="/products">
                <Button className="bg-primary hover:bg-primary/90 px-8 py-3 text-lg">
                  Mulai Belanja
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Keranjang Saya</h1>
            <p className="text-gray-600">Periksa kembali pesanan Anda sebelum checkout</p>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Cart Items - Modern Card Design */}
            <div className="xl:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Cart Header */}
                <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Produk Pilihan</h2>
                    <div className="bg-white/20 px-3 py-1 rounded-full">
                      <span className="text-sm font-medium">{cart.length} item</span>
                    </div>
                  </div>
                </div>

                {/* Cart Items List */}
                <div className="p-6">
                  <div className="space-y-6">
                    {cart.map((item, index) => (
                      <div key={item.id} className={`${index !== cart.length - 1 ? 'border-b border-gray-100 pb-6' : ''}`}>
                        <div className="flex items-start gap-4">
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-100 shadow-sm">
                              <img
                                src={item.image_url || '/placeholder.svg'}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                          
                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-800 text-lg mb-2 line-clamp-2">{item.name}</h3>
                            
                            {/* Variants */}
                            {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                              <div className="mb-3">
                                <div className="flex flex-wrap gap-1">
                                  {Object.entries(item.selectedVariants).map(([type, value], index) => (
                                    <span key={`${type}-${index}`} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                      {type}: {value}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Price per unit */}
                            <div className="text-sm text-gray-500 mb-3">
                              ¥{item.price.toLocaleString()} per item
                            </div>

                            {/* Quantity Controls & Total Price */}
                            <div className="flex items-center justify-between">
                              {/* Quantity Controls */}
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleQuantityChange(item.id, -1)}
                                  className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center group"
                                >
                                  <Minus className="w-4 h-4 text-gray-600 group-hover:text-gray-800" />
                                </button>
                                <div className="bg-gray-50 px-4 py-2 rounded-lg min-w-[50px] text-center">
                                  <span className="font-semibold text-gray-800">{item.quantity}</span>
                                </div>
                                <button
                                  onClick={() => handleQuantityChange(item.id, 1)}
                                  className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center group"
                                >
                                  <Plus className="w-4 h-4 text-gray-600 group-hover:text-gray-800" />
                                </button>
                              </div>

                              {/* Item Total & Remove */}
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="text-lg font-bold text-primary">
                                    ¥{(item.price * item.quantity).toLocaleString()}
                                  </div>
                                </div>
                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors group"
                                  title="Hapus dari keranjang"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 p-6 border-t border-gray-100">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-gray-600">
                      <span className="text-lg">Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} item)</span>
                      <span className="text-lg font-semibold text-gray-800">¥{total.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-gray-800">Total Belanja</span>
                        <span className="text-2xl font-bold text-primary">¥{total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout Form - Sticky on Desktop */}
            <div className="xl:col-span-1">
              <div className="sticky top-8">
                <CheckoutForm 
                  cart={cart} 
                  total={total} 
                  onOrderComplete={handleOrderComplete}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Cart;
