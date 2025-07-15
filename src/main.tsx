import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'
import { LanguageProvider } from '@/hooks/useLanguage'

// Add error boundary to catch and display render errors
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  // If the page is blank, show a minimal error UI
  if (document.body.innerHTML.trim() === '') {
    document.body.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif;">
        <h2>Something went wrong</h2>
        <p>The application encountered an error. Please try refreshing the page.</p>
        <button onclick="window.location.reload()" style="padding: 8px 16px; background: #b91c1c; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Refresh Page
        </button>
        <p style="margin-top: 20px; font-size: 12px; color: #666;">
          Error details: ${event.error?.message || 'Unknown error'}
        </p>
      </div>
    `;
  }
});

// Register service worker with custom update handling
const updateSW = registerSW({ 
  // Increase the interval to check for updates to reduce reload frequency
  immediate: false,
  intervalMS: 60 * 60 * 1000, // Check for updates every hour instead of every minute
  onNeedRefresh() {
    // Use a less intrusive notification instead of a confirm dialog
    const shouldUpdate = window.localStorage.getItem('autoUpdateEnabled') !== 'false';
    if (shouldUpdate) {
      console.log('New content available, updating automatically');
      updateSW(true);
    } else {
      console.log('New content available, but auto-update is disabled');
      // Could show a toast notification here instead
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline')
  },
})

// Wrap the render in a try-catch to prevent blank screen on errors
try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }
  
  // Clear any persisted query cache that might be corrupted
  if (window.localStorage.getItem('app-crashed') === 'true') {
    console.log('Previous crash detected, clearing caches...');
    // Clear React Query cache
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('rq-')) {
        localStorage.removeItem(key);
      }
    });
    // Clear the crash flag
    window.localStorage.removeItem('app-crashed');
  }
  
  createRoot(rootElement).render(
    <LanguageProvider>
      <App />
    </LanguageProvider>
  );
} catch (error) {
  console.error('Failed to render application:', error);
  // Mark that we had a crash for next load
  window.localStorage.setItem('app-crashed', 'true');
  
  // Show a minimal UI when the app fails to render
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif;">
      <h2>Application Error</h2>
      <p>The application failed to start. Please try refreshing the page.</p>
      <button onclick="window.location.reload()" style="padding: 8px 16px; background: #b91c1c; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Refresh Page
      </button>
      <p style="margin-top: 20px; font-size: 12px; color: #666;">
        Error details: ${error instanceof Error ? error.message : String(error)}
      </p>
    </div>
  `;
}