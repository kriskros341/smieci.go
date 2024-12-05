import Button from "@ui/button";
import { router, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

const SolvePreface = () => {
  const { id } = useLocalSearchParams();
  return (
    <View className="flex gap-2 p-4">
      <Text>
        1. Dodaj uczestników sprzątania.
      </Text>
      <Text>
        2. Zrób zdjęcia obszaru po posprzątaniu - Posłużą one do weryfiacji
        zgłoszenia. Postaraj się aby odwzorowywały oryginalne zdjęcia.
      </Text>
      <Text>
        3. Zrób dodatkowe zdjęcia - Zostaną wykorzystane w przypadku problemów z
        automatyczną weryfikacją realizacji zgłoszenia.
      </Text>
      <Text>4. Po dodaniu, znacznik będzie oczekiwał na weryfikację. Po zweryfikowaniu, zgromadzone punkty zostaną rozdzielone pomiędzy uczestników.</Text>
      <Button
        buttonClassName="mt-4 rounded-full"
        title="Podziel się rezultatem"
        onPress={() => router.replace({ pathname: `markers/${id}/solve` })}
      />
    </View>
  );
};

export default SolvePreface;
