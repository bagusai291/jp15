
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addProduct } from '@/services/productService';
import { Product } from '@/types';

export const useAddProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (product: Omit<Product, 'id'>) => addProduct(product),
    onSuccess: () => {
      // Invalidate products query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
