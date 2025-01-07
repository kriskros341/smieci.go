import { cn } from "@utils/cn";
import * as React from "react";
import { Pressable, Text } from "react-native";

interface Props extends React.PropsWithChildren {
  onPress?: () => void;
  title: string;
  buttonClassName?: string;
  textClassName?: string;
  disabled?: boolean;
}

const Button: React.FC<Props> = ({
  onPress,
  title,
  disabled,
  buttonClassName,
  textClassName,
  children,
}) => {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "flex flex-row justify-center",
        "bg-blue-500 p-2",
        "rounded-lg",
        disabled && "opacity-40",
        buttonClassName,
      )}
      disabled={disabled}
    >
      {children}
      <Text className={cn("text-white", textClassName)}>{title}</Text>
    </Pressable>
  );
};

export default Button;
