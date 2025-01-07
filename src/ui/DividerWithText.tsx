import { View, Text } from "react-native";

interface Props extends React.PropsWithChildren {}

const DividerWithText: React.FC<Props> = ({ children, }) => {
  return (
    <View className="flex flex-row items-center px-2 py-4">
      <View className="flex-1 h-px bg-slate-300" />
      <View className="flex flex-row mx-2"><Text>{children}</Text></View>
      <View className="flex-1 h-px bg-slate-300" />
    </View>
  );
};

export default DividerWithText;
