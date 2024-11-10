import { Image } from "expo-image";
import { useState } from "react";
import { Modal, View } from "react-native";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";

export const usePreviewImageModal = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [previewImageUri, setPreviewImageUri] = useState<string>("");
  const openPreviewImageModal = (newPreviewImageUri: string) => {
    setPreviewImageUri(newPreviewImageUri);
    setIsModalVisible(true);
    console.log("modal should have opened");
  };

  const PreviewImageModal = (
    <Modal
      animationType="fade"
      visible={isModalVisible}
      onRequestClose={() => {
        setIsModalVisible(false);
        console.log("close");
      }}
    >
      <View className="w-screen h-full">
        <ReactNativeZoomableView
          className="w-full h-full flex"
          maxZoom={5}
          minZoom={1}
          zoomStep={0.5}
          initialZoom={1}
          bindToBorders
          panBoundaryPadding={0}
        >
          <Image
            className="h-full w-full flex-1"
            source={{
              uri: previewImageUri,
            }}
          />
        </ReactNativeZoomableView>
      </View>
    </Modal>
  );

  return {
    PreviewImageModal,
    openPreviewImageModal,
  };
};
