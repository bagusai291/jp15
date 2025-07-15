import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Product } from '@/types';

export const useInventoryMonitoring = (lowStockThreshold = 10) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, orderBy('stock', 'asc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const productData: Product[] = [];
        const lowStock: Product[] = [];
        const outOfStock: Product[] = [];
        
        snapshot.forEach((doc) => {
          const product = {
            id: doc.id,
            ...doc.data()
          } as Product;
          
          productData.push(product);
          
          if (product.stock === 0) {
            outOfStock.push(product);
          } else if (product.stock <= lowStockThreshold) {
            lowStock.push(product);
          }
        });
        
        setProducts(productData);
        setLowStockProducts(lowStock);
        setOutOfStockProducts(outOfStock);
        setLoading(false);
      }, (err) => {
        console.error('Error monitoring inventory:', err);
        setError(err instanceof Error ? err : new Error('Failed to monitor inventory'));
        setLoading(false);
      });
      
      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up inventory monitoring:', err);
      setError(err instanceof Error ? err : new Error('Failed to set up inventory monitoring'));
      setLoading(false);
    }
  }, [lowStockThreshold]);

  return {
    products,
    lowStockProducts,
    outOfStockProducts,
    loading,
    error
  };
};