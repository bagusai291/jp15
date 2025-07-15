import { useState } from 'react';
import { useAffiliate, AffiliateProvider } from '@/hooks/useAffiliate';
import { useLanguage } from '@/hooks/useLanguage';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ModernAffiliateStats from '@/components/affiliate/ModernAffiliateStats';
import ModernReferralLinkCard from '@/components/affiliate/ModernReferralLinkCard';
import ModernPayoutRequestForm from '@/components/affiliate/ModernPayoutRequestForm';
import AffiliatePerformanceChart from '@/components/affiliate/AffiliatePerformanceChart';
import ModernReferralsTable from '@/components/affiliate/ModernReferralsTable';
import ModernCommissionsTable from '@/components/affiliate/ModernCommissionsTable';
import ModernFollowersTable from '@/components/affiliate/ModernFollowersTable';
import ModernPayoutsTable from '@/components/affiliate/ModernPayoutsTable';
import AffiliatePromotionMaterials from '@/components/affiliate/AffiliatePromotionMaterials';
import AffiliateFAQ from '@/components/affiliate/AffiliateFAQ';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import JoinAffiliateCard from '@/components/affiliate/JoinAffiliateCard';
import { useEffect } from 'react';

const AffiliateContent = () => {
  const { affiliate, loading } = useAffiliate();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Enhanced scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // If not an affiliate yet, show join card
  if (!affiliate && !loading) {
    return <JoinAffiliateCard />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('affiliate.dashboard')}</h1>
          <p className="text-gray-600">Kelola program affiliate Anda dan pantau performa</p>
        </div>
        
        {/* Stats Overview */}
        <div className="mb-8">
          <ModernAffiliateStats />
        </div>
        
        {/* Main Tabs */}
        <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
          </TabsList>
          
          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ModernReferralLinkCard />
              <ModernPayoutRequestForm />
            </div>
            <AffiliatePerformanceChart />
          </TabsContent>
          
          {/* Referrals Tab */}
          <TabsContent value="referrals">
            <div className="space-y-8">
              <ModernReferralsTable />
              <ModernFollowersTable />
            </div>
          </TabsContent>
          
          {/* Commissions Tab */}
          <TabsContent value="commissions">
            <ModernCommissionsTable />
          </TabsContent>
          
          {/* Payouts Tab */}
          <TabsContent value="payouts">
            <ModernPayoutsTable />
          </TabsContent>
          
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

const Referral = () => {
  return (
    <AffiliateProvider>
      <AffiliateContent />
    </AffiliateProvider>
  );
};

export default Referral;