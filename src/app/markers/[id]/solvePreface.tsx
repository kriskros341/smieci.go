import Button from "@ui/button";
import { router, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

const SolvePreface = () => {
  const { id } = useLocalSearchParams();
  return (
    <View className="flex gap-2">
      <Text>
        1. Zrób zdjęcia obszaru po posprzątaniu - Posłużą one do weryfiacji
        zgłoszenia. Postaraj się aby odwzorowywały oryginalne zdjęcia.
      </Text>
      <Text>
        2. Zrób dodatkowe zdjęcia - Zostaną wykorzystane w przypadku problemów z
        automatyczną weryfikacją realizacji zgłoszenia.
      </Text>
      <Text>3. Profit</Text>
      <Button
        title="Podziel się rezultatem"
        onPress={() =>
          router.replace({ pathname: `markers/${id}/solve` })
        }
      />
    </View>
  );
};

export default SolvePreface;
