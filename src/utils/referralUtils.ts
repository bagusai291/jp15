import { trackReferralClick, registerWithReferral } from '@/services/affiliateService';
import { auth } from '@/config/firebase';

// Get referral code from URL
export const getReferralCodeFromUrl = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('ref');
};

// Store referral code in localStorage
export const storeReferralCode = (referralCode: string): void => {
  localStorage.setItem('referralCode', referralCode);
  localStorage.setItem('referralTimestamp', Date.now().toString());
  console.log(`Stored referral code in localStorage: ${referralCode}`);
};

// Get stored referral code
export const getStoredReferralCode = (): string | null => {
  return localStorage.getItem('referralCode');
};

// Check if referral code is still valid (within 30 days)
export const isReferralCodeValid = (): boolean => {
  const timestamp = localStorage.getItem('referralTimestamp');
  if (!timestamp) return false;
  
  const referralDate = new Date(parseInt(timestamp));
  const now = new Date();
  
  // Calculate difference in days
  const diffTime = now.getTime() - referralDate.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  
  // Valid for 30 days
  return diffDays <= 30;
};

// Track referral click
export const trackReferral = async (referralCode: string): Promise<void> => {
  try {
    console.log('Attempting to track referral code:', referralCode);
    // Generate a visitor ID (or use existing one)
    let visitorId = localStorage.getItem('visitorId');
    if (!visitorId) {
      visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('visitorId', visitorId);
    }
    
    try {
      // Track the click
      await trackReferralClick(referralCode, visitorId);
      console.log('Successfully tracked referral click');
    } catch (clickError) {
      console.warn('Non-critical error tracking referral click (continuing):', clickError);
      // Continue execution even if tracking fails
    }
    
    // Store the referral code
    storeReferralCode(referralCode);
    console.log('Referral code stored successfully:', referralCode);
    
    // If user is already logged in, register them with the referral
    const currentUser = auth.currentUser;
    if (currentUser) {
      console.log('User already logged in, registering with referral');
      try {
        await registerWithReferral(
          referralCode,
          currentUser.uid,
          currentUser.email || '',
          currentUser.displayName || currentUser.email?.split('@')[0] || 'User'
        );
        console.log('User registered with referral successfully');
      } catch (registerError) {
        console.error('Error registering logged-in user with referral:', registerError);
      }
    }
  } catch (error) {
    console.error('Error tracking referral:', error);
  }
};

// Check and process referral code from URL
export const processReferralCode = async (): Promise<void> => {
  try {
    console.log('Checking for referral code in URL');
    const referralCode = getReferralCodeFromUrl();
    
    if (referralCode) {
      console.log('Found referral code in URL:', referralCode);
      try {
        await trackReferral(referralCode);
      } catch (error) {
        console.warn('Error in referral tracking, continuing with code storage:', error);
        // Store the code anyway even if tracking fails
        storeReferralCode(referralCode);
      }
    } else {
      console.log('No referral code found in URL');
    }
  } catch (error) {
    console.error('Error processing referral code:', error);
    // Don't rethrow to prevent app from crashing
  }
};

// Redirect to auth page with referral code
export const redirectToAuthWithReferral = (referralCode: string): void => {
  window.location.href = `/auth?tab=signup&ref=${referralCode}`;
};