import { Stack } from "expo-router";

const MapStack = () => {
  return (
    <Stack>
      <Stack.Screen name="[id]"  options={{ headerShown: false, title: 'Detale' }}  />
    </Stack>
  );
}

export default MapStack;