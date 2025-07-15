import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

const ErrorState = ({ 
  title = "Terjadi Kesalahan", 
  message = "Tidak dapat memuat data. Silakan coba lagi nanti.",
  onRetry
}: ErrorStateProps) => {
  return (
    <Card>
      <CardContent className="py-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 mb-4">
          {message}
        </p>
        {onRetry && (
          <Button 
            onClick={onRetry}
            variant="outline"
          >
            Coba Lagi
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ErrorState;