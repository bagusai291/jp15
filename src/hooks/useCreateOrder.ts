export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      items,
      totalPrice,
      customerInfo,
      userId,
      shipping_fee,
      affiliate_id
    }) => {
      try {
        return await createOrder({
          user_id: userId,
          customer_info: customerInfo,
          items: items,
          total_price: totalPrice,
          status: 'pending',
          shipping_fee: shipping_fee,
          affiliate_id: affiliate_id
        });
      } catch (error) {
        console.error('Error creating order:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['pending-orders'] });
    },
  });
};

// Define the types for the parameters
interface CreateOrderParams {
      items: CartItem[];
      totalPrice: number;
      customerInfo: CustomerInfo;
      userId?: string;
      shipping_fee?: number;
      affiliate_id?: string;
      visitor_id?: string;
}