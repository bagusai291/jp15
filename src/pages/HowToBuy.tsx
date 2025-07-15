import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const HowToBuy = () => {
  const { t } = useLanguage();
  
  // Enhanced scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const steps = [
    {
      number: 1,
      icon: '🛒',
      title: 'Pilih Produk',
      description: 'Jelajahi produk favoritmu dari katalog makanan Indonesia kami',
      details: 'Gunakan fitur pencarian atau filter kategori untuk menemukan produk yang kamu inginkan dengan mudah.'
    },
    {
      number: 2,
      icon: '➕',
      title: 'Tambahkan ke Keranjang',
      description: 'Klik tombol "Tambahkan ke Keranjang" pada produk pilihan',
      details: 'Atur jumlah produk yang diinginkan, lalu tambahkan ke keranjang belanja.'
    },
    {
      number: 3,
      icon: '📝',
      title: 'Isi Data Pengiriman',
      description: 'Lengkapi informasi nama, alamat, kode pos, dan nomor HP',
      details: 'Pastikan data yang dimasukkan benar dan lengkap agar pengiriman bisa sampai dengan tepat.'
    },
    {
      number: 4,
      icon: '📲',
      title: 'Checkout via WhatsApp',
      description: 'Klik tombol "Checkout via WhatsApp" untuk menyelesaikan pesanan',
      details: 'Pesanan akan dikirim otomatis ke WhatsApp kami dengan detail lengkap pembelian.'
    },
    {
      number: 5,
      icon: '📦',
      title: 'Admin Proses & Kirim',
      description: 'Tim kami akan memproses dan mengirim pesanan ke alamat tujuan',
      details: 'Kamu akan mendapat konfirmasi dan informasi tracking melalui WhatsApp.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">{t('howToBuy.title')}</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('howToBuy.subtitle')}</p>
        </div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto mb-16">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-6 top-20 w-0.5 h-20 bg-gray-300 hidden md:block"></div>
              )}
              
              <div className="flex flex-col md:flex-row items-start md:items-center mb-12 bg-white p-6 rounded-lg shadow-md">
                {/* Step Number & Icon */}
                <div className="flex items-center mb-4 md:mb-0 md:mr-6">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg mr-4">
                    {step.number}
                  </div>
                  <div className="text-4xl">{step.icon}</div>
                </div>
                
                {/* Step Content */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t(`howToBuy.steps.step${step.number}.title`)}</h3>
                  <p className="text-gray-700 mb-3">{t(`howToBuy.steps.step${step.number}.description`)}</p>
                  <p className="text-sm text-gray-600">{t(`howToBuy.steps.step${step.number}.details`)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">{t('howToBuy.faq.title')}</h2>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-2">❓ {t('howToBuy.faq.q1')}</h3>
              <p className="text-gray-600">{t('howToBuy.faq.a1')}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-2">🚚 {t('howToBuy.faq.q2')}</h3>
              <p className="text-gray-600">{t('howToBuy.faq.a2')}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-2">💳 {t('howToBuy.faq.q3')}</h3>
              <p className="text-gray-600">{t('howToBuy.faq.a3')}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-2">📞 {t('howToBuy.faq.q4')}</h3>
              <p className="text-gray-600">{t('howToBuy.faq.a4')}</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-accent text-white p-12 rounded-lg">
          <h2 className="text-3xl font-bold mb-4">{t('howToBuy.cta.title')}</h2>
          <p className="text-xl mb-8">{t('howToBuy.cta.description')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="bg-white text-accent hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105"
            >
              {t('howToBuy.cta.shopNow')}
            </Link>
            <a
              href="https://wa.me/817084894699"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105"
            >
              {t('howToBuy.cta.contactUs')}
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HowToBuy;
