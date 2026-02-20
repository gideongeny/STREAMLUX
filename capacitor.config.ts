import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.streamlux.app',
  appName: 'StreamLux',
  webDir: 'build',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      'https://vidsrc.me',
      'https://2embed.org',
      'https://www.2embed.to',
      'https://vidembed.cc',
      'https://moviebox.live',
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
      'https://fmovies.to',
      'https://yesmovies.to',
      'https://gomovies.sx',
      'https://sportslive.run',
      'https://streamlux.vercel.app',
      'https://moonlight-films-five.vercel.app',
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
  },
};

export default config;

