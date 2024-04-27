import { useAuth } from '@clerk/clerk-expo';
import { Link, Tabs } from 'expo-router';
import React from 'react';
import { Button, Text, TouchableOpacity, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';

const SignOut = () => {
  const { isLoaded, signOut } = useAuth();
  if (!isLoaded) {
    return null;
  }
  return (
    <View>
      <TouchableOpacity onPress={() => signOut()}>
        <Text>Sign Outttddaa</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function TabLayout(props: any) {
  return (
    <Tabs >
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          headerTitleContainerStyle: {
            display: 'none'
          },
          header() {
            return null;
          }
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Leaderboard',
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
        }}
      />
    </Tabs>
  );
}
