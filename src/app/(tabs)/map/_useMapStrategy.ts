import { debounce } from "lodash-es"
import { useMemo, useState } from "react"
import { MapStrategies, MapStrategyKey, MarkerState, MoveMarkerMapStrategy, ViewMarkersMapStrategy } from "./_interfaces"
import { useMarkersQuery } from "../../../hooks/useMarkersQuery"
import { MarkerPressEvent, Region } from "react-native-maps"

export const isMoveMarkerMapStrategy = (strategy: MapStrategies): strategy is MoveMarkerMapStrategy => {
    return strategy.strategyName === 'moveMarkerStrategy'
}

export const isViewMarkersMapStrategy = (strategy: MapStrategies): strategy is ViewMarkersMapStrategy => {
    return strategy.strategyName === 'viewMarkersStrategy'
}

// Reinicjalizowanie mapy jest kosztowne. Trzeba dugo czekac itd. Lepiej podmienic zestaw propsow niz tworzyc osobny komponent
export const useMapStrategy = () => {
    const [movedMarkerCoordinates, setMovedMarkerCoordinates] = useState<{ lat: number, long: number }>();
  
    const [focusedMarker, setFocusedMarker] = useState<MarkerState>();
    const { data: markers, refetch } = useMarkersQuery();
    const [selectedStrategyKey, setSelectedStrategyKey] = useState<MapStrategyKey>('viewMarkersStrategy')
  
    const onPressInsideMarker = (event: MarkerPressEvent, index: number) => {
      setFocusedMarker(markers[index]);
    }
  
    const changeStrategy = <K extends MapStrategyKey>(selectedStrategyKey: K, strategyChanges?: Partial<typeof mapStrategy[K]>) => {
      setSelectedStrategyKey(selectedStrategyKey);
      if (strategyChanges) {
        Object.entries(strategyChanges).forEach(([key, value]) => {
          if (key === 'movedMarkerCoordinates') {
            setMovedMarkerCoordinates(value)
          }
        })
      }
    }
  
    const onChangeMarkerPlacement = (region?: Region) => {
      if (!region) {
        return;
      }
      const movedMarkerCoordinates = {
        lat: region.latitude,
        long: region.longitude,
      };
      
      changeStrategy("moveMarkerStrategy", { movedMarkerCoordinates });
    }
  
    // Objekt grupujacy mozliwe stany
    const mapStrategy = useMemo(() => ({
      viewMarkersStrategy: {
        strategyName: 'viewMarkersStrategy',
        markers,
        onPressInsideMarker,
        onPressOutsideMarker: () => setFocusedMarker(undefined),
        focusedMarker,
      } as const satisfies ViewMarkersMapStrategy,
      moveMarkerStrategy: {
        strategyName: 'moveMarkerStrategy',
        markers: [],
        onPressInsideMarker: () => { },
        onPressOutsideMarker: () => { },
        onChangeMarkerPlacement: debounce(onChangeMarkerPlacement, 200),
        movedMarkerCoordinates,
      } satisfies MoveMarkerMapStrategy,
    } as const), [markers, focusedMarker, movedMarkerCoordinates]);
  
    const currentStrategy = mapStrategy[selectedStrategyKey];
    
    return [currentStrategy, changeStrategy, refetch] as const;
  }