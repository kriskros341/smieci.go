import { styled } from "nativewind";
import * as React from "react";
import { useRef, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import MapView, {
  Callout,
  MapMarkerProps,
  Marker,
  Region,
} from "react-native-maps";

import { _getMarkersInRegion } from "@api/markers";
import { Entypo } from "@expo/vector-icons";
import { useAxios } from "@hooks/use-axios";
import useLocation from "@hooks/useLocation";
import { MapStrategies } from "@hooks/useMapStrategy.interfaces";
import { useMapFocusPoint } from "@stores/useMapFocusPoint";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getUriByUploadId } from "@utils/getUriFromPhotoId";
import {
  hasCoords,
  isMoveMarkerMapStrategy,
  isViewMarkersMapStrategy,
} from "@utils/hasCoords";
import { Image } from "expo-image";

const CustomCallout = styled(
  View,
  "bg-white rounded-lg shadow-md border border-gray-300 w-auto h-auto p-3",
);

interface CustomMarkerProps extends MapMarkerProps {
  externalObjectId: any;
  isFocused: boolean;
  mainPhotoId?: number;
  markerId: number;
  verificationStatus: string | null
  status: string | null;
  solvedAt?: unknown;
  mainPhotoBlurHash?: string;
  onDispayPreviewPress: () => void;
}

// const FOCUSED_MARKER_COLOR = "red";
const OPEN_MARKER_COLOR = "blue";
const PENDING_MARKER_COLOR = "yellow";
const APPROVED_MARKER_COLOR = "#10a37f";
const DENIED_MARKER_COLOR = "red";

const CustomMarker = (props: CustomMarkerProps) => {
  // VerificationStatus = solution
  // Status = marker
  console.log("aa", props.solvedAt)
  let color = OPEN_MARKER_COLOR;
  if (props.status === 'denied') {
    color = DENIED_MARKER_COLOR
  } else if (props.solvedAt) {
    color = APPROVED_MARKER_COLOR; // Zatwierdzony
  } else if (props.verificationStatus === "pending") {
    color = PENDING_MARKER_COLOR; // czeka na ręczną weryfikację.
  }

  const imageSrc = getUriByUploadId(props.mainPhotoId);

  return (
    <Marker {...props} className="flex flex-row w-auto">
      <View>
        <Entypo name="trash" color={color} size={32} />
      </View>
      <Callout tooltip onPress={props.onDispayPreviewPress}>
        <CustomCallout>
          <>
            {props.externalObjectId ? (
              <View>
                <Text>Znacznik z systemu rządowego</Text>
              </View>
            ) : (
              <View>
                <Image
                  className="w-40 h-40"
                  contentFit="contain"
                  source={imageSrc}
                  placeholder={{ blurhash: props.mainPhotoBlurHash }}
                  cachePolicy="memory"
                />
              </View>
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
    elementType: "all",
    stylers: [
      {
        visibility: "off",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "all",
    stylers: [
      {
        visibility: "simplified",
      },
    ],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [
      {
        visibility: "simplified",
      },
    ],
  },
  {
    elementType: "geometry",
    stylers: [
      {
        color: "off",
      },
    ],
  },
];

type MapStrategyConsumerProps = {
  strategy: MapStrategies;
  onMarkerPreviewClick: (id: number) => void;
  filterConfig?: {
    showResolved: boolean,
    showDenied: boolean,
  }
};

type Markerr = {
  blurhash?: string;
  externalObjectId?: number;
  id: number;
  lat: number;
  long: number;
  status: string;
  solvedAt?: unknown | null,
  verificationStatus?: string | null;
  mainPhotoBlurhash?: string;
  mainPhotoId?: number;
  
};

const useMarkersInRegion = (mapRegion?: Region, filterConfig?: { showResolved: boolean, showDenied: boolean }) => {
  const axios = useAxios();
  const queryClient = useQueryClient();

  // Query key for the current region
  const regionQueryKey = ["/markers", "get-markers-in-region", mapRegion, filterConfig];

  // Centralized cache for all markers
  const markersCacheKey = ["/markers", "all-markers"];

  const result = useQuery({
    queryKey: regionQueryKey,
    queryFn: async () => {
      if (!mapRegion) return [];
      const newMarkers = await _getMarkersInRegion(axios, mapRegion, filterConfig);

      const cache: Map<number, Markerr> =
        queryClient.getQueryData(markersCacheKey) ?? new Map<number, Markerr>();

      let hasNew = false;
      newMarkers.forEach((marker) => {
        if (!cache.has(marker.id)) {
          hasNew = true;
          cache.set(marker.id, marker);
        }
      });

      if (hasNew) {
        queryClient.setQueryData(markersCacheKey, cache);
      }

      return Array.from(cache.values());
    },
    placeholderData: keepPreviousData,
  });

  React.useEffect(() => {
    const cache: Map<number, Markerr> =
      queryClient.getQueryData(markersCacheKey) ?? new Map<number, Markerr>();
    cache.clear()
    result.refetch();
  }, [filterConfig]);

  React.useEffect(() => {
    result.refetch();
  }, [mapRegion]);

  return result;
};

const MapStrategyConsumer = ({
  strategy,
  onMarkerPreviewClick,
  filterConfig
}: MapStrategyConsumerProps) => {
  const { changeMapFocusPoint, mapFocusPoint } = useMapFocusPoint();
  const mapRef = useRef<MapView>(null);
  const [mapRegion, setMapRegion] = useState<Region>();

  const { data, isFetching } = useMarkersInRegion(mapRegion, filterConfig);

  const { location, isPending, error } = useLocation();

  if (!location || isPending || error) {
    return (
      <View className="flex justify-center flex-1 h-full">
        <ActivityIndicator size="large" color="#10a37f" />
      </View>
    );
  }

  const onRegionChange = async (region: Region) => {
    changeMapFocusPoint(region);
    setMapRegion(region);
  };

  let customMarker = null;
  if (isMoveMarkerMapStrategy(strategy) && hasCoords(mapFocusPoint)) {
    customMarker = (
      <Marker key="jdjd" pinColor="green" coordinate={mapFocusPoint} />
    );
  }

  return (
    <View className="flex-1">
      <MapView
        showsCompass={false}
        showsPointsOfInterest={false}
        showsScale={false}
        showsIndoors={false}
        maxZoomLevel={12} // Na zbytnim zoomie są artefakty
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
        {data?.map((marker) => (
          <CustomMarker
            markerId={marker.id}
            mainPhotoBlurHash={marker.mainPhotoBlurhash}
            mainPhotoId={marker.mainPhotoId}
            isFocused={
              isViewMarkersMapStrategy(strategy) &&
              marker.id === strategy.getFocusedMarkerId()
            }
            key={marker.id + (marker?.verificationStatus ?? "")}
            coordinate={{ latitude: marker.lat, longitude: marker.long }}
            onPress={(event) => {
              strategy.onPressInsideMarker?.(event, marker.id);
            }}
            onDispayPreviewPress={() => {
              onMarkerPreviewClick?.(marker.id);
            }}
            status={marker.status}
            verificationStatus={marker.verificationStatus ?? null}
            externalObjectId={marker.externalObjectId}
            solvedAt={marker.solvedAt}
          />
        ))}
        {customMarker}
      </MapView>
      {isFetching && (
        <View className="absolute flex justify-center w-10 h-10 bg-white opacity-75 top-3 left-3 align-center">
          <ActivityIndicator size="small" color="#10a37f" />
        </View>
      )}
    </View>
  );
};

export default MapStrategyConsumer;
