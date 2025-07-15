import React from 'react';
import { Package, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  actionText?: string;
  actionLink?: string;
  onAction?: () => void;
}

const EmptyState = ({ 
  title = "Tidak Ada Data", 
  message = "Belum ada data yang tersedia.",
  icon = <Package className="w-16 h-16 text-gray-400" />,
  actionText,
  actionLink,
  onAction
}: EmptyStateProps) => {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <div className="mx-auto mb-6">
          {icon}
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-3">
          {title}
        </h3>
        <p className="text-gray-600 mb-8">
          {message}
        </p>
        {(actionText && actionLink) && (
          <Link to={actionLink}>
            <Button className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium">
              <ShoppingBag className="w-5 h-5 mr-2" />
              {actionText}
            </Button>
          </Link>
        )}
        {(actionText && onAction) && (
          <Button 
            onClick={onAction}
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            {actionText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyState;