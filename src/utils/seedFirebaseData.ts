import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';

const sampleProducts = [
  {
    name: 'Kerupuk Seblak Kering',
    description: 'Kerupuk seblak kering dengan rasa pedas yang autentik',
    price: 800,
    category: 'Makanan Ringan',
    image_url: '/placeholder.svg',
    stock: 50,
    status: 'active',
    variants: [
      {
        id: '1',
        name: 'KERUPUK SEBLAK ORIGINAL 100G',
        price: 800,
        stock: 25,
        rawSelections: { rasa: 'Original', ukuran: '100g' }
      },
      {
        id: '2', 
        name: 'KERUPUK SEBLAK PEDAS 100G',
        price: 850,
        stock: 20,
        rawSelections: { rasa: 'Pedas', ukuran: '100g' }
      },
      {
        id: '3',
        name: 'KERUPUK SEBLAK ORIGINAL 200G', 
        price: 1500,
        stock: 15,
        rawSelections: { rasa: 'Original', ukuran: '200g' }
      }
    ]
  },
  {
    name: 'BASRENG PEDAS/ORIGINAL',
    description: 'CAMILAN FAVORIT WARGA +62 DI JEPANG! Basreng crispy rasa PEDAS & ORIGINAL - bikin susah berhenti ngunyah!...',
    price: 800,
    category: 'Makanan Ringan',
    image_url: '/placeholder.svg',
    stock: 30,
    status: 'active',
    variants: [
      {
        id: '1',
        name: 'BASRENG PEDAS 250 GRAM',
        price: 800,
        stock: 15,
        rawSelections: { rasa: 'Pedas', ukuran: '250g' }
      },
      {
        id: '2',
        name: 'BASRENG PEDAS 500 GRAM',
        price: 1500,
        stock: 10,
        rawSelections: { rasa: 'Pedas', ukuran: '500g' }
      },
      {
        id: '3',
        name: 'BASRENG PEDAS 1 KG',
        price: 3000,
        stock: 5,
        rawSelections: { rasa: 'Pedas', ukuran: '1kg' }
      },
      {
        id: '4',
        name: 'BASRENG ORIGINAL 250 GRAM',
        price: 800,
        stock: 15,
        rawSelections: { rasa: 'Original', ukuran: '250g' }
      },
      {
        id: '5',
        name: 'BASRENG ORIGINAL 500 GRAM',
        price: 1500,
        stock: 10,
        rawSelections: { rasa: 'Original', ukuran: '500g' }
      },
      {
        id: '6',
        name: 'BASRENG ORIGINAL 1 KG',
        price: 3000,
        stock: 8,
        rawSelections: { rasa: 'Original', ukuran: '1kg' }
      }
    ]
  },
  {
    name: 'Bon Cabe Level 50',
    description: 'Bumbu cabai level pedas maksimal untuk masakan Indonesia',
    price: 600,
    category: 'Bumbu Dapur',
    image_url: '/placeholder.svg',
    stock: 30,
    status: 'active',
    variants: [
      {
        id: '1',
        name: 'BON CABE LEVEL 50 - 40G',
        price: 600,
        stock: 15,
        rawSelections: { level: 'Level 50', ukuran: '40g' }
      },
      {
        id: '2',
        name: 'BON CABE LEVEL 50 - 80G',
        price: 800,
        stock: 10,
        rawSelections: { level: 'Level 50', ukuran: '80g' }
      }
    ]
  },
  {
    name: 'Bon Cabe Level 10 & 30',
    description: 'Bumbu cabai dengan pilihan level pedas sedang',
    price: 500,
    category: 'Bumbu Dapur',
    image_url: '/placeholder.svg',
    stock: 40,
    status: 'active',
    variants: [
      {
        id: '1',
        name: 'BON CABE LEVEL 10 - 40G',
        price: 500,
        stock: 20,
        rawSelections: { level: 'Level 10', ukuran: '40g' }
      },
      {
        id: '2',
        name: 'BON CABE LEVEL 30 - 40G',
        price: 550,
        stock: 15,
        rawSelections: { level: 'Level 30', ukuran: '40g' }
      },
      {
        id: '3',
        name: 'BON CABE LEVEL 10 - 80G',
        price: 650,
        stock: 5,
        rawSelections: { level: 'Level 10', ukuran: '80g' }
      }
    ]
  },
  // Add a product without variants for testing
  {
    name: 'fdff',
    description: 'wdf',
    price: 313,
    category: 'Makanan Ringan',
    image_url: '/placeholder.svg',
    stock: 12,
    status: 'active',
    variants: [] // No variants
  }
];

export const seedFirebaseData = async () => {
  try {
    console.log('Starting Firebase data seeding...');
    
    // Check if products already exist
    const productsRef = collection(db, 'products');
    const existingProducts = await getDocs(productsRef);
    
    if (existingProducts.size > 0) {
      console.log('Products already exist, skipping seed');
      return;
    }
    
    // Add sample products with variants
    for (const product of sampleProducts) {
      await addDoc(productsRef, {
        ...product,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    
    console.log('Firebase data seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding Firebase data:', error);
    throw error;
  }
};