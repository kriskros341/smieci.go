import { Stack } from "expo-router";

export const unstable_settings = {
  initialRouteName: "index",
};

const MapStack = () => {
  return <Stack screenOptions={{ headerShown: false }} />;
};

export default MapStack;
