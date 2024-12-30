import { MarkerPressEvent } from "react-native-maps";

import { MAP_STRATEGY } from "./useMapStrategy";

export type MapStrategyKey = keyof typeof MAP_STRATEGY;

export type MapStrategyBase = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  strategyName: string & {};
  onPressOutsideMarker?: () => void;
  onPressInsideMarker?: (event: MarkerPressEvent, markerId: number) => void;
};

export type ViewMarkersMapStrategy = MapStrategyBase & {
  strategyName: typeof MAP_STRATEGY.viewMarkersStrategy;
  getFocusedMarkerId: () => number | undefined;
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
