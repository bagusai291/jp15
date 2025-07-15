import { useState, useEffect, createContext, useContext } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { getStoredReferralCode, isReferralCodeValid, registerWithReferral } from '@/utils/referralUtils';

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
  userProfile: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user?.email);
      setUser(user);
      
      if (user) {
        // Fetch user profile from Firestore
        const adminEmails = ['admin@gmail.com', 'ari4rich@gmail.com', 'newadmin@gmail.com', 'injpn@food.com'];
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting Firebase sign in with email:', email);
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error: any) {
      console.error('Firebase sign in error:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log('Attempting Firebase sign up with email:', email);
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile
      await updateProfile(user, {
        displayName: fullName
      });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        full_name: fullName,
        email: email,
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      // Check if user came from a referral link
      const referralCode = getStoredReferralCode();
      if (referralCode && isReferralCodeValid()) {
        console.log('User signed up with referral code:', referralCode);
        try {
          await registerWithReferral(
            referralCode,
            user.uid,
            email,
            fullName
          );
          console.log('Successfully registered user with referral');
        } catch (referralError) {
          console.error('Error registering user with referral:', referralError);
          // Don't fail signup if referral processing fails
        }
      }
      
      console.log('Sign up successful and profile created:', user.email);
      return { error: null };
    } catch (error: any) {
      console.error('Firebase sign up error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Attempting Firebase sign out');
      await firebaseSignOut(auth);
      console.log('Sign out successful');
      window.location.href = '/auth';
    } catch (error) {
      console.error('Firebase sign out error:', error);
      window.location.href = '/auth';
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      signIn,
      signUp,
      signOut,
      loading,
      userProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};