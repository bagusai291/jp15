import { Product, POSTransaction } from '@/types';

// This service has been deprecated as the POS feature has been removed
export const processPOSTransaction = async (transaction: Omit<POSTransaction, 'id'>) => {
  console.log('POS feature has been removed');
  return 'feature-removed';
};

// This function has been deprecated as the POS feature has been removed
export const getFinancialSummary = async (startDate: Date, endDate: Date) => {
  return {
    totalSales: 0,
    totalExpenses: 0,
    netProfit: 0,
    transactionCount: 0
  };
};