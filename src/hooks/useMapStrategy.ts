import { useState } from "react";
import { MarkerPressEvent } from "react-native-maps";

import {
  MapStrategyKey,
  MarkerState,
  MoveMarkerMapStrategy,
  ViewMarkersMapStrategy,
} from "./useMapStrategy.interfaces";
import { useMarkersQuery } from "./useMarkersQuery";

export const MAP_STRATEGY = {
  moveMarkerStrategy: "moveMarkerStrategy",
  viewMarkersStrategy: "viewMarkersStrategy",
  idle: "idle",
} as const;

// Reinicjalizowanie mapy jest kosztowne. Trzeba dugo czekac itd. Lepiej podmienic zestaw propsow niz tworzyc osobny komponent
export const useMapStrategy = () => {
  const [focusedMarker, setFocusedMarker] = useState<MarkerState>();
  const { data: markers, refetch } = useMarkersQuery();
  const [selectedStrategyKey, setSelectedStrategyKey] =
    useState<MapStrategyKey>("viewMarkersStrategy");

  const onPressInsideMarker = (event: MarkerPressEvent, index: number) => {
    setFocusedMarker(markers[index]);
  };

  const changeStrategy = <K extends MapStrategyKey>(selectedStrategyKey: K) => {
    setSelectedStrategyKey(selectedStrategyKey);
  };

  // Objekt grupujacy mozliwe stany
  const mapStrategy = {
    [MAP_STRATEGY.viewMarkersStrategy]: {
      strategyName: MAP_STRATEGY.viewMarkersStrategy,
      markers,
      focusedMarker,
      onPressInsideMarker,
      onPressOutsideMarker: () => setFocusedMarker(undefined),
    } as const satisfies ViewMarkersMapStrategy,
    [MAP_STRATEGY.moveMarkerStrategy]: {
      strategyName: MAP_STRATEGY.moveMarkerStrategy,
    } satisfies MoveMarkerMapStrategy,
    [MAP_STRATEGY.idle]: {
      strategyName: MAP_STRATEGY.idle,
    },
  };

  const currentStrategy = mapStrategy[selectedStrategyKey ?? MAP_STRATEGY.idle];

  return [currentStrategy, changeStrategy, refetch] as const;
};
