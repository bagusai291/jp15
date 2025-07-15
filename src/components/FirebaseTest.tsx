
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllProducts } from '@/services/productService';

const FirebaseTest = () => {
  const [testResult, setTestResult] = useState<string>('');
  const { user } = useAuth();

  const testFirebaseConnection = async () => {
    try {
      setTestResult('Testing Firebase connection...');
      
      // Test basic connection by fetching products
      const products = await getAllProducts();
      
      setTestResult(`✅ Firebase connection successful! Found ${products.length} products`);
    } catch (error) {
      console.error('Firebase test error:', error);
      setTestResult(`❌ Test failed: ${error}`);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Firebase Connection Test</CardTitle>
        <CardDescription>
          Test the connection to Firebase database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {user && (
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              ✅ User authenticated: {user.email}
            </p>
          </div>
        )}
        
        <Button onClick={testFirebaseConnection} className="w-full">
          Test Connection
        </Button>
        
        {testResult && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-mono">{testResult}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FirebaseTest;
