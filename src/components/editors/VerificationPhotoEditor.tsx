import { Image } from "expo-image";
import { useEffect, useState } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import * as ImagePicker from "expo-image-picker";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";

import Button from "@ui/button";
import Fabs from "@ui/Fabs";

const AnimatedExpoImage = Animated.createAnimatedComponent(Image);

const VerificationPhotoEditor = ({
  newPhotoUri,
  originalPhotoUri,
  commit,
}: {
  newPhotoUri?: string;
  originalPhotoUri: string;
  commit: (uri: string) => Promise<void>;
}) => {
  const [tempPhotoUri, setTempPhotoUri] = useState(newPhotoUri);
  const tempPhotoWidth = useSharedValue(0);
  const totalScreenWidth = useSharedValue(0);

  const onPhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      setTempPhotoUri(result.assets[0].uri);
    }
  };

  useEffect(() => {
    if (!tempPhotoUri) {
      onPhoto();
    }
  }, []);

  const pan = Gesture.Pan().onChange((value) => {
    console.log({ value, a: tempPhotoWidth.value, b: totalScreenWidth.value });
    const newValue = tempPhotoWidth.value + value.changeX;
    if (
      newValue < totalScreenWidth.value &&
      newValue > totalScreenWidth.value * 0.2
    ) {
      tempPhotoWidth.value = newValue;
    }
  });

  const animatedStyles = useAnimatedStyle(() => ({
    width: tempPhotoWidth.value,
  }));

  const handleLayout = (event: any) => {
    event.target?.measure((_: number, _1: number, width: number) => {
      totalScreenWidth.value = width;
      tempPhotoWidth.value = width / 2;
    });
  };

  const onCommitPress = async (tempPhotoUri: string) => {
    await commit(tempPhotoUri);
    // reset
    setTempPhotoUri(undefined);
    tempPhotoWidth.value = totalScreenWidth.value / 2;
  };

  const fabButtons = [];
  if (!tempPhotoUri) {
    fabButtons.push(<Button title="Zrób zdjęcie" onPress={onPhoto} />);
  } else {
    fabButtons.push(
      <Button title="Akceptuj" onPress={() => onCommitPress(tempPhotoUri)} />,
      <Button title="Powtórz" onPress={onPhoto} />,
    );
  }

  return (
    <GestureHandlerRootView className="relative flex-1" onLayout={handleLayout}>
      <Image
        className="h-full"
        source={{
          uri: originalPhotoUri,
        }}
      />
      {tempPhotoUri && (
        <GestureDetector gesture={pan}>
          <AnimatedExpoImage
            style={animatedStyles}
            className="h-full border border-red-600 absolute bg-left bg-contain"
            source={{
              uri: tempPhotoUri,
            }}
          />
        </GestureDetector>
      )}
      <Fabs>{fabButtons}</Fabs>
    </GestureHandlerRootView>
  );
};

export default VerificationPhotoEditor;
