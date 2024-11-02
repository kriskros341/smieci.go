import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-expo";
import Constants from "expo-constants";
import { Stack } from "expo-router/stack";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from 'react-native-toast-message';
import { PortalHost } from '@rn-primitives/portal';

import CustomQueryClientProvider from "@components/queryClientProvider";
import SignInScreen from "./clerk/signin";
import SignUpScreen from "./clerk/signup";

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

interface GuardedProps extends React.PropsWithChildren {}

const Guarded: React.FC<GuardedProps> = ({ children }) => {
  const [view, setView] = useState<"signup" | "signin">("signup");

  let signedOutForm = null;
  if (view === "signup") {
    signedOutForm = <SignUpScreen switchToSignIn={() => setView("signin")} />;
  } else if (view === "signin") {
    signedOutForm = <SignInScreen switchToSignUp={() => setView("signup")} />;
  }

  return (
    <View className="flex justify-center w-full h-full align-center">
      <SignedIn>{children}</SignedIn>
      <SignedOut>{signedOutForm}</SignedOut>
    </View>
  );
};

function RootLayout() {
  const token = Constants?.expoConfig?.extra?.clerkPublishableKey;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider
        tokenCache={tokenCache}
        publishableKey={token}
      >
        <CustomQueryClientProvider>
            <Guarded>
              <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="markers/[id]" options={{ headerShown: true }}/>
              </Stack>
            </Guarded>
        </CustomQueryClientProvider>
      </ClerkProvider>
      <PortalHost />
      <Toast />
    </GestureHandlerRootView>
  );
}

export default RootLayout;
