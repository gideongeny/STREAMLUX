import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.streamlux.app',
  appName: 'StreamLux',
  webDir: 'build',
  server: {
    androidScheme: 'streamlux',
    allowNavigation: [
      'https://vidsrc.me',
      'https://2embed.org',
      'https://www.2embed.to',
      'https://vidembed.cc',
      'https://moviebox.live',
      'https://www.moviebox.ng',
      'https://watchmovieshd.ru',
      'https://streamsb.net',
      'https://vidstream.pro',
      'https://fsapi.xyz',
      'https://curtstream.com',
      'https://moviewp.com',
      'https://v2.apimdb.net',
      'https://gomo.to',
      'https://vidcloud.stream',
      'https://getsuperembed.link',
      'https://databasegdriveplayer.co',
      'https://123movies.com',
      'https://www.123movies.net',
      'https://fmovies.to',
      'https://yesmovies.to',
      'https://gomovies.sx',
      'https://sportslive.run',
      'https://www.netnaija.com',
      'https://netnaija.net',
      'https://streamlux.vercel.app',
      'https://moonlight-films-five.vercel.app',
      // Firebase/Google Auth Domains
      'https://accounts.google.com',
      'https://*.firebaseapp.com',
      'https://*.facebook.com',
      'https://streamlux-67a84.firebaseapp.com',
      'https://streamlux-67a84.web.app',
    ],
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    backgroundColor: '#1a1a1a',
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      releaseType: 'AAB',
    },
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#1a1a1a',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#1a1a1a',
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
    // Temporarily disabled to test if it conflicts with Firebase Auth
    CapacitorHttp: {
      enabled: false,
    },
    // AdMob configuration
    // App ID: ca-app-pub-1281448884303417~9595144052
    AdMob: {
      appId: {
        android: 'ca-app-pub-1281448884303417~9595144052',
      },
    } as any,
  },
};

export default config;
