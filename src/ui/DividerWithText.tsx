import { View, Text } from "react-native";

interface Props extends React.PropsWithChildren {
  asView?: boolean
}

const DividerWithText: React.FC<Props> = ({ children, asView }) => {
  let content = children;
  if (asView) {
    content = (
      <View>
        {content}
      </View>
    )
  } else {
    content = (
      <Text>
        {content}
      </Text>
    )
  }
  return (
    <View className="flex flex-row items-center px-2 py-4">
      <View className="flex-1 h-px bg-slate-300" />
      <View className="flex flex-row mx-2">{content}</View>
      <View className="flex-1 h-px bg-slate-300" />
    </View>
  );
};

export default DividerWithText;
