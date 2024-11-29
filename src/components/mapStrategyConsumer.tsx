import { Image } from "expo-image";
import { styled } from "nativewind";
import * as React from "react";
import { useMemo, useRef, useState } from "react";
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
  LatLng,
  MapMarkerProps,
  Marker,
  Region,
} from "react-native-maps";

import { _getMarkersInRegion } from "@api/markers";
import { useAxios } from "@hooks/use-axios";
import useLocation from "@hooks/useLocation";
import { MapStrategies, MarkerState } from "@hooks/useMapStrategy.interfaces";
import { useMapFocusPoint } from "@stores/useMapFocusPoint";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@ui/badge";
import {
  hasCoords,
  isMoveMarkerMapStrategy,
  isViewMarkersMapStrategy,
} from "@utils/hasCoords";

const CustomCallout = styled(
  View,
  "bg-white p-3 rounded-lg shadow-md border border-gray-300 w-auto h-auto",
);

interface CustomMarkerProps extends MapMarkerProps {
  externalObjectId: any;
  isFocused: boolean;
  mainPhotoId: number;
  verificationStatus?: string | null;
  mainPhotoBlurHash: string;
  onDispayPreviewPress: () => void;
}

const AnimatedImage = Animated.createAnimatedComponent(Image);

const FOCUSED_MARKER_COLOR = "blue";
const OPEN_MARKER_COLOR = "red";
const PENDING_MARKER_COLOR = "yellow";
const APPROVED_MARKER_COLOR = "#10a37f";

const CustomMarker = (props: CustomMarkerProps) => {
  let color = OPEN_MARKER_COLOR;
  if (props.isFocused) {
    color = FOCUSED_MARKER_COLOR;
  } else if (props.verificationStatus === "approved") {
    color = APPROVED_MARKER_COLOR;
  } else if (props.verificationStatus === "pending") {
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
          <>
            {props.externalObjectId ? (
              <AnimatedImage
                className="w-40 h-40"
                contentFit="contain"
                sharedTransitionTag="preview"
                cachePolicy="memory"
              />
            ) : (
              <>
                <AnimatedImage
                  className="w-40 h-40"
                  contentFit="contain"
                  sharedTransitionTag="preview"
                  source={
                    process.env.EXPO_PUBLIC_API_URL +
                    "/uploads/" +
                    props.mainPhotoId
                  }
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
              </>
            )}
          </>
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

const isInRegion = (coordinate: LatLng, mapRegion?: Region) => {
  if (!mapRegion) {
    return false;
  }

  const { latitude, longitude, latitudeDelta, longitudeDelta } = mapRegion;

  const latMin = latitude - latitudeDelta / 2;
  const latMax = latitude + latitudeDelta / 2;
  const longMin = longitude - longitudeDelta / 2;
  const longMax = longitude + longitudeDelta / 2;

  return (
    coordinate.latitude >= latMin &&
    coordinate.latitude <= latMax &&
    coordinate.longitude >= longMin &&
    coordinate.longitude <= longMax
  );
};

const MapStrategyConsumer = ({
  strategy,
  onMarkerPreviewClick,
}: MapStrategyConsumerProps) => {
  const mapFocusPointStore = useMapFocusPoint();
  const { changeMapFocusPoint, mapFocusPoint } = mapFocusPointStore;
  const mapRef = useRef<MapView>(null);
  const [mapRegion, setMapRegion] = useState<Region>();
  const axios = useAxios();

  const { data } = useQuery({
    queryKey: ["get-markers-in-region", mapRegion],
    queryFn: () => {
      if (!mapRegion) {
        return [];
      }
      return _getMarkersInRegion(axios, mapRegion!);
    },
    refetchInterval: 5_000,
  });

  console.log({ data, mapRegion });

  const { location, isPending, error } = useLocation();

  const displayedMarkers: MarkerState[] = useMemo(
    () =>
      strategy.markers?.filter(({ coordinate }) =>
        isInRegion(coordinate, mapRegion),
      ) ?? [],
    [strategy.markers, mapRegion],
  );

  console.log(displayedMarkers);

  if (!location || isPending || error) {
    return (
      <View className="flex justify-center flex-1 h-full">
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }

  const onRegionChange = async (region: Region) => {
    // console.log(1);
    const screenuseMapFocusPoint =
      await mapRef.current?.pointForCoordinate(region)!;
    screenuseMapFocusPoint.y -= 100;
    const mapTransformedCenter = await mapRef.current?.coordinateForPoint(
      screenuseMapFocusPoint,
    )!;
    // console.log(mapTransformedCenter);
    changeMapFocusPoint(mapTransformedCenter);
    setMapRegion(region);
  };

  let customMarker = null;
  if (isMoveMarkerMapStrategy(strategy) && hasCoords(mapFocusPoint)) {
    customMarker = (
      <Marker key="jdjd" pinColor="green" coordinate={mapFocusPoint} />
    );
  }

  const nonUniqueKeys = strategy.markers?.filter(
    (marker) =>
      strategy.markers?.indexOf(marker) !==
      strategy.markers?.lastIndexOf(marker),
  );

  // console.log("rerendered!", nonUniqueKeys);
  return (
    <TouchableWithoutFeedback onPressIn={strategy.onPressOutsideMarker}>
      <MapView
        ref={mapRef}
        provider="google"
        customMapStyle={mapStyle}
        className="flex-1 h-full"
        showsUserLocation
        region={{
          latitude: location?.coords.latitude ?? 0,
          longitude: location?.coords.longitude ?? 0,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        zoomControlEnabled
        onRegionChangeComplete={onRegionChange}
        toolbarEnabled={false}
      >
        {displayedMarkers.map((marker) => (
          <CustomMarker
            mainPhotoBlurHash={marker.mainPhotoBlurhash}
            mainPhotoId={marker.mainPhotoId}
            isFocused={
              isViewMarkersMapStrategy(strategy) &&
              marker.key === strategy.getFocusedMarkerKey()
            }
            key={marker.key}
            coordinate={marker.coordinate}
            onPress={(event) => {
              strategy.onPressInsideMarker?.(event, marker.key);
            }}
            onDispayPreviewPress={() => {
              onMarkerPreviewClick?.(marker.key);
            }}
            verificationStatus={marker.verificationStatus}
            externalObjectId={marker.externalObjectId}
          />
        ))}
        {customMarker}
      </MapView>
    </TouchableWithoutFeedback>
  );
};

export default MapStrategyConsumer;
