import { useState } from "react";
import { Modal } from "react-native";

import VerificationPhotoEditor from "@components/editors/VerificationPhotoEditor";

export const useCreateVerificationPhotoModal = () => {
  const [isModalVisible, setIsModalVisible] = useState  (false);
  const [createVerificationPhotoProps, setCreateVerificationPhotoProps] = useState<any>('');
  const openVerificationPhotoModal = (props: any) => {
    setCreateVerificationPhotoProps(props);
    setIsModalVisible(true);
    console.log('modal should have opened')
  }

  const commit = (uri: string) => {
    createVerificationPhotoProps.commit(uri);
    setIsModalVisible(false);
  }

  const VerificationPhotoModal = (
    <Modal
      animationType="fade"
      visible={isModalVisible}
      onRequestClose={() => {
        setIsModalVisible(false)
        console.log('close')
      }}>
        <VerificationPhotoEditor
          {...createVerificationPhotoProps}
          commit={commit}
        />
    </Modal>
  )

  return {
    VerificationPhotoModal,
    openVerificationPhotoModal
  }
}
