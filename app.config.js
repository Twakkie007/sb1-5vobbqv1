export default {
  expo: {
    name: process.env.EXPO_PUBLIC_APP_NAME || "Stackie HR Community",
    slug: "stackie-hr-community",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#0F0F10"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.stackie.hr.community",
      buildNumber: "1"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#0F0F10"
      },
      package: "com.stackie.hr.community",
      versionCode: 1
    },
    web: {
      favicon: "./assets/images/favicon.png",
      bundler: "metro",
      output: "server"
    },
    plugins: [
      "expo-router",
      "expo-font",
      "expo-web-browser",
      "expo-camera",
      "expo-image-picker",
      "expo-av",
      [
        "expo-build-properties",
        {
          ios: {
            newArchEnabled: true
          },
          android: {
            newArchEnabled: true
          }
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      eas: {
        projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID
      }
    }
  }
};