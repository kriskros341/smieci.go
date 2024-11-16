import { useUsers } from "@hooks/useUsersQuery";
import { Control, useFieldArray } from "react-hook-form";
import { View, Text } from "react-native";
import { SolveMarkerEditorFormValues } from "./interfaces";
import Avatar from "@ui/avatar";
import Button from "@ui/button";
import { useAddParticipantsModal } from "./useAddParticipantsModal";

const ParticipantsFormField = ({
  control,
  disabled,
}: {
  control: Control<SolveMarkerEditorFormValues>;
  disabled?: boolean;
}) => {
  const { AddParticipantsModal, openAddParticipantsModal } =
    useAddParticipantsModal();
  const { fields, replace } = useFieldArray({
    name: "participants",
    control,
  });
  const { data } = useUsers();
  const remainder = fields.slice(3);

  return (
    <View>
      {fields.slice(0, 3)?.map(({ userId }) => {
        const user = data?.find(({ id }: { id: string }) => id === userId);
        return (
          <View className="flex flex-row items-center p-2">
            <Avatar key={user?.id} imageUrl={user?.profileImageURL} />
            <View className="mx-2">
              <Text>{user?.username}</Text>
            </View>
          </View>
        );
      })}
      {remainder.length ? (
        <View>
          <Text>I {remainder.length} innych</Text>
        </View>
      ) : null}
      {!disabled && (
        <Button
          title="Dodaj uczestników"
          onPress={() =>
            openAddParticipantsModal({
              participantsIds: fields.map((d) => d.userId),
              onCloseRequest: (newIds: string[]) => {
                replace(newIds.map((newId) => ({ userId: newId })));
              },
            })
          }
        />
      )}
      {AddParticipantsModal}
    </View>
  );
};

export default ParticipantsFormField;
