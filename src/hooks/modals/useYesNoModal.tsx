import { useState } from "react";
import { Modal, View, Text } from "react-native";
import Button from "@ui/button";

type ModalProps = {
  onYes: () => void,
  onNo?: () => void,
  text: string,
}

export const useYesNoModal = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [props, setProps] = useState<ModalProps>();
  const openYesNoModal = (props: ModalProps) => {
    setProps(props);
    setIsModalVisible(true);
  }

  const YesNoModal = (
    <Modal
      animationType="fade"
      visible={isModalVisible}
      onRequestClose={() => {
        props?.onNo?.();
        setIsModalVisible(false);
      }}>
        <View className="w-screen h-full p-4">
          <Text>{props?.text}</Text>
          <View className="py-4 flex flex-row gap-4">
            <View>
              <Button title="Tak" onPress={() => { props?.onYes(); setIsModalVisible(false); } } />
            </View>
            <View>
              <Button title="Nie" onPress={() => { props?.onNo?.(); setIsModalVisible(false); } } />
            </View>
          </View>
        </View>
    </Modal>
  )

  return {
    YesNoModal,
    openYesNoModal
  }
}