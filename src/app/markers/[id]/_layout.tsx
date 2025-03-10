import { Stack, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { TouchableOpacity } from "react-native-gesture-handler";

const MarkerStack = () => {
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Szczegóły",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="mr-9">
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen name="support" options={{ title: "Wesprzyj" }} />
      <Stack.Screen name="solvePreface" options={{ title: "Rozwiązywanie" }} />
      <Stack.Screen name="solve" options={{ title: "Rozwiązywanie" }} />
      <Stack.Screen
        name="solution/[solutionId]"
        options={{ title: "Rozwiązanie" }}
      />
    </Stack>
  );
};

export default MarkerStack;
