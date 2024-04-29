import * as React from "react";
import { Pressable, Text } from "react-native";
import { cn } from "../../utils/cn";

interface Props {
  onPress: () => void;
  title: string;
  buttonClassName?: string;
  textClassName?: string;
}

const Button: React.FC<Props> = ({
  onPress,
  title,
  buttonClassName,
  textClassName,
}) => {
  return (
    <Pressable
      onPress={onPress}
      className={cn("bg-blue-500 p-2", buttonClassName)}
    >
      <Text className={cn("text-white", textClassName)}>{title}</Text>
    </Pressable>
  );
};

export default Button;
