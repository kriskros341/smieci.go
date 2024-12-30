import { ClerkProvider } from "@clerk/clerk-expo";
import CustomQueryClientProvider from "@components/queryClientProvider";
import { PortalHost } from "@rn-primitives/portal";
import Constants from "expo-constants";
import { Slot } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";

import 'react-native-url-polyfill/auto';

const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      console.error(err);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      console.error(err);
    }
  },
};

function RootLayout() {
  const token = Constants?.expoConfig?.extra?.clerkPublishableKey;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider tokenCache={tokenCache} publishableKey={token}>
        <CustomQueryClientProvider>
          <Slot />
          {/* <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="markers/[id]" />
            <Stack.Screen name="tabs" />
          </Stack> */}
        </CustomQueryClientProvider>
        <PortalHost />
        <Toast />
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}

export default RootLayout;
