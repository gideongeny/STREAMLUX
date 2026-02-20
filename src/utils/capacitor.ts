// Capacitor utilities for mobile app features
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';

// Initialize Capacitor plugins
export const initCapacitor = async () => {
  try {
    // Set status bar style
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#1a1a1a' });
    
    // Hide splash screen after app loads
    await SplashScreen.hide();
    
    // Configure keyboard
    Keyboard.setAccessoryBarVisible({ isVisible: true });
    
    // Handle app state changes
    App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        // App came to foreground
        console.log('App is active');
      } else {
        // App went to background
        console.log('App is in background');
      }
    });
    
    // Handle back button (Android)
    App.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        App.exitApp();
      } else {
        window.history.back();
      }
    });
    
    console.log('Capacitor initialized successfully');
  } catch (error) {
    console.warn('Capacitor initialization failed (running in browser):', error);
  }
};

// Check if running in Capacitor
export const isCapacitor = (): boolean => {
  return !!(window as any).Capacitor;
};

// Check if running on Android
export const isAndroid = (): boolean => {
  return isCapacitor() && (window as any).Capacitor.getPlatform() === 'android';
};

// Check if running on iOS
export const isIOS = (): boolean => {
  return isCapacitor() && (window as any).Capacitor.getPlatform() === 'ios';
};

