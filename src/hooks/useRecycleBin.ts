
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRecycleBinItems, restoreFromRecycleBin, moveProductToRecycleBin } from '@/services/productService';
import { RecycleBinItem, Product } from '@/types';

export const useRecycleBin = () => {
  return useQuery<RecycleBinItem[]>({
    queryKey: ['recycle-bin'],
    queryFn: getRecycleBinItems,
  });
};

export const useMoveToRecycleBin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      table: string;
      itemId: string;
      itemData: Product;
    }) => {
      if (data.table === 'products') {
        await moveProductToRecycleBin(data.itemData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recycle-bin'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useRestoreFromRecycleBin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restoreFromRecycleBin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recycle-bin'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
