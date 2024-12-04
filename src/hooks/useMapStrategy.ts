import { useState } from "react";
import { MarkerPressEvent } from "react-native-maps";

import {
  MapStrategyKey,
  MoveMarkerMapStrategy,
  ViewMarkersMapStrategy,
} from "./useMapStrategy.interfaces";

export const MAP_STRATEGY = {
  moveMarkerStrategy: "moveMarkerStrategy",
  viewMarkersStrategy: "viewMarkersStrategy",
  idle: "idle",
} as const;

// Reinicjalizowanie mapy jest kosztowne. Trzeba dugo czekac itd. Lepiej podmienic zestaw propsow niz tworzyc osobny komponent
export const useMapStrategy = () => {
  const [focusedMarkerId, setFocusedMarkerId] = useState<number>();
  const [selectedStrategyKey, setSelectedStrategyKey] =
    useState<MapStrategyKey>("viewMarkersStrategy");

  const onPressInsideMarker = (event: MarkerPressEvent, markerId: number) => {
    setFocusedMarkerId(markerId);
  };

  const changeStrategy = <K extends MapStrategyKey>(selectedStrategyKey: K) => {
    setSelectedStrategyKey(selectedStrategyKey);
  };

  // Objekt grupujacy mozliwe stany
  const mapStrategy = {
    [MAP_STRATEGY.viewMarkersStrategy]: {
      strategyName: MAP_STRATEGY.viewMarkersStrategy,
      getFocusedMarkerId: () => focusedMarkerId,
      onPressInsideMarker,
      onPressOutsideMarker: () => setFocusedMarkerId(undefined),
    } as const satisfies ViewMarkersMapStrategy,
    [MAP_STRATEGY.moveMarkerStrategy]: {
      strategyName: MAP_STRATEGY.moveMarkerStrategy,
    } satisfies MoveMarkerMapStrategy,
    [MAP_STRATEGY.idle]: {
      strategyName: MAP_STRATEGY.idle,
    },
  };

  const strategy = mapStrategy[selectedStrategyKey ?? MAP_STRATEGY.idle];

  return [strategy, changeStrategy] as const;
};
