import { View } from "react-native";

const DividerWithText = (props: React.PropsWithChildren<unknown>) => {
  return (
    <View className="flex flex-row items-center px-2 py-4">
      <View className="flex-1 h-1 bg-[#ccc]" />
      <View className="mx-2 flex flex-row">{props.children}</View>
      <View className="flex-1 h-1 bg-[#ccc]" />
    </View>
  );
};

export default DividerWithText;