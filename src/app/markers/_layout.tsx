import { Stack } from "expo-router";

const MapStack = () => {
  console.log("jdd")
  return (
    <Stack>
      <Stack.Screen name="[id]"  options={{ headerShown: true, title: 'Detale' }}  />
      <Stack.Screen name="[id]/supporters" options={{ headerShown: true, title: 'Lista wspierających' }} />
      <Stack.Screen name="[id]/support" options={{ headerShown: true, title: 'Wesprzyj' }} />
    </Stack>
  );
}

export default MapStack;