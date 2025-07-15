import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Truck, ArrowUp, ArrowDown } from 'lucide-react';

interface FinancialSummaryCardsProps {
  revenue: number;
  expenses: number;
  profit: number;
  shippingCost: number;
  orderCount: number;
  period: string;
  isLoading: boolean;
}

const FinancialSummaryCards = ({
  revenue,
  expenses,
  profit,
  shippingCost,
  orderCount,
  period,
  isLoading
}: FinancialSummaryCardsProps) => {
  // Format currency as Yen
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const cards = [
    {
      title: 'Total Omzet',
      value: formatCurrency(revenue),
      icon: DollarSign,
      color: 'bg-blue-500',
      bgGradient: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200',
      textColor: 'text-blue-700',
      description: `Periode ${period}`
    },
    {
      title: 'Laba Bersih',
      value: formatCurrency(profit),
      icon: TrendingUp,
      color: 'bg-green-500',
      bgGradient: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200',
      textColor: 'text-green-700',
      description: profit > 0 ? (
        <span className="flex items-center">
          <ArrowUp className="w-3 h-3 mr-1" />
          Profit
        </span>
      ) : (
        <span className="flex items-center">
          <ArrowDown className="w-3 h-3 mr-1" />
          Loss
        </span>
      )
    },
    {
      title: 'Biaya Pengiriman',
      value: formatCurrency(shippingCost),
      icon: Truck,
      color: 'bg-purple-500',
      bgGradient: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200',
      textColor: 'text-purple-700',
      description: `${orderCount} pesanan`
    },
    {
      title: 'Total Pengeluaran',
      value: formatCurrency(expenses),
      icon: ShoppingCart,
      color: 'bg-red-500',
      bgGradient: 'bg-gradient-to-br from-red-50 to-red-100 border-red-200',
      textColor: 'text-red-700',
      description: `Periode ${period}`
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-5 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className={card.bgGradient}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-sm font-medium ${card.textColor} flex items-center`}>
                <Icon className="w-4 h-4 mr-2" />
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${card.textColor}`}>{card.value}</div>
              <p className={`text-sm ${card.textColor.replace('700', '600')} mt-1`}>
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default FinancialSummaryCards;