import * as React from "react";
import { Pressable, Text } from "react-native";
import { cn } from "@utils/cn";

interface Props {
  onPress?: () => void;
  title: string;
  className?: string;
  textClassName?: string;
  disabled?: boolean;
}

const Button: React.FC<Props> = ({
  onPress,
  title,
  disabled,
  className,
  textClassName,
}) => {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        `bg-blue-500 p-2 ${disabled ? "opacity-40" : ""}`,
        className,
      )}
      disabled={disabled}
    >
      <Text className={cn("text-white", textClassName)}>{title}</Text>
    </Pressable>
  );
};

export default Button;
