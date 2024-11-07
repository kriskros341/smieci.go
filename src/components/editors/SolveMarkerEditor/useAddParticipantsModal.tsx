import { useState } from "react";
import { Modal, View, Text } from "react-native";
import { useUsers } from "@hooks/useUsersQuery";
import { FlashList } from "@shopify/flash-list";
import Avatar from "@ui/avatar";
import { Checkbox } from "@ui/checkbox";
import { produce } from "immer";
import { useUser } from "@clerk/clerk-expo";
import Fabs from "@ui/Fabs";
import Button from "@ui/button";

type ModalProps = {
  participantsIds: string[],
  onCloseRequest: (newIds: string[]) => void,
}

const AddParticipantsEditor = (props: ModalProps) => {
  const { data } = useUsers();
  const { user } = useUser();
  const [users, setUsers] = useState(props.participantsIds.reduce((acc, prev) => {acc[prev] = 1; return acc}, {} as Record<string, any>));

  const addUser = (userId: string) => setUsers(produce((users) => {
    users[userId] = 1; // Może w przyszłości dodane zostaną jakieś dane tutaj, jak na razie interesuje nas tylko klucz
  }));

  const removeUser = (userId: string) => setUsers(produce((users) => {
    delete users[userId];
  }));

  const toggleUser = (userId: string, value: boolean) => {
    if (value) {
      addUser(userId);
    } else {
      removeUser(userId);
    }
  };

  const displayData = data.map(({ clerkid, username, profileImageURL }: any) => ({
    clerkid,
    username,
    profileImageURL,
    isActive: !!users[clerkid],
  }));
  
  return (
    <View className="flex-1">
      <FlashList
        data={displayData}
        renderItem={({ item }: any) => (
          <View className="p-2 flex flex-row items-center" key={item.clerkid}>
            <Avatar
              imageUrl={item.profileImageURL}
            />
            <View className="mx-2">
              <Text>{item.username}</Text>
            </View>
            <View>
              <Checkbox
                disabled={item.clerkid === user?.id}
                checked={item.isActive}
                onCheckedChange={(newValue) => toggleUser(item.clerkid, newValue)}
              />
            </View>
          </View>
        )}
      />
      <Fabs>
        <View>
          <Button title="Zatwierdź" onPress={() => props.onCloseRequest(Object.keys(users))} />
        </View>
      </Fabs>
    </View>
  );
};

export const useAddParticipantsModal = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [props, setProps] = useState<ModalProps>();
  const openAddParticipantsModal = (props: ModalProps) => {
    setProps(props);
    setIsModalVisible(true);
  };

  const withExitModal = (fun: Function) => (...args: any) => {
    setIsModalVisible(false);
    fun(...args);
  };

  const AddParticipantsModal = (
    <Modal
      animationType="fade"
      visible={isModalVisible}
      onRequestClose={() => {
        setIsModalVisible(false);
        props?.onCloseRequest(props?.participantsIds ?? [])
      }}>
        <AddParticipantsEditor participantsIds={props?.participantsIds ?? []} onCloseRequest={withExitModal(props?.onCloseRequest!)} />
    </Modal>
  );

  return {
    AddParticipantsModal,
    openAddParticipantsModal,
  };
};
