
import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/hooks/useFirebaseAuth';

interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'id' | 'en';
  notifications: boolean;
  autoSave: boolean;
}

const defaultSettings: AppSettings = {
  theme: 'system',
  language: 'id',
  notifications: true,
  autoSave: true,
};

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.uid) {
      loadUserSettings();
    } else {
      setLoading(false);
    }
  }, [user?.uid]);

  const loadUserSettings = async () => {
    if (!user?.uid) return;
    
    try {
      const settingsRef = doc(db, 'user_settings', user.uid);
      const settingsDoc = await getDoc(settingsRef);
      
      if (settingsDoc.exists()) {
        setSettings({ ...defaultSettings, ...settingsDoc.data() });
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    if (!user?.uid) return;

    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    try {
      const settingsRef = doc(db, 'user_settings', user.uid);
      await setDoc(settingsRef, updatedSettings, { merge: true });
    } catch (error) {
      console.error('Error updating user settings:', error);
    }
  };

  return {
    settings,
    updateSettings,
    loading,
  };
};
