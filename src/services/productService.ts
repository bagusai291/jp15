import { 
  collection, 
  getDocs, 
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { db, storage, auth } from '@/config/firebase';
import { Product, RecycleBinItem } from '@/types';
import { mapLegacyCategory } from '@/utils/categoryVariants';

const PRODUCTS_COLLECTION = 'products';
const RECYCLE_BIN_COLLECTION = 'recycle_bin';
const STORAGE_FOLDER = 'product-images';

export const getCategories = async (): Promise<string[]> => {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const snapshot = await getDocs(productsRef);
    
    const categories = new Set<string>();
    snapshot.docs.forEach(doc => {
      const product = doc.data() as Product;
      if (product.category) {
        // Map legacy categories to new simplified categories
        const mappedCategory = mapLegacyCategory(product.category);
        categories.add(mappedCategory);
      }
    });
    
    return Array.from(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const getProductsByCategory = async (category: string) => {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(
      productsRef,
      where('category', '==', category),
      orderBy('created_at', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Product));
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
};

export const searchProducts = async (searchTerm: string) => {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const snapshot = await getDocs(productsRef);
    
    // Firebase doesn't support full-text search natively, so we filter on client
    const products = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Product))
      .filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    return products;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(productsRef, orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Ensure backwards compatibility with image_url field
        image_url: Array.isArray(data.images) && data.images.length > 0 
          ? data.images[0] 
          : data.image_url || '/placeholder.svg'
      } as Product;
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const uploadProductImages = async (files: File[]): Promise<string[]> => {
  try {
    console.log('Starting image upload process, files count:', files.length);
    
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const storageRef = ref(storage, `${STORAGE_FOLDER}/${fileName}`);
      
      console.log('Uploading file:', fileName);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      console.log('File uploaded successfully:', downloadURL);
      
      return downloadURL;
    });

    const results = await Promise.all(uploadPromises);
    console.log('All images uploaded successfully:', results);
    return results;
  } catch (error) {
    console.error('Error uploading images:', error);
    throw error;
  }
};

export const addProduct = async (product: Omit<Product, 'id'>) => {
  try {
    console.log('Adding product to Firestore:', product);
    console.log('Current user:', auth.currentUser?.uid);
    
    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }
    
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const docRef = await addDoc(productsRef, {
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      images: product.images || [],
      variants: product.variants || [],
      stock: product.stock,
      status: product.status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    console.log('Product added successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

export const updateProduct = async (id: string, updates: Partial<Product>) => {
  try {
    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }
    
    const productRef = doc(db, PRODUCTS_COLLECTION, id);
    await updateDoc(productRef, {
      ...updates,
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const moveProductToRecycleBin = async (product: Product) => {
  try {
    console.log('Moving product to recycle bin:', product.id);
    console.log('Current user:', auth.currentUser?.uid);
    
    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }
    
    // Add to recycle bin collection
    const recycleBinRef = collection(db, RECYCLE_BIN_COLLECTION);
    await addDoc(recycleBinRef, {
      original_table: 'products',
      original_id: product.id,
      data: product,
      deleted_at: new Date().toISOString()
    });
    
    // Delete from products collection
    const productRef = doc(db, PRODUCTS_COLLECTION, product.id);
    await deleteDoc(productRef);
    
    console.log('Product moved to recycle bin successfully');
  } catch (error) {
    console.error('Error moving product to recycle bin:', error);
    throw error;
  }
};

export const getRecycleBinItems = async (): Promise<RecycleBinItem[]> => {
  try {
    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }
    
    const recycleBinRef = collection(db, RECYCLE_BIN_COLLECTION);
    const q = query(recycleBinRef, orderBy('deleted_at', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      original_table: doc.data().original_table,
      original_id: doc.data().original_id,
      data: doc.data().data,
      deleted_at: doc.data().deleted_at
    })) as RecycleBinItem[];
  } catch (error) {
    console.error('Error fetching recycle bin items:', error);
    throw error;
  }
};

export const restoreFromRecycleBin = async (recycleBinItem: any) => {
  try {
    console.log('Restoring item from recycle bin:', recycleBinItem.id);
    console.log('Current user:', auth.currentUser?.uid);
    
    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }
    
    // Add back to original collection
    if (recycleBinItem.original_table === 'products') {
      const productsRef = collection(db, PRODUCTS_COLLECTION);
      await addDoc(productsRef, {
        ...recycleBinItem.data,
        updated_at: new Date().toISOString()
      });
    }
    
    // Remove from recycle bin
    const recycleBinRef = doc(db, RECYCLE_BIN_COLLECTION, recycleBinItem.id);
    await deleteDoc(recycleBinRef);
    
    console.log('Item restored successfully');
  } catch (error) {
    console.error('Error restoring item from recycle bin:', error);
    throw error;
  }
};

export const deleteProduct = async (id: string) => {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, id);
    await deleteDoc(productRef);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

export const getProduct = async (id: string): Promise<Product | null> => {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, id);
    try {
      const snapshot = await getDoc(productRef);
      
      if (snapshot.exists()) {
        const data = snapshot.data();
        return { 
          id: snapshot.id, 
          ...data,
          // Ensure backwards compatibility with image_url field
          image_url: Array.isArray(data.images) && data.images.length > 0 
            ? data.images[0] 
            : data.image_url || '/placeholder.svg'
        } as Product;
      }
      return null;
    } catch (innerError) {
      console.error(`Error fetching product ${id}:`, innerError);
      return null;
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
};