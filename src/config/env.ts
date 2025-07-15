
// Firebase configuration from environment variables
export const firebaseConfig = {
  apiKey: "AIzaSyCwaM057q4UhhSg_Aok4nSh9HWYptJfm5Q",
  authDomain: "injapan-food.firebaseapp.com",
  projectId: "injapan-food",
  storageBucket: "injapan-food.firebasestorage.app",
  messagingSenderId: "323443767194",
  appId: "1:323443767194:web:a5638c2cf89c9c8106ac23"
};

// Enhanced configuration logging for debugging
console.log('Firebase config loaded:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  hasApiKey: !!firebaseConfig.apiKey,
  environment: window.location.hostname.includes('localhost') ? 'development' :
               window.location.hostname.includes('vercel.app') ? 'production-vercel' :
               window.location.hostname.includes('lovable.app') ? 'lovable-preview' : 'unknown',
  timestamp: new Date().toISOString()
});
