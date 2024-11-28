import { MarkerPressEvent } from "react-native-maps";

import { MAP_STRATEGY } from "./useMapStrategy";

export type MapStrategyKey = keyof typeof MAP_STRATEGY;

export type MarkerState = {
  externalObjectId: any;
  key: string;
  coordinate: {
    latitude: any;
    longitude: any;
  };
  pointCount: number;
  text: string;
  mainPhotoId: number;
  mainPhotoBlurhash: string;
  verificationStatus?: string,
};

export type MapStrategyBase = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  strategyName: string & {};
  markers?: MarkerState[];
  onPressOutsideMarker?: () => void;
  onPressInsideMarker?: (event: MarkerPressEvent, markerKey: string) => void;
};

export type ViewMarkersMapStrategy = MapStrategyBase & {
  strategyName: typeof MAP_STRATEGY.viewMarkersStrategy;
  markers: MarkerState[];
  getFocusedMarkerKey: () => string | undefined;
};

export type MoveMarkerMapStrategy = MapStrategyBase & {
  strategyName: typeof MAP_STRATEGY.moveMarkerStrategy;
};

export type IdleMarkerMapStrategy = MapStrategyBase & {
  strategyName: typeof MAP_STRATEGY.idle;
};

export type MapStrategies =
  | MapStrategyBase
  | ViewMarkersMapStrategy
  | MoveMarkerMapStrategy;
