
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { seedFirebaseData } from '@/utils/seedFirebaseData';

const SeedDataButton = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      await seedFirebaseData();
      toast({
        title: "Success!",
        description: "Data berhasil di-seed ke Firebase",
      });
    } catch (error) {
      console.error('Seeding error:', error);
      toast({
        title: "Error",
        description: "Gagal melakukan seeding data: " + error,
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Button 
      onClick={handleSeedData} 
      disabled={isSeeding}
      className="bg-green-600 hover:bg-green-700"
    >
      {isSeeding ? 'Sedang Seeding...' : 'Seed Sample Data'}
    </Button>
  );
};

export default SeedDataButton;
