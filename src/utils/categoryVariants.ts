// Import language hook
import { useLanguage } from '@/hooks/useLanguage';

// Definisi kategori dan varian yang disederhanakan
export const categoryVariants = {
  'Makanan Ringan': {
    icon: '🍿',
    variants: {
      'rasa': {
        name: 'Rasa',
        options: ['Original', 'Pedas', 'BBQ', 'Keju', 'Balado'],
        required: true
      },
      'ukuran': {
        name: 'Ukuran',
        options: ['100g', '200g', '500g'],
        required: true
      }
    }
  },
  'Bumbu Dapur': {
    icon: '🌶️',
    variants: {
      'level': {
        name: 'Level Pedas',
        options: ['Level 10', 'Level 30', 'Level 50'],
        required: true
      },
      'ukuran': {
        name: 'Ukuran',
        options: ['40g', '80g', '160g'],
        required: true
      }
    }
  },
  'Makanan Siap Saji': {
    icon: '🍜',
    variants: {
      'porsi': {
        name: 'Porsi',
        options: ['1 Porsi', '2 Porsi', 'Family'],
        required: true
      },
      'level': {
        name: 'Level Pedas',
        options: ['Tidak Pedas', 'Sedang', 'Pedas'],
        required: false
      }
    }
  },
  'Bahan Masak Beku': {
    icon: '🧊',
    variants: {
      'jenis': {
        name: 'Jenis',
        options: ['Daging Sapi', 'Daging Ayam', 'Seafood', 'Nugget'],
        required: true
      },
      'ukuran': {
        name: 'Ukuran',
        options: ['250g', '500g', '1kg'],
        required: true
      }
    }
  },
  'Sayur & Bumbu': {
    icon: '🥬',
    variants: {
      'jenis': {
        name: 'Jenis',
        options: ['Bayam', 'Kangkung', 'Sawi', 'Kemangi', 'Daun Singkong'],
        required: true
      },
      'kondisi': {
        name: 'Kondisi',
        options: ['Segar', 'Beku'],
        required: true
      },
      'ukuran': {
        name: 'Ukuran',
        options: ['250g', '500g'],
        required: true
      }
    }
  },
  'Kerupuk': {
    icon: '🍃',
    variants: {
      'rasa': {
        name: 'Rasa',
        options: ['Original', 'Pedas', 'Udang', 'Ikan'],
        required: true
      },
      'ukuran': {
        name: 'Ukuran',
        options: ['100g', '250g', '500g'],
        required: true
      }
    }
  }
};

// Fungsi untuk mendapatkan varian berdasarkan kategori
export const getVariantsByCategory = (category: string) => {
  return categoryVariants[category]?.variants || {};
};

// Fungsi untuk mendapatkan semua kategori yang memiliki varian
export const getCategoriesWithVariants = () => {
  return Object.keys(categoryVariants);
};

// Fungsi untuk mendapatkan icon kategori
export const getCategoryIcon = (category: string) => {
  return categoryVariants[category]?.icon || '📦';
};

// Fungsi untuk memvalidasi varian yang dipilih
export const validateSelectedVariants = (category: string, selectedVariants: Record<string, string>) => {
  const categoryData = categoryVariants[category];
  if (!categoryData) return true;

  const requiredVariants = Object.entries(categoryData.variants)
    .filter(([_, variantData]) => variantData.required)
    .map(([variantKey]) => variantKey);

  return requiredVariants.every(variantKey => selectedVariants[variantKey]);
};

// Fungsi untuk generate nama varian yang simpel dan rapi
export const generateVariantName = (category: string, selectedVariants: Record<string, string>) => {
  if (!selectedVariants || Object.keys(selectedVariants).length === 0) return null;

  // Filter out empty values
  const selectedValues = Object.values(selectedVariants).filter(v => v && v.trim());
  
  if (selectedValues.length === 0) return null;

  // Create simple variant name by joining selected values
  return selectedValues.join(' - ');
};

// Fungsi untuk mendapatkan nama kategori yang sudah digunakan di database
export const mapLegacyCategory = (category: string): string => {
  const categoryMapping = {
    'Sayur Segar/Beku': 'Sayur & Bumbu',
    'Sayur Beku': 'Sayur & Bumbu',
    'Bon Cabe': 'Bumbu Dapur'
  };
  
  return categoryMapping[category] || category;
};

// Function to convert category name to URL path
export const getCategoryUrlPath = (category: string): string => {
  const pathMapping = {
    'Sayur & Bumbu': 'sayur-bumbu',
    'Bahan Masak Beku': 'bahan-masak-beku',
    'Kerupuk': 'kerupuk',
    'Makanan Ringan': 'makanan-ringan',
    'Bumbu Dapur': 'bumbu-dapur',
    'Makanan Siap Saji': 'makanan-siap-saji',
    'Sayur & Bahan Segar': 'sayur-bahan-segar'
  };
  
  return pathMapping[category] || category.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'dan');
};

// Function to translate category names based on current language
export const getCategoryTranslation = (category: string, language: string): string => {
  // Map of Indonesian category names to English translations
  const categoryTranslations: Record<string, string> = {
    'Makanan Ringan': 'Snacks',
    'Bumbu Dapur': 'Cooking Spices',
    'Makanan Siap Saji': 'Ready-to-Eat Food',
    'Bahan Masak Beku': 'Frozen Cooking Ingredients',
    'Sayur & Bumbu': 'Vegetables & Spices',
    'Kerupuk': 'Crackers',
    'Sayur & Bahan Segar': 'Fresh Vegetables & Ingredients',
    'Sayur Beku': 'Frozen Vegetables',
    'Sayur Segar/Beku': 'Fresh/Frozen Vegetables',
    'Bon Cabe': 'Bon Cabe Chili Flakes'
  };
  
  // Return translated category name if language is English and translation exists
  if (language === 'en' && categoryTranslations[category]) {
    return categoryTranslations[category];
  }
  
  // Return original category name if no translation exists or language is Indonesian
  return category;
};