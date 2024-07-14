import { useState } from "react";

type contentSheetStates = 'hidden' | 'minimal' | 'fullscreen'
type contentSheetStrategies = 'createMarkerEditor' | 'previewMarker' | undefined


type ContentSheetStrategyBase = {
  strategyName?: string,
  title: string,
  makeFullscreen: () => void,
  makeHidden: () => void,
  makeMinimal: () => void,
  makePreviewMarker: (previewMarkerId: string) => void,
  contentSheetState: contentSheetStates,
}

type ContentSheetPreviewMarkerStrategy = ContentSheetStrategyBase & {
  strategyName: 'previewMarker',
  title: string,
  previewedMarkerId?: string,
}

const useContentSheetStrategy = () => {
  const [previewedMarkerId, setPreviewedMarkerId] = useState<string>();
  const [contentSheetStrategy, setContentSheetStrategy] = useState<contentSheetStrategies>()
  const [contentSheetState, setcontentSheetState] = useState<contentSheetStates>('hidden');
  
  const makeFullscreen = () => {
    setcontentSheetState('fullscreen')
  }
  
  const makeHidden = () => {
    setcontentSheetState('hidden')
  }
  
  const makeMinimal = () => {
    setcontentSheetState('minimal')
  }
  
  const makePreviewMarker = (previewedMarkerId: string) => {
    setContentSheetStrategy('previewMarker');
    setPreviewedMarkerId(previewedMarkerId);
    setcontentSheetState('fullscreen');
  }
  
  const changeContentSheetStrategy = (strategy: contentSheetStrategies, payload?: any) => {
    setContentSheetStrategy(strategy);
    if (payload?.previewedMarkerId) {
      setPreviewedMarkerId(payload.previewedMarkerId)
    }
  }
  
  const common = {
    strategyName: '',
    title: '',
    makeFullscreen,
    makeHidden,
    makeMinimal,
    makePreviewMarker,
    contentSheetState,
  }
  
  const strategyMap = {
    createMarkerEditor: {
      ...common,
      strategyName: 'createMarkerEditor',
      title: 'Create makrer'
    },
    previewMarker: {
      ...common,
      strategyName: 'previewMarker',
      title: 'View marker',
      previewedMarkerId,
    } satisfies ContentSheetPreviewMarkerStrategy,
  }
  
  const strategy = contentSheetStrategy ? strategyMap[contentSheetStrategy] : common;
  
  
  return [strategy, changeContentSheetStrategy] as const
}


export const isContentSheetCreateMarkerStrategy = (strategy: any): strategy is any => {
  return strategy.strategyName === 'createMarkerEditor'
}

export const isContentSheetPreviewMarkerStrategy = (strategy: any): strategy is ContentSheetPreviewMarkerStrategy => {
  return strategy.strategyName === 'previewMarker'
}

export default useContentSheetStrategy  