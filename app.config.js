module.exports = {
  expo: {
    name: "smieci.go",
    slug: "smiecigo",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    scheme: "myapp",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    owner: "smieci",
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      jsEngine: "hermes",
    },
    android: {
      config: {
        googleMaps: {
          apiKey: "AIzaSyAo0hhvg2ojViwGzSKT7XkIipQPybLUlPY"
        }
      },
      permissions: ["CAMERA", "WRITE_EXTERNAL_STORAGE"],
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      jsEngine: "hermes",
      package: "com.smiecigo.app",
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro",
    },
    plugins: [
      "expo-router",
      "expo-secure-store",
      "expo-image-picker",
      [
        "expo-build-properties",
        {
          "android": {
            "usesCleartextTraffic": true
          }
        }
      ]
    ],
    extra: {
      clerkPublishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
      eas: {
        projectId: "84b4e448-a347-47ed-b16f-fd35172e9e44",
        // projectId: "04fd1fd2-4050-498f-aed1-cf4126296f49", // TEMP kris
      },
    },
  },
};
