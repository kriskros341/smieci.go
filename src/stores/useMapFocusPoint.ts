import { LatLng } from "react-native-maps"
import { create } from "zustand"

type MapRegionStoreType = {
  mapFocusPoint?: LatLng,
  changeMapFocusPoint: (useMapFocusPoint: LatLng) => void,
}

export const useMapFocusPoint = create<MapRegionStoreType>((set) => ({
  mapFocusPoint: undefined,
  changeMapFocusPoint: (changes) => set(({ mapFocusPoint }) => {
    return {mapFocusPoint: { ...mapFocusPoint, ...changes }}
  }),
}))