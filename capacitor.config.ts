import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gideongeny.streamlux',
  appName: 'streamlux',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    AdMob: {
      appId: 'ca-app-pub-1281448884303417~9595144052'
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;
