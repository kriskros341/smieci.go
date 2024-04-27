import { ClerkProvider, SignedIn, SignedOut, useAuth } from '@clerk/clerk-expo';
import { Link } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { Button, View , Text, TextInput, TouchableOpacity} from 'react-native';
import * as SecureStore from "expo-secure-store";import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'

const ClerkKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

import SignUpScreen from './clerk/signup';
import { useEffect, useState } from 'react';
import SignInScreen from './clerk/signin';

const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

const Guarded = (props: any) => {
  const [view, setView] = useState<'signup' | 'signin'>('signup');

  const [auth, setAuth] = useState({
    username: '',
    emailAddress: '',
    password: '',
  })
  const onChange = (key: string, value: string) => setAuth({ ...auth, [key]: value });

  const { isSignedIn } = useAuth()

  useEffect(() => {
    setAuth({
      username: '',
      emailAddress: '',
      password: '',
    })
  }, [isSignedIn])

  let signedOutForm = null;
  if (view === 'signup') {
    signedOutForm = (
      <SignUpScreen
        switchToSignIn={() => setView('signin')}
        auth={{ ...auth, onChange }}
      />
    )
  } else if (view === 'signin') {
    signedOutForm = (
      <SignInScreen
        switchToSignUp={() => setView('signup')}
        auth={{ ...auth, onChange }}
      />
    )
  }
  
  return (
    <View className="flex align-center justify-center w-full h-full">
        <SignedIn>
          {props.children}
        </SignedIn>
        <SignedOut>
          {signedOutForm}
        </SignedOut>
    </View>
  )
}

const queryClient = new QueryClient()

export default function RootLayout(props: any) {
  return (
    <QueryClientProvider client={queryClient}>
      <ClerkProvider tokenCache={tokenCache} publishableKey={ClerkKey}>
        <Guarded>
          <Stack initialRouteName='map' screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
          </Stack>
        </Guarded>
      </ClerkProvider>
    </QueryClientProvider>
  )
}
