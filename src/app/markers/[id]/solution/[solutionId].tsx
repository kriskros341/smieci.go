import SolveMarkerEditor from "@components/editors/SolveMarkerEditor";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { SolveMarkerEditorFormValues } from "@components/editors/SolveMarkerEditor/interfaces";
import { FormProvider, useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUriByUploadId } from "@utils/getUriFromPhotoId";
import { useEffect, useLayoutEffect, useState } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Entypo } from "@expo/vector-icons";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator,
} from "react-native";
import { useAxios } from "@hooks/use-axios";
import Toast from "react-native-toast-message";
import { useMarkerQuery } from "@hooks/useMarkerQuery";
import StatusBadge from "@components/statusBadge";
import { SolutionStatus } from "@utils/databaseConstants";

const useSolutionQuery = (solutionId: string) => {
  return useQuery<any>({
    queryKey: [`/solutions/${solutionId}`],
  });
};

type useContextMenuOptions = {
  items: { text: string; callback: Function }[];
};

// KCTODO Wyciągnąć
export const useContextMenu = ({ items }: useContextMenuOptions) => {
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [menuVisible, setMenuVisible] = useState(false);

  // Set position of the button for menu positioning
  const onLayout = (event: any) => {
    event.target?.measure?.(
      (x: any, y: any, width: any, height: any, pageX: any, pageY: any) => {
        setButtonPosition({ x, y: y + height });
      },
    );
  };

  const Trigger = (
    <TouchableOpacity
      className="flex flex-row"
      onPress={() => setMenuVisible(true)}
    >
      <Entypo
        name="dots-three-vertical"
        size={24}
        color="black"
        onLayout={onLayout}
      />
    </TouchableOpacity>
  );

  const Menu = (
    <Modal
      transparent
      visible={menuVisible}
      animationType="fade"
      onRequestClose={() => setMenuVisible(false)}
    >
      <TouchableWithoutFeedback
        className="flex-1"
        onPress={() => setMenuVisible(false)}
      >
        <View className="w-full h-full">
          <View
            style={[
              styles.menu,
              { right: buttonPosition.x, top: buttonPosition.y },
            ]}
          >
            {items.map(({ text, callback }) => (
              <Pressable
                key={text}
                onPress={() => {
                  callback();
                  setMenuVisible(false);
                }}
                style={styles.menuItem}
              >
                <Text style={styles.menuText}>{text}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return { Trigger, Menu };
};

const useSolutionStatusMutation = (solutionId: unknown) => {
  const axios = useAxios();
  return useMutation({
    mutationFn: (payload: string) =>
      axios.post(`/solutions/${solutionId}/status`, { status: payload }),
    onError: (e: any) => {
      Toast.show({
        type: "error",
        text1: "wystąpił błąd",
        text2: JSON.stringify(e),
      });
    },
  });
};

const PreivewMarkerSolution = () => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { solutionId, id } = useLocalSearchParams();
  const { data, refetch: refetchSolution } = useSolutionQuery(solutionId as string);
  const { data: markerData, refetch: refetchMarker } = useMarkerQuery(id as string);
  const { mutateAsync, isPending } = useSolutionStatusMutation(solutionId);

  const option = (result: string, goBackOnSuccess?: boolean) => {
    mutateAsync(result).then(() => {
      refetchMarker()
      refetchSolution()
      queryClient.invalidateQueries({ queryKey: ['/markers'] })
      queryClient.invalidateQueries({ queryKey: [`/markers/${markerData?.id}`] })
      goBackOnSuccess && navigation.goBack();
    });
  };

  const contextMenuItems = [];
  if (markerData?.pendingVerificationsCount === -1) {
    // Rozwiązany
    contextMenuItems.push({
      text: "Otwórz ponownie",
      callback: () => option(SolutionStatus.Pending),
    });
  } else {
    contextMenuItems.push(
      { text: "Zatwierdź", callback: () => option(SolutionStatus.Approved, true) },
      { text: "Odrzuć", callback: () => option(SolutionStatus.Denied, true) },
    );
  }

  const { Trigger, Menu } = useContextMenu({ items: contextMenuItems });

  const methods = useForm<SolveMarkerEditorFormValues>({});
  const { reset } = methods;
  useEffect(() => {
    if (data) {
      reset({
        photos:
          data?.photos?.map(({ id }: { id: string }) => ({
            uri: getUriByUploadId(id),
          })) ?? [],
        additionalPhotos: data?.additionalPhotos?.map(
          ({ id }: { id: string }) => ({ uri: getUriByUploadId(id) }),
        ),
        participants: data.participants,
      });
    }
  }, [data]);

  const { data: currentUserPermissions } = useQuery<string[]>({
    queryKey: ["/users/current/permissions"],
  });

  useLayoutEffect(() => {
    if (currentUserPermissions?.includes("reviewing")) {
      navigation.setOptions({
        headerRight: () => (
          <View className="flex flex-row gap-4">
            <StatusBadge status={markerData?.status ?? 'pending'} />
            {isPending ? <ActivityIndicator color="#10a37f" /> : Trigger}
          </View>
        ),
      });
    }
  }, [currentUserPermissions, isPending, markerData]);

  return (
    <>
      <FormProvider {...methods}>
        <SolveMarkerEditor markerId={id as string} disabled />
      </FormProvider>
      {Menu}
    </>
  );
};

const styles = StyleSheet.create({
  iconWrapper: {
    marginRight: 15,
  },
  menu: {
    position: "absolute",
    backgroundColor: "white",
    borderRadius: 8,
    elevation: 10,
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  menuText: {
    fontSize: 16,
    color: "black",
  },
});

export default PreivewMarkerSolution;
