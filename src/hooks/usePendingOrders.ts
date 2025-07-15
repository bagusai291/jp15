import { useQuery } from '@tanstack/react-query';
import { getPendingOrders } from '@/services/orderService';

export const usePendingOrders = () => {
  return useQuery({
    queryKey: ['pending-orders'],
    queryFn: getPendingOrders,
    staleTime: 3 * 60 * 1000, // 3 minutes
    refetchInterval: 3 * 60 * 1000, // Refetch every 3 minutes
    refetchIntervalInBackground: false, // Don't refetch when tab is not active
    refetchOnWindowFocus: false,
  });
};