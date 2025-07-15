
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useFirebaseAuth';
import { getFirestore, doc, setDoc, updateDoc, collection } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';

export const useConfirmOrder = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const db = getFirestore();

  const mutation = useMutation({
    mutationFn: async (orderData: {
      user_id: string;
      user_email: string;
      customer_name: string;
      customer_email: string;
      customer_phone: string;
      customer_address: string;
      notes: string;
      items: any[];
      total_amount: number;
      status: string;
    }) => {
      if (!user?.uid) {
        throw new Error('User authentication required');
      }

      // Create order document in Firebase
      const orderRef = doc(collection(db, 'orders'));
      const orderDoc = {
        id: orderRef.id,
        user_id: orderData.user_id,
        user_email: orderData.user_email,
        customer_info: {
          name: orderData.customer_name,
          email: orderData.customer_email,
          phone: orderData.customer_phone,
          address: orderData.customer_address,
          notes: orderData.notes
        },
        items: orderData.items,
        total_amount: orderData.total_amount,
        status: orderData.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await setDoc(orderRef, orderDoc);

      toast({
        title: "Order Placed Successfully!",
        description: "Your order has been submitted and is being processed.",
      });

      return orderDoc;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      console.error('Order submission failed:', error);
      toast({
        title: "Order Failed",
        description: "There was an error placing your order. Please try again.",
        variant: "destructive",
      });
    }
  });

  return {
    mutate: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error
  };
};
