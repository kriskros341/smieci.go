import { Image } from "expo-image";
import { styled } from "nativewind";
import { useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import MapView, {
  Callout,
  MapMarkerProps,
  Marker,
  Region,
} from "react-native-maps";

import useLocation from "@hooks/useLocation";
import { MapStrategies } from "@hooks/useMapStrategy.interfaces";
import { useMapFocusPoint } from "@stores/useMapFocusPoint";
import {
  hasCoords,
  isMoveMarkerMapStrategy,
  isViewMarkersMapStrategy,
} from "@utils/hasCoords";
import { Badge } from "@ui/badge";

const CustomCallout = styled(
  View,
  "bg-white p-3 rounded-lg shadow-md border border-gray-300 w-auto h-auto",
);

interface CustomMarkerProps extends MapMarkerProps {
  isFocused: boolean;
  mainPhotoId: number;
  verificationStatus?: string | null;
  mainPhotoBlurHash: string;
  onDispayPreviewPress: () => void;
}

const AnimatedImage = Animated.createAnimatedComponent(Image);

const FOCUSED_MARKER_COLOR = "blue"
const OPEN_MARKER_COLOR = "red"
const PENDING_MARKER_COLOR = "yellow"
const APPROVED_MARKER_COLOR = "#10a37f"

const CustomMarker = (props: CustomMarkerProps) => {
  console.log({ props })
  let color = OPEN_MARKER_COLOR
  if (props.isFocused) {
    color = FOCUSED_MARKER_COLOR
  } else if (props.verificationStatus === 'approved') {
    color = APPROVED_MARKER_COLOR
  } else if (props.verificationStatus === 'pending') {
    color = PENDING_MARKER_COLOR;
  }
  return (
    <Marker
      {...props}
      pinColor={color}
      description="jdjdjdj"
      className="flex flex-row w-auto"
    >
      <Callout tooltip onPress={props.onDispayPreviewPress}>
        <CustomCallout>
          <AnimatedImage
            className="w-40 h-40"
            contentFit="contain"
            sharedTransitionTag="preview"
            source={process.env.EXPO_PUBLIC_API_URL + "/uploads/" + props.mainPhotoId}
            placeholder={{ blurhash: props.mainPhotoBlurHash }}
            cachePolicy="memory"
          />
          <Pressable>
            {({ pressed }) => (
              <View
                className={`flex-1 bg-indigo-500 p-4 ${pressed ? "opacity-50" : ""}`}
              >
                <Badge className="bg-green">
                  <Text>{">"}</Text>
                </Badge>
              </View>
            )}
          </Pressable>
        </CustomCallout>
      </Callout>
    </Marker>
  );
};

const mapStyle = [
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
];

type MapStrategyConsumerProps = {
  strategy: MapStrategies;
  onMarkerPreviewClick: (s: string) => void;
};

const MapStrategyConsumer = ({
  strategy,
  onMarkerPreviewClick,
}: MapStrategyConsumerProps) => {
  const { mapFocusPoint, changeMapFocusPoint } = useMapFocusPoint();
  const mapRef = useRef<MapView>(null);
  const { location, isPending, error } = useLocation();

  if (!location || isPending || error) {
    return (
      <View className="flex justify-center flex-1 h-full">
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }

  const onRegionChange = async (region: Region) => {
    const screenuseMapFocusPoint =
      await mapRef.current?.pointForCoordinate(region)!;
    screenuseMapFocusPoint.y -= 100;
    const mapTransformedCenter = await mapRef.current?.coordinateForPoint(
      screenuseMapFocusPoint,
    )!;
    changeMapFocusPoint(mapTransformedCenter);
  };

  let customMarker = null;
  if (isMoveMarkerMapStrategy(strategy) && hasCoords(mapFocusPoint)) {
    customMarker = (
      <Marker key="jdjd" pinColor="green" coordinate={mapFocusPoint} />
    );
  }

  const focusedMarkerKey =
    isViewMarkersMapStrategy(strategy) && strategy.focusedMarker?.key;

  return (
    <TouchableWithoutFeedback onPressIn={strategy.onPressOutsideMarker}>
      <MapView
        ref={mapRef}
        customMapStyle={mapStyle}
        provider={undefined}
        className="flex-1 h-full"
        showsUserLocation
        region={{
          latitude: location?.coords.latitude ?? 0,
          longitude: location?.coords.longitude ?? 0,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        onRegionChangeComplete={onRegionChange}
      >
        {strategy.markers?.map((marker, index) => (
          <CustomMarker
            mainPhotoBlurHash={marker.mainPhotoBlurhash}
            mainPhotoId={marker.mainPhotoId}
            isFocused={focusedMarkerKey === marker.key}
            key={marker.key}
            coordinate={marker.coordinate}
            onPress={(event) => {
              strategy.onPressInsideMarker?.(event, index);
            }}
            onDispayPreviewPress={() => {
              onMarkerPreviewClick?.(marker.key);
            }}
            verificationStatus={marker.verificationStatus}
          />
        ))}
        {customMarker}
      </MapView>
    </TouchableWithoutFeedback>
  );
};

export default MapStrategyConsumer;
