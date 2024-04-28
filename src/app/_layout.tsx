import { ClerkProvider, SignedIn, SignedOut, useAuth } from "@clerk/clerk-expo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Constants from "expo-constants";
import { Stack } from "expo-router/stack";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { View } from "react-native";
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

  const [auth, setAuth] = useState({
    username: "",
    emailAddress: "",
    password: "",
  });
  const onChange = (key: string, value: string) =>
    setAuth({ ...auth, [key]: value });

  const { isSignedIn } = useAuth();

  useEffect(() => {
    setAuth({
      username: "",
      emailAddress: "",
      password: "",
    });
  }, [isSignedIn]);

  let signedOutForm = null;
  if (view === "signup") {
    signedOutForm = (
      <SignUpScreen
        switchToSignIn={() => setView("signin")}
        auth={{ ...auth, onChange }}
      />
    );
  } else if (view === "signin") {
    signedOutForm = (
      <SignInScreen
        switchToSignUp={() => setView("signup")}
        auth={{ ...auth, onChange }}
      />
    );
  }

  return (
    <View className="flex justify-center w-full h-full align-center">
      <SignedIn>{children}</SignedIn>
      <SignedOut>{signedOutForm}</SignedOut>
    </View>
  );
};

const queryClient = new QueryClient();

function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ClerkProvider
        tokenCache={tokenCache}
        publishableKey={Constants?.expoConfig?.extra?.clerkPublishableKey}
      >
        <Guarded>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
          </Stack>
        </Guarded>
      </ClerkProvider>
    </QueryClientProvider>
  );
}

export default RootLayout;
