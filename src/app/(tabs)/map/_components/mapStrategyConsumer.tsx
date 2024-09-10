import { ActivityIndicator, Pressable, Text, TouchableWithoutFeedback, View } from "react-native";
import { MapStrategies } from "../_interfaces";
import MapView, { Callout, MapMarkerProps, Marker, Region } from "react-native-maps";
import { isMoveMarkerMapStrategy, isViewMarkersMapStrategy } from "../_useMapStrategy";
import Constants from "expo-constants";
import useLocation from "../../../../hooks/useLocation";
import { Image } from "expo-image";
import { styled } from "nativewind";

const CustomCallout = styled(View, "bg-white p-3 rounded-lg shadow-md border border-gray-300 w-auto h-auto");


interface CustomMarkerProps extends MapMarkerProps {
  isFocused: boolean,
  mainPhotoId: number,
  mainPhotoBlurHash: string,
  onDispayPreviewPress: () => void,
}

const CustomMarker = (props: CustomMarkerProps) => {
  console.log({ props })
  return (
    <Marker
      {...props}
      pinColor={props.isFocused ? 'blue' : 'red'}
      description="jdjdjdj"
      className="flex flex-row w-auto"
    >
      <Callout tooltip onPress={props.onDispayPreviewPress}>
        <CustomCallout>
          <Image
            className="w-40 h-40"
            contentFit="contain"
            source={Constants?.expoConfig?.extra?.apiUrl + "/uploads/" + props.mainPhotoId}
            placeholder={{ blurhash: props.mainPhotoBlurHash }}
            cachePolicy="memory"
          />
          <Pressable>
            {({ pressed }) => (
              <View className={`flex-1 bg-indigo-500 p-4 ${pressed ? 'opacity-50' : ''}`}>
                <Text>{">"}</Text>
              </View>
            )}
          </Pressable>
        </CustomCallout>
      </Callout>
    </Marker>
  )
}

const mapStyle =
[
  {
    "featureType": "poi",
    "elementType": "labels",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
]

type MapStrategyConsumerProps = MapStrategies & {
  onMarkerPreviewClick: (key: string) => void,
}

const MapStrategyConsumer = (strategy: MapStrategyConsumerProps) => {
  const { location, isPending, error } = useLocation();

  if (!location || isPending || error) {
    return (
    <View className="flex justify-center flex-1 h-full">
      <ActivityIndicator size="large" color="#00ff00" />
    </View>
    );
  }

  const onRegionChange = (region: Region) => {
    if (isMoveMarkerMapStrategy(strategy)) {
      strategy.onChangeMarkerPlacement(region);
    }
  }

  let customMarker = null;
  if (isMoveMarkerMapStrategy(strategy) && strategy.movedMarkerCoordinates) {
    // Zamiast podazac za widokiem, lepiej zeby bylo draggable (draggable prop)
    customMarker = (
      <Marker
        key="jdjd"
        pinColor={'green'}
        coordinate={{ latitude: strategy.movedMarkerCoordinates.lat, longitude: strategy.movedMarkerCoordinates.long }}
      />
    )
  }

  const focusedMarkerKey = isViewMarkersMapStrategy(strategy) && strategy.focusedMarker?.key;

  return (
    <TouchableWithoutFeedback
      onPressIn={strategy.onPressOutsideMarker}
    >
    <MapView
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
      onRegionChange={onRegionChange}
    >
        {strategy.markers.map((marker, index) => (
        <CustomMarker
          mainPhotoBlurHash={marker.mainPhotoBlurhash}
          mainPhotoId={marker.mainPhotoId}
          isFocused={focusedMarkerKey === marker.key}
          key={marker.key}
          coordinate={marker.coordinate}
          onPress={(event) => {
            strategy.onPressInsideMarker(event, index)
          }}
          onDispayPreviewPress={() => {
            strategy.onMarkerPreviewClick(marker.key)
          }}
        >

        </CustomMarker>
        ))}
        {customMarker}
    </MapView>
    </TouchableWithoutFeedback>
    )
  };

export default MapStrategyConsumer;