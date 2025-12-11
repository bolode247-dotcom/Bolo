import { ConfigContext, ExpoConfig } from '@expo/config';

const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const getUniqueIdentifier = () => {
  if (IS_DEV) {
    return 'com.uniforge.bolode.dev';
  }

  if (IS_PREVIEW) {
    return 'com.uniforge.bolode.preview';
  }

  return 'com.uniforge.bolode';
};

const getAppName = () => {
  if (IS_DEV) {
    return 'BOLO D';
  }

  if (IS_PREVIEW) {
    return 'BOLO P';
  }

  return 'BOLO';
};

const getGoogleServicesFile = () => {
  if (IS_DEV) return './google-services/google-services.dev.json';
  if (IS_PREVIEW) return './google-services/google-services.prev.json';
  return './google-services/google-services.prod.json';
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: getAppName(),
  slug: 'BOLO',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'bolo',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/icon.png',
      backgroundImage: './assets/images/icon.png',
      monochromeImage: './assets/images/icon.png',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    softwareKeyboardLayoutMode: 'pan',
    package: getUniqueIdentifier(),
    googleServicesFile: getGoogleServicesFile(),
  },
  web: {
    output: 'static',
    favicon: './assets/images/icon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/logo.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
        dark: {
          backgroundColor: '#ffffff',
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: '0e2c0dea-8795-4a70-ace8-3e4d1027fe88',
    },
  },
  owner: 'bolode',
  runtimeVersion: {
    policy: 'appVersion',
  },
  updates: {
    url: 'https://u.expo.dev/0e2c0dea-8795-4a70-ace8-3e4d1027fe88',
  },
});
