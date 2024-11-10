import React from "react";
import { View } from "react-native";

const Fabs = (props: any) => {
  // flex-gap nie działa za dobrze, a nativewind nie wspiera child selectora
  return (
    <View className="absolute bottom-16 flex flex-row justify-center items-center w-full">
      {React.Children.map(props.children, (child) => (
        <View className="ml-2">{child}</View>
      ))}
    </View>
  );
};

export default Fabs;
