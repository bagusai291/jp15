// Interface for daily sales data - kept for type references
export interface DailySales {
  date: string; // YYYY-MM-DD format
  totalSales: number;
  transactionCount: number;
  updatedAt: string;
  timestamp?: any; // Firestore Timestamp
}

// These functions have been deprecated as the POS feature has been removed
export const updateDailySales = async (date: string, amount: number): Promise<void> => {
  console.log('Daily sales feature has been removed');
};

export const getDailySales = async (date: string): Promise<DailySales | null> => {
  return null;
};

export const getMonthlySales = async (year: number, month: number): Promise<DailySales[]> => {
  return [];
};

export const getRecentDailySales = async (limitCount: number = 7): Promise<DailySales[]> => {
  return [];
};