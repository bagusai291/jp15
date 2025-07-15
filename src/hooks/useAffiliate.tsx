import { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from '@/hooks/useFirebaseAuth';
import { toast } from '@/hooks/use-toast';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { 
  createOrUpdateAffiliateUser,
  getAffiliateUser,
  subscribeToAffiliateStats,
  subscribeToAffiliateReferrals,
  subscribeToAffiliateCommissions,
  subscribeToAffiliatePayouts,
  getAffiliateFollowers,
  updateAffiliateBankInfo,
  requestPayout,
  getAffiliateSettings
} from '@/services/affiliateService';
import { 
  AffiliateUser, 
  AffiliateReferral, 
  AffiliateCommission, 
  AffiliateSettings,
  AffiliateFollower,
  AffiliatePayout
} from '@/types/affiliate';

interface AffiliateContextType {
  affiliate: AffiliateUser | null;
  loading: boolean;
  error: string | null;
  referrals: AffiliateReferral[];
  commissions: AffiliateCommission[];
  payouts: AffiliatePayout[];
  followers: AffiliateFollower[];
  settings: AffiliateSettings | null;
  joinAffiliate: () => Promise<void>;
  updateBankInfo: (bankInfo: { bankName: string; accountNumber: string; accountName: string }) => Promise<void>;
  requestPayout: (amount: number, method: string, bankInfo?: any) => Promise<string>;
  copyReferralLink: () => void;
  referralLink: string;
}

const AffiliateContext = createContext<AffiliateContextType | undefined>(undefined);

export const AffiliateProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [affiliate, setAffiliate] = useState<AffiliateUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<AffiliateReferral[]>([]);
  const [commissions, setCommissions] = useState<AffiliateCommission[]>([]);
  const [payouts, setPayouts] = useState<AffiliatePayout[]>([]);
  const [followers, setFollowers] = useState<AffiliateFollower[]>([]);
  const [settings, setSettings] = useState<AffiliateSettings | null>(null);

  // Debug logging for component state
  useEffect(() => {
    console.log('useAffiliate state:', {
      affiliateId: affiliate?.id,
      referralsCount: referrals.length,
      commissionsCount: commissions.length,
      payoutsCount: payouts.length,
      followersCount: followers.length
    });
  }, [affiliate, referrals, commissions, payouts, followers]);

  // Debug logging
  useEffect(() => {
    if (user) {
      console.log('useAffiliate hook initialized with user:', {
        uid: user.uid,
        email: user.email
      });
    }
  }, [user]);

  // Generate referral link
  const referralLink = affiliate 
    ? `${window.location.origin}/?ref=${affiliate.referralCode}`
    : '';

  // Load affiliate data
  useEffect(() => {
    const loadAffiliateData = async () => {
      if (!user) {
        setAffiliate(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('Loading affiliate data for user:', user.uid, 'email:', user.email);
        
        // Get affiliate user
        const affiliateData = await getAffiliateUser(user.uid);
        console.log('Affiliate data loaded:', affiliateData);
        setAffiliate(affiliateData);
        
        // Get affiliate settings
        const settingsData = await getAffiliateSettings();
        console.log('Affiliate settings loaded:', JSON.stringify(settingsData));
        setSettings(settingsData);
        
        // Get followers if affiliate exists
        if (affiliateData) {
          console.log('Affiliate exists, fetching related data for ID:', affiliateData.id);
          
          // FORCE DIRECT DATA FETCH - Bypass any query issues
          try {
            let referralsData = [];
            // Get all referrals and filter manually
            const referralsRef = collection(db, 'affiliate_referrals');
            const referralsSnapshot = await getDocs(referralsRef);
            
            const allReferrals = referralsSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            
            console.log('Total referrals in collection:', allReferrals.length);
            if (allReferrals.length > 0) {
              console.log('Sample referral:', JSON.stringify(allReferrals[0]));
            }
            
            // Filter for this affiliate
            referralsData = allReferrals.filter(ref => ref.referrerId === affiliateData.id);
            console.log('Loaded referrals data:', referralsData.length, 'items');
            if (referralsData.length > 0) {
              console.log('First matching referral:', JSON.stringify(referralsData[0]));
            }
            setReferrals(referralsData);
          } catch (referralsError) {
            console.error('Error loading referrals data:', referralsError);
          }
          
          try {
            // Get all commissions and filter manually
            const commissionsRef = collection(db, 'affiliate_commissions');
            const commissionsSnapshot = await getDocs(commissionsRef);
            
            const allCommissions = commissionsSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            
            console.log('Total commissions in collection:', allCommissions.length);
            if (allCommissions.length > 0) {
              console.log('Sample commission:', JSON.stringify(allCommissions[0]));
            }
            
            // Filter for this affiliate
            const commissionsData = allCommissions.filter(comm => comm.affiliateId === affiliateData.id);
            console.log('Loaded commissions data:', commissionsData.length, 'items');
            if (commissionsData.length > 0) {
              console.log('First matching commission:', JSON.stringify(commissionsData[0]));
            }
            setCommissions(commissionsData);
          } catch (commissionsError) {
            console.error('Error loading commissions data:', commissionsError);
          }
          
          try {
            // Get all payouts and filter manually
            const payoutsRef = collection(db, 'affiliate_payouts');
            const payoutsSnapshot = await getDocs(payoutsRef);
            
            const allPayouts = payoutsSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            
            console.log('Total payouts in collection:', allPayouts.length);
            if (allPayouts.length > 0) {
              console.log('Sample payout:', JSON.stringify(allPayouts[0]));
            }
            
            // Filter for this affiliate
            const payoutsData = allPayouts.filter(payout => payout.affiliateId === affiliateData.id);
            console.log('Loaded payouts data:', payoutsData.length, 'items');
            if (payoutsData.length > 0) {
              console.log('First matching payout:', JSON.stringify(payoutsData[0]));
            }
            setPayouts(payoutsData);
          } catch (payoutsError) {
            console.error('Error loading payouts data:', payoutsError);
          }
          
          try {
            // Calculate followers from referrals
            const followersData = referrals
              .filter(ref => 
                (ref.status === 'registered' || ref.status === 'ordered' || 
                 ref.status === 'approved' || ref.status === 'purchased') && 
                ref.referredUserId && 
                ref.referredUserEmail
              )
              .map(ref => ({
                id: ref.id,
                affiliateId: affiliateData.id,
                userId: ref.referredUserId || '',
                email: ref.referredUserEmail || '',
                displayName: ref.referredUserName || ref.referredUserEmail?.split('@')[0] || '',
                totalOrders: ref.status === 'ordered' || ref.status === 'approved' ? 1 : 0,
                totalSpent: ref.orderTotal || 0,
                firstOrderDate: ref.orderedAt || '',
                lastOrderDate: ref.orderedAt || '',
                createdAt: ref.createdAt
              }));
            
            console.log('Calculated followers from referrals:', followersData.length, 'items');
            if (followersData.length > 0) {
              console.log('First follower:', JSON.stringify(followersData[0]));
            }
            setFollowers(followersData);
          } catch (followersError) {
            console.error('Error loading followers data:', followersError);
            // Don't fail the entire data loading if followers fail
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading affiliate data:', err);
        setError('Failed to load affiliate data');
        setLoading(false);
      }
    };

    loadAffiliateData();
  }, [user]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user || !affiliate) return;
    console.log('Setting up affiliate subscriptions for user:', user.uid, 'with affiliate ID:', affiliate.id);

    let unsubscribeStats: (() => void) | undefined;
    let unsubscribeReferrals: (() => void) | undefined;
    let unsubscribeCommissions: (() => void) | undefined;
    let unsubscribePayouts: (() => void) | undefined; 

    try {
      // Subscribe to affiliate stats
      try {
        unsubscribeStats = subscribeToAffiliateStats(
          affiliate.id,
          (updatedAffiliate) => {
            console.log('Received affiliate stats update:', {
              totalClicks: updatedAffiliate.totalClicks,
              totalReferrals: updatedAffiliate.totalReferrals,
              totalCommission: updatedAffiliate.totalCommission,
              pendingCommission: updatedAffiliate.pendingCommission
            });
            setAffiliate(updatedAffiliate);
          }
        );
      } catch (statsError) {
        console.error('Error subscribing to affiliate stats:', statsError);
        toast({
          title: "Connection Error",
          description: "Failed to connect to real-time updates for affiliate stats",
          variant: "destructive"
        });
      }

      // Subscribe to referrals
      try {
        unsubscribeReferrals = subscribeToAffiliateReferrals(
          affiliate.id,
          (updatedReferrals) => {
            console.log('Received updated referrals:', updatedReferrals.length, 'for affiliate ID:', affiliate.id);
            if (updatedReferrals.length > 0) {
              console.log('First referral:', {
                id: updatedReferrals[0].id,
                status: updatedReferrals[0].status,
                referredEmail: updatedReferrals[0].referredUserEmail
              });
            }
            setReferrals(updatedReferrals);
            
            // Update followers based on referrals with registered or purchased status
            const newFollowers = updatedReferrals
              .filter(ref => 
                (ref.status === 'registered' || ref.status === 'ordered' || 
                 ref.status === 'approved' || ref.status === 'purchased') && 
                ref.referredUserId && 
                ref.referredUserEmail
              )
              .map(ref => ({
                id: ref.id,
                affiliateId: affiliate.id,
                userId: ref.referredUserId || '',
                email: ref.referredUserEmail || '',
                displayName: ref.referredUserName || ref.referredUserEmail?.split('@')[0] || '',
                totalOrders: ref.status === 'ordered' || ref.status === 'approved' ? 1 : 0,
                totalSpent: ref.orderTotal || 0,
                firstOrderDate: ref.orderedAt || '',
                lastOrderDate: ref.orderedAt || '',
                createdAt: ref.createdAt
              } as AffiliateFollower));
            
            console.log('Calculated followers from referrals:', newFollowers);
            
            if (newFollowers.length > 0) {
              setFollowers(newFollowers);
            }
          }
        );
      } catch (referralsError) {
        console.error('Error subscribing to referrals:', referralsError);
      }

      // Subscribe to commissions
      try {
        unsubscribeCommissions = subscribeToAffiliateCommissions(
          affiliate.id,
          (updatedCommissions) => {
            console.log('Received updated commissions:', updatedCommissions.length, 'for affiliate ID:', affiliate.id);
            if (updatedCommissions.length > 0) {
              console.log('First commission:', {
                id: updatedCommissions[0].id,
                amount: updatedCommissions[0].commissionAmount,
                status: updatedCommissions[0].status
              });
            }
            setCommissions(updatedCommissions);
          }
        );
      } catch (commissionsError) {
        console.error('Error subscribing to commissions:', commissionsError);
      }

      // Subscribe to payouts
      try {
        unsubscribePayouts = subscribeToAffiliatePayouts(
          affiliate.id,
          (updatedPayouts) => {
            console.log('Received updated payouts:', updatedPayouts.length, 'for affiliate ID:', affiliate.id);
            if (updatedPayouts.length > 0) {
              console.log('First payout:', {
                id: updatedPayouts[0].id,
                amount: updatedPayouts[0].amount,
                status: updatedPayouts[0].status
              });
            }
            setPayouts(updatedPayouts);
          }
        );
      } catch (payoutsError) {
        console.error('Error subscribing to payouts:', payoutsError);
      }
    } catch (err) {
      console.error('Error setting up subscriptions:', err);
      setError('Failed to set up real-time updates');
    }

    return () => {
      if (unsubscribeStats) unsubscribeStats();
      if (unsubscribeReferrals) unsubscribeReferrals();
      if (unsubscribeCommissions) unsubscribeCommissions();
      if (unsubscribePayouts) unsubscribePayouts();
      console.log('Cleaned up affiliate subscriptions for user:', user?.uid);
    };
  }, [user, affiliate]);

  // Join affiliate program
  const joinAffiliate = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "You must be logged in to join the affiliate program",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const affiliateData = await createOrUpdateAffiliateUser(
        user.uid,
        user.email || '',
        user.displayName || user.email?.split('@')[0] || 'User'
      );
      
      setAffiliate(affiliateData);
      setLoading(false);
    } catch (err) {
      console.error('Error joining affiliate program:', err);
      setError('Failed to join affiliate program');
      setLoading(false);
    }
  };

  // Update bank info
  const updateBankInfo = async (bankInfo: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  }) => {
    if (!user || !affiliate) {
      toast({
        title: "Error",
        description: "You must be logged in and joined the affiliate program",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await updateAffiliateBankInfo(affiliate.id, bankInfo);
      
      setAffiliate({
        ...affiliate,
        bankInfo
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error updating bank info:', err);
      setError('Failed to update bank info');
      setLoading(false);
    }
  };

  // Request payout
  const requestPayoutFn = async (amount: number, method: string, bankInfo?: any) => {
    if (!user || !affiliate) {
      toast({
        title: "Error",
        description: "You must be logged in and joined the affiliate program",
        variant: "destructive"
      });
      return "";
    }

    try {
      const payoutId = await requestPayout(
        affiliate.id,
        amount,
        method,
        bankInfo || affiliate.bankInfo
      );
      
      return payoutId;
    } catch (err) {
      console.error('Error requesting payout:', err);
      throw err;
    }
  };

  // Copy referral link
  const copyReferralLink = () => {
    if (!referralLink) {
      toast({
        title: "Error",
        description: "No referral link available",
        variant: "destructive"
      });
      return;
    }

    navigator.clipboard.writeText(referralLink)
      .then(() => {
        // Success message handled by toast in component
      })
      .catch((err) => {
        console.error('Error copying referral link:', err);
        setError('Failed to copy referral link');
      });
  };

  return (
    <AffiliateContext.Provider
      value={{
        affiliate,
        loading,
        error,
        referrals,
        commissions,
        payouts,
        followers,
        settings,
        joinAffiliate,
        updateBankInfo,
        requestPayout: requestPayoutFn,
        copyReferralLink,
        referralLink
      }}
    >
      {children}
    </AffiliateContext.Provider>
  );
};

export const useAffiliate = () => {
  const context = useContext(AffiliateContext);
  if (context === undefined) {
    throw new Error('useAffiliate must be used within an AffiliateProvider');
  }
  return context;
};