import { LatLng } from "react-native-maps";
import {
  MapStrategies,
  MoveMarkerMapStrategy,
  ViewMarkersMapStrategy,
} from "@hooks/useMapStrategy.interfaces";
import { MAP_STRATEGY } from "@hooks/useMapStrategy";

export const hasCoords = (obj: any): obj is LatLng => {
  return obj?.latitude && obj?.longitude;
};

export const isMoveMarkerMapStrategy = (
  strategy: MapStrategies,
): strategy is MoveMarkerMapStrategy => {
  return strategy.strategyName === MAP_STRATEGY.moveMarkerStrategy;
};

export const isViewMarkersMapStrategy = (
  strategy: MapStrategies,
): strategy is ViewMarkersMapStrategy => {
  return strategy.strategyName === MAP_STRATEGY.viewMarkersStrategy;
};
