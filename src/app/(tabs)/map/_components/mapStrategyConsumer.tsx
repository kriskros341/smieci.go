import { ActivityIndicator, Pressable, Text, TouchableWithoutFeedback, View } from "react-native";
import { MapStrategies } from "../_interfaces";
import MapView, { Callout, MapMarkerProps, Marker, Region } from "react-native-maps";
import { isMoveMarkerMapStrategy, isViewMarkersMapStrategy } from "../_useMapStrategy";
import useLocation from "../../../../hooks/useLocation";

interface CustomMarkerProps extends MapMarkerProps {
  isFocused: boolean,
  onDispayPreviewPress: () => void
}

const CustomMarker = (props: CustomMarkerProps) => {
  return (
    <Marker
      {...props}
      pinColor={props.isFocused ? 'blue' : 'red'}
      description="jdjdjdj"
      className="flex flex-row w-auto"
    >
      <Callout onPress={props.onDispayPreviewPress}>
        <View className="flex flex-row w-auto bg-blue-200 gap-4">
          <View style={{ display: 'flex', flexGrow: 1, flexShrink: 0, flexBasis: '100%' }}>
            <Text>Issuer: Kr</Text>

          </View>
          <Pressable>
            {({ pressed }) => (
              <View className={`flex-1 bg-indigo-500 p-4 ${pressed ? 'opacity-50' : ''}`}>
                <Text>{">"}</Text>
              </View>
            )}
          </Pressable>
        </View>
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