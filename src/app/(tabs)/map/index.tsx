import { ActivityIndicator, Pressable, Text, TouchableWithoutFeedback, View, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import MapView, { Marker, MarkerPressEvent } from "react-native-maps";

import * as Location from "expo-location";
import Button from "../../../ui/button";
import { router, useNavigation } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useAxios } from "../../../hooks/use-axios";
import { _getAllMarkersCoordinates } from "../../../api/markers";

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

type MarkerViewProps = {
  pointCount: number,
  text: string,
}

const MarkerView = (props: MarkerViewProps) => {
  // @TODO: Slide from right, slide out
  

  return (
    <View
      className="justify-between w-64 p-4"
    >
      <View className="flex flex-col gap-y-10">
        <View className="relative w-full aspect-square bg-green-950">
          <View
            className="absolute right-0 p-1 rounded-l-lg top-2 bg-slate-100">
            <Text>${props.pointCount}</Text>
          </View>
        </View>
        <View>
          <Button
            onPress={() => { }}
            title="Wesprzyj punktami"
            buttonClassName="items-center"
          />

        </View>
        <Text>
          {props.text}
        </Text>
      </View>
      <Button onPress={() => { }} title="Potwierdz wykonanie" buttonClassName="items-center"></Button>
    </View>
  )
}

const useMarkersQuery = () => {
  const axios = useAxios();
  const { isPending, error, data, refetch } = useQuery({
    queryKey: ["allMarkersCoordinates"],
    queryFn: () => _getAllMarkersCoordinates(axios),
    initialData: [],
  });
  const result = []
  console.log({ data })
  for (const entry of data) {
    result.push(
      {
        key: "g",
        coordinate: {
          latitude: entry.lat,
          longitude: entry.long,
        },
        pointCount: 42069,
        text: "To jest tekst powiązany ze znacznikiem"
      }
    );
  }
  return { isPending, error, data: result, refetch }
};

const Map = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const { isPending, error, data: markers, refetch } = useMarkersQuery()

  useEffect(() => {
    (async () => {
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      
      setTimeout(() => {
        setLocation(location);
      }, 2000)
    })();
  }, []);

  let text = 'Waiting..';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  const [displayMarkerIndex, setDisplayMarkerIndex] = useState<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      setDisplayMarkerIndex(undefined)
    } 
  }, [])

  if (!location) {
    return (
      <View className="flex justify-center flex-1 h-full">
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }

  const onMarkerPress = (event: MarkerPressEvent, index: number) => {
    event.preventDefault();
    event.stopPropagation();
    console.log({ index })
    setDisplayMarkerIndex(index);
  }

  return (
    <>
      {/* @TODO: find better status bar placeholder */}
      {/* <View className="h-8" /> */}
      <View className="relative flex flex-row flex-1">
        <TouchableWithoutFeedback
          onPressIn={() => setDisplayMarkerIndex(undefined)}
        >
          <MapView
            customMapStyle={mapStyle}
            provider={undefined}
            className="flex-1 h-full"
            showsUserLocation
            region={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
          >
            {markers.map((marker, index) => (
              <Marker
                key={marker.key}
                coordinate={marker.coordinate}
                onPress={(event) => onMarkerPress(event, index)}
              >

              </Marker>
            ))}
          </MapView>
        </TouchableWithoutFeedback>
        {displayMarkerIndex !== undefined ? (
          <MarkerView {...markers[displayMarkerIndex]} />
        ) : null}
        <Pressable className="z-10" onPressOut={() => router.replace('map/createMarker')}>
          {({ pressed }) => (
            <View
              style={{ opacity: pressed ? 0.5 : 1 }}
              className="absolute items-center justify-center w-16 h-16 bg-white rounded-full bottom-4 right-4"
            >
              <Text className="text-center">Gdize jest ten tekst?</Text>  
            </View>
          )}
        </Pressable>
      </View>
    </>
  );
};

export default Map;
