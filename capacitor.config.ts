import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.streamlux.app',
  appName: 'StreamLux',
  webDir: 'dist',
  // Allow Firebase auth redirects — without this the WebView blocks firebaseapp.com
  // and all sign-in/sign-up flows silently fail on Android
  server: {
    allowNavigation: [
      '*.firebaseapp.com',
      '*.firebase.com',
      '*.googleapis.com',
      '*.google.com',
      '*.facebook.com',
      'accounts.google.com',
    ],
  },
  plugins: {
    AdMob: {
      appId: 'ca-app-pub-1281448884303417~9595144052'
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon",
      iconColor: "#d97706",
      largeIcon: "ic_launcher"
    },
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#000000",
      showSpinner: true,
      androidSpinnerStyle: "large",
      spinnerColor: "#ffffff",
      splashFullScreen: true
    }
  }
};

export default config;

