@@ .. @@
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <div className="bg-white rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center shadow-lg">
              <ShoppingBag className="w-16 h-16 text-gray-300" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">{t('cart.empty')}</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">{t('cart.emptyMessage')}</p>
            <Link to="/products">
              <Button className="bg-primary hover:bg-primary/90 px-8 py-3 text-lg">
                {t('cart.startShopping')}
              </Button>
            </Link>
@@ .. @@
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">{t('cart.title')}</h1>
            <p className="text-gray-600">{t('cart.subtitle')}</p>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
@@ .. @@
                <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">{t('cart.products')}</h2>
                    <div className="bg-white/20 px-3 py-1 rounded-full">
                      <span className="text-sm font-medium">{cart.length} {t('cart.items')}</span>
                    </div>
                  </div>
                </div>
@@ .. @@
                            </div>

                            {/* Price per unit */}
                            <div className="text-sm text-gray-500 mb-3">
                              ¥{item.price.toLocaleString()} {t('cart.perItem')}
                            </div>

@@ .. @@
                <div className="bg-gray-50 p-6 border-t border-gray-100">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-gray-600">
                      <span className="text-lg">{t('cart.subtotal')} ({cart.reduce((sum, item) => sum + item.quantity, 0)} {t('cart.items')})</span>
                      <span className="text-lg font-semibold text-gray-800">¥{total.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-gray-800">{t('cart.shoppingTotal')}</span>
                        <span className="text-2xl font-bold text-primary">¥{total.toLocaleString()}</span>
                      </div>
                    </div>