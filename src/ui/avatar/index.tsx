import { cn } from "@utils/cn";
import { Image } from "expo-image";
import * as React from "react";
import { Text, View } from "react-native";

interface AvatarProps {
  size?: number;
  borderWidth?: number;
  borderColor?: string;
  imageUrl?: string;
  blurhash?: string;
  initials?: string;
  backgroundColor?: string;
  textColor?: string;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  size = 50,
  borderWidth = 2,
  borderColor = "gray",
  imageUrl,
  blurhash,
  initials = "",
  backgroundColor = "bg-gray-300",
  textColor = "text-black",
  className = "",
}) => {
  const avatarSize = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  return (
    <View
      className={cn(
        `flex items-center justify-center ${backgroundColor}`,
        `border ${borderColor}`,
        className,
      )}
      style={{ ...avatarSize, borderWidth }}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          placeholder={{ blurhash }}
          style={{ ...avatarSize }}
          className="rounded-full"
        />
      ) : (
        <Text
          className={cn(`font-bold ${textColor}`)}
          style={{ fontSize: size / 2 }}
        >
          {initials}
        </Text>
      )}
    </View>
  );
};

export default Avatar;
