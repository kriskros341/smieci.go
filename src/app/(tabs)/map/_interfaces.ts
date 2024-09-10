import { LatLng, MarkerPressEvent, Region } from "react-native-maps";

export type MapStrategyKey = 'viewMarkersStrategy' | 'moveMarkerStrategy'

export type MarkerState = {
  key: string;
  coordinate: {
      latitude: any;
      longitude: any;
  };
  pointCount: number;
  text: string;
  mainPhotoId: number,
  mainPhotoBlurhash: string,
}

export type MapStrategyBase = {
  markers: MarkerState[],
  onPressOutsideMarker: () => void,
  onPressInsideMarker: (event: MarkerPressEvent, markerIndex: number) => void,
}

export type ViewMarkersMapStrategy = MapStrategyBase & {
  focusedMarker?: MarkerState,
  strategyName?: 'viewMarkersStrategy',
}

export type MoveMarkerMapStrategy = MapStrategyBase & {
  strategyName: 'moveMarkerStrategy',
  onChangeMarkerPlacement: (region?: LatLng) => void,
  movedMarkerCoordinates?: { lat: number, long: number },
}

export type MapStrategies = ViewMarkersMapStrategy | MoveMarkerMapStrategy