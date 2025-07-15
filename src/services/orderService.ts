import { 
  collection, 
  getDocs, 
  query, 
  orderBy,
  where,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Order } from '@/types';
import { createOrUpdateAffiliateUser, getAffiliateByReferralCode, createOrderWithReferral } from '@/services/affiliateService';

const ORDERS_COLLECTION = 'orders';

export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const q = query(ordersRef, orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Order));
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const getOrdersByUser = async (userId: string): Promise<Order[]> => {
  try {
    try {
      if (!userId) {
        console.log('No userId provided, returning empty array');
        return [];
      }
  
      console.log('Fetching orders for user:', userId);
      
      const ordersRef = collection(db, ORDERS_COLLECTION);
      
      // Simplified query without orderBy to avoid index issues
      const q = query(
        ordersRef, 
        where('user_id', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      
      // Sort manually on client side to avoid Firebase index requirements
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order)).sort((a, b) => {
        // Sort by created_at descending (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  
      console.log(`Found ${orders.length} orders for user ${userId}`);
      return orders;
    } catch (innerError) {
      console.error('Inner error fetching user orders:', innerError);
      return [];
    }
  } catch (error) {
    console.error('Error fetching user orders:', error);
    // Return empty array instead of throwing to prevent app crash
    return [];
  }
};

export const getPendingOrders = async (): Promise<Order[]> => {
  try {
    try {
      const ordersRef = collection(db, ORDERS_COLLECTION);
      
      // Simplified query without orderBy to avoid index issues
      const q = query(
        ordersRef,
        where('status', '==', 'pending')
      );
      
      const snapshot = await getDocs(q);
      
      // Sort manually on client side
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order)).sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      return orders;
    } catch (innerError) {
      console.error('Inner error fetching pending orders:', innerError);
      return [];
    }
  } catch (error) {
    console.error('Error fetching pending orders:', error);
    return [];
  }
};

export const getPendingPaymentOrders = async (): Promise<Order[]> => {
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    
    // Query for orders with pending payment status
    const q = query(
      ordersRef,
      where('payment_status', '==', 'pending')
    );
    
    const snapshot = await getDocs(q);
    
    // Sort manually on client side
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Order)).sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    
    return orders;
  } catch (error) {
    console.error('Error fetching pending payment orders:', error);
    throw error;
  }
};

export const createOrder = async (orderData: {
  user_id?: string;
  customer_info: {
    name: string;
    email: string;
    prefecture: string;
    postal_code: string;
    address: string;
    phone: string;
    notes?: string;
    payment_method?: string;
  };
  items: any[];
  total_price: number;
  status?: string;
  shipping_fee?: number;
  payment_proof_url?: string;
  affiliate_id?: string;
  visitor_id?: string;
}) => {
  try {
    console.log('Creating order with data:', orderData);
    
    // Ensure we're not passing undefined values to Firestore
    const sanitizedOrderData = {
      ...orderData,
      user_id: orderData.user_id || null, // Convert undefined to null
      shipping_fee: orderData.shipping_fee || 0,
      payment_proof_url: orderData.payment_proof_url || null,
      affiliate_id: orderData.affiliate_id || null,
      visitor_id: orderData.visitor_id || null
    };
    
    // Get affiliate_id from localStorage if not provided
    const storedAffiliateId = localStorage.getItem('referralCode');
    const affiliate_id = sanitizedOrderData.affiliate_id || storedAffiliateId || null;
    
    console.log('Using affiliate_id for order:', affiliate_id);
    
    const timestamp = new Date().toISOString();
    
    // Set payment status based on payment method
    let payment_status = 'pending';
    if (sanitizedOrderData.customer_info.payment_method === 'COD (Cash on Delivery)') {
      payment_status = 'verified'; // COD doesn't need verification
    }
    
    const orderDoc = {
      user_id: sanitizedOrderData.user_id,
      customer_info: sanitizedOrderData.customer_info,
      items: sanitizedOrderData.items,
      total_price: sanitizedOrderData.total_price,
      status: sanitizedOrderData.status || 'pending',
      payment_status: payment_status,
      shipping_fee: sanitizedOrderData.shipping_fee,
      payment_proof_url: sanitizedOrderData.payment_proof_url,
      affiliate_id: affiliate_id,
      visitor_id: sanitizedOrderData.visitor_id,
      created_at: timestamp,
      updated_at: timestamp
    };
    
    // Create the order document
    const ordersRef = collection(db, ORDERS_COLLECTION);
    // Add error handling for the addDoc operation
    let docRef;
    try {
      docRef = await addDoc(ordersRef, orderDoc);
    } catch (addDocError) {
      console.error('Error adding order document:', addDocError);
      throw new Error(`Failed to create order: ${addDocError.message}`);
    }
    
    console.log('Order created successfully with ID:', docRef.id);
    
    // Process affiliate commission if applicable
    if (affiliate_id && sanitizedOrderData.user_id) {
      try {
        // Process the affiliate commission
        await createOrderWithReferral(
          sanitizedOrderData.user_id,
          docRef.id,
          sanitizedOrderData.total_price,
          affiliate_id
        );
        console.log('Affiliate commission processed for order:', docRef.id);
      } catch (affiliateError) {
        console.error('Error processing affiliate commission:', affiliateError);
        // Don't fail the order creation if affiliate processing fails
      }
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const updateOrderStatus = async (
  orderId: string, 
  status: string, 
  paymentStatus?: string
) => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    const updateData: any = {
      status: status,
      updated_at: new Date().toISOString()
    };
    
    // Update payment status if provided
    if (paymentStatus) {
      updateData.payment_status = paymentStatus;
    }
    
    await updateDoc(orderRef, updateData);
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const updatePaymentProof = async (orderId: string, paymentProofUrl: string) => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, {
      payment_proof_url: paymentProofUrl,
      payment_status: 'pending', // Set to pending for verification
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating payment proof:', error);
    throw error;
  }
};

export const getOrder = async (id: string): Promise<Order | null> => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, id);
    const snapshot = await getDoc(orderRef);
    
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as Order;
    }
    return null;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};