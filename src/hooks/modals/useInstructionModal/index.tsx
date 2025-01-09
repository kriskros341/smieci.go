import Button from "@ui/button";
import { useState } from "react";
import { Modal, Text, View, ScrollView } from "react-native";


export const useInstructionModal = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const InstructionModal = (
    <Modal
      animationType="fade"
      visible={isModalVisible}
      onRequestClose={() => {
        setIsModalVisible(false);
        console.log("close");
      }}
    >
      <ScrollView>

        <View className="p-8 gap-y-4">
          <View>
            <Text className="text-lg">
              śmieci.go  
            </Text>
          </View>
          <View>
            <Text>
              Funkcją aplikacji jest zgłaszanie zanieczyszczeń oraz zachęcenie użytkowników do ich eliminowania.
            </Text>
          </View>
          <View className="mt-4">
            <Text className="text-lg">
              Znaczniki
            </Text>
          </View>
          <View>
            <Text>
              Wyświetlone na mapie znaczniki to zgłoszone przez użytkowników zanieczyszczenia.
              Żeby zgłosić zaśmiecenie kliknij przycisk, następnie wykonaj zdjęcia problematycznego obszaru.
            </Text>
          </View>
          <View>
            <Text>
              Niebieskie: Znaczniki oczekujące na rozwiązane;
            </Text>
          </View>
          <View>
            <Text>
              Czerwone: Znaczniki odrzucone przez system;
            </Text>
          </View>
          <View>
            <Text>
              Zielone: Znaczniki rozwiązane (wysprzątane i potwierdzone)
            </Text>
          </View>
          <View className="mt-4">
            <Text className="text-lg">
              Wspieranie i rozwiązywanie zgłoszeń
            </Text>
          </View>
          <View>
            <Text>
              Jeśli znalazłeś/aś już otwarte zgłoszenie, możesz dorzucić do jego puli swoje punkty wsparcia, aby zachęcić innych do posprzątania.
              Jeśli czujesz się odważnie, możesz utworzyć rozwiązanie zgłoszenia, przesyłając zdjęcia posprzątającego obszaru! Swój ranking pośród rozwiązujących możesz śledzić w zakładce laderboard.
            </Text>
          </View>
          <View className="mt-4">
            <Text className="text-lg">
              W razie problemów
            </Text>
          </View>
          <View>
            <Text>
              Do weryfikacji wykorzystywany jest automatyczny system. Bywa on jednak wadliwy, jak wszystko z SI związane.
              Jest on raczej permisywny. Jeśli jednak uważasz, że Twoje zgłoszenie zostało niesłusznie odrzucone, zgłoś to nam na smiecigo@gmail.com.
              Uprawnieni użytkownicy mogą nadpisać decyzje ai z poziomu aplikacji.
            </Text>
          </View>
          <View className="mt-4">
            <Text className="text-lg">
              Chcesz uprawnienia do nadpisania decyzji ai?
            </Text>
          </View>
          <View>
            <Text>
              Zgłoś nam zainteresowanie, a my podejmiemy decyzję na podstawie aktywności w aplikacji!
            </Text>
          </View>
          <View>
            <Button title="Do dzieła!" buttonClassName="bg-blue-600 py-2 rounded-lg" onPress={() => setIsModalVisible(false)} />
          </View>
        </View>
      </ScrollView>
    </Modal>
  );

  return {
    isModalVisible,
    setIsModalVisible,
    InstructionModal,
  } as const
};
