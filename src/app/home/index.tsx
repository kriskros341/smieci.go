import { useAuth, useUser } from "@clerk/clerk-expo";
import Button from "@ui/button";
import { router } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

export default function Page() {
  const { user } = useUser();
  const { signOut, isLoaded, isSignedIn } = useAuth();

  const CenterLayout = ({ children }: { children: React.ReactNode }) => {
    return (
      <View className="flex items-center justify-center w-screen h-screen">
        {children}
      </View>
    );
  };

  if (!isSignedIn) {
    return (
      <CenterLayout>
        <Text>Not signed in</Text>
      </CenterLayout>
    );
  }

  if (!isLoaded) {
    return <CenterLayout>Loading...</CenterLayout>;
  }

  return (
    <CenterLayout>
      <Text>Hello {user?.emailAddresses?.[0]?.emailAddress}</Text>
      <Button
        title="Log out"
        onPress={async () => {
          await signOut();
          router.replace("/");
        }}
      />
    </CenterLayout>
  );
}
