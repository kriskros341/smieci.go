import { ActivityIndicator, Pressable, Text, TouchableWithoutFeedback, View, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import MapView, { Circle, Marker, MarkerPressEvent } from "react-native-maps";

import * as Location from "expo-location";
import Button from "../../../ui/button";
import { router, useNavigation } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useAxios } from "../../../hooks/use-axios";
import { _getAllMarkersCoordinates } from "../../../api/markers";
import FloatingWindowContainer from '../../components/floatingWindowContainer';
import CreateMarkerEditor from "../../components/createMarkerEditor";

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
  const result = [];

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
  return { isPending, error, data: result, refetch };
};

// Potrzebne mi cos w stylu strategii zeby zdecydowac w jaki sposob zostanie uzyta mapa.
// Strategia bedzie zawierala komponenty MapContent oraz ActionButton

type ViewMarkersStrategy = {
  self: 'ViewMarkersStrategy',
  markers: {
    key: string;
    coordinate: {
        latitude: any;
        longitude: any;
    };
    pointCount: number;
    text: string;
  }[],
  onMarkerClick: (idx: number) => { }
}

type MoveMarkerStrategy = {
  self: 'MoveMarkerStrategy',
  fakeMarkerCoordinates: { lat: number, long: number } | undefined
}

type MapStrategy = ViewMarkersStrategy | MoveMarkerStrategy;

// ??


const MoveMarkerContent = ({ marker, userCoords }:  { marker: any, userCoords: { latitude: number, longitude: number } }) => {
  return (
    <>
      <Marker
        key={marker.key}
        coordinate={marker.coordinate}
      >
      </Marker>
      <Circle
        center={userCoords}
        radius={10} // calculate based on distance
      />
    </>
  )
}

const ViewMarkersContent = ({ markers, onMarkerPress }: { markers: any[], onMarkerPress: Function }) => {
  return (
    <>
      {markers.map((marker, index) => (
        <Marker
          key={marker.key}
          coordinate={marker.coordinate}
          onPress={(event) => onMarkerPress(event, index)}
        >

        </Marker>
      ))}
    </>
  )
}

const Map = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const { isPending, error, data: markers, refetch } = useMarkersQuery(); // Part of selectMarker stretegy
  const [fakeMarkerCoordinates, setFakeMarkerCoordinates] = useState<{ lat: number, long: number } | undefined>(undefined); // Part of moveMarker strategy

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

  type createMarkerModalStates = 'hidden' | 'minimized' | 'fullscreen'
  const [createMarkerModalState, setCreateMarkerModalState] = useState<createMarkerModalStates>('hidden')

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

  console.log({ createMarkerModalState })

  const mapContentType = createMarkerModalState === 'minimized' ? 'moveMarker' : 'viewMarkers'

  return (
    <>
      {/* @TODO: find better status bar placeholder */}
      <View className="h-8" />
      <View className="relative flex flex-1">
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
            {mapContentType === 'viewMarkers' ? (
              <ViewMarkersContent markers={markers} onMarkerPress={onMarkerPress} />
            ) : (
              <MoveMarkerContent marker={{ coordinates: fakeMarkerCoordinates, key: 'g' }} userCoords={location.coords} />
            )}
          </MapView>
        </TouchableWithoutFeedback>
        {/* {displayMarkerIndex !== undefined ? (
          <MarkerView {...markers[displayMarkerIndex]} />
        ) : null} */}
        {/* <Pressable className="z-10" onPressOut={() => router.replace('map/createMarker')}> */}
        <Pressable className="z-10" onPressOut={() => setCreateMarkerModalState('fullscreen')}>
          {({ pressed }) => (
            <View
              style={{ opacity: pressed ? 0.5 : 1 }}
              className="absolute items-center justify-center w-16 h-16 bg-white rounded-full bottom-4 right-4"
            >
              <Text className="text-center">Gdize jest ten tekst?</Text>  
            </View>
          )}
        </Pressable>
        <FloatingWindowContainer
          visibilityState={createMarkerModalState}
          onClose={() => {
            console.log({ jd: 'jd' })
            setCreateMarkerModalState('hidden')
          }} 
        >
          <CreateMarkerEditor
            modalVisibilityState={createMarkerModalState}
            fakeMarkerCoordinates={fakeMarkerCoordinates}
            onSubmit={() => {
              setCreateMarkerModalState('hidden')
              refetch()
            }}
            onMoveMarkerPress={(currentLocation) => {
              setCreateMarkerModalState('minimized');
              setFakeMarkerCoordinates(currentLocation)
              // create temproary marker in location from argument
              // replace markers overlay with moveMarker overlay
              // 
            }}
            onMoveMarkerConfirm={() => {
              setCreateMarkerModalState('fullscreen')
            }}
          />
        </FloatingWindowContainer>
      </View>
    </>
  );
};

export default Map;



/* Map handler idea:

MapHander
  Map - stays rendered
    MarkersOverlay
    LocationChooserOverlay
  Modal
    Changing location: hide modal and give callback to MapHandler

    const changeLocation = () => {
      modal.minimize()  // Chowa okno tak ze wystaje tylko jego gorna czesc.
                        // przeciagniecie oznacza onCancel
      props.setLocationModal(onSuccess: (location) => {
        changeEditorState({ location })
      })
    }

    */