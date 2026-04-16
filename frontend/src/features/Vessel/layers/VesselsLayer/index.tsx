import { useWebGLLayerVisibility } from '@features/Map/hooks/useWebGLLayerVisibility'
import { monitorfishMap } from '@features/Map/monitorfishMap'
import { VESSELS_VECTOR_LAYER } from '@features/Vessel/layers/VesselsLayer/constants'
import { VesselFeature } from '@features/Vessel/types/vessel'
import { renderLayersDependingOnVesselLayer } from '@features/Vessel/useCases/rendering/renderLayersDependingOnVesselLayer'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { memo, useEffect } from 'react'

import { booleanToInt } from '../../../../utils'
import { getWebGLVesselStyleVariables } from '../style'

function UnmemoizedVesselsLayer() {
  const dispatch = useMainAppDispatch()
  const areVesselsDisplayed = useMainAppSelector(state => state.displayedComponent.areVesselsDisplayed)
  const hideNonSelectedVessels = useMainAppSelector(state => state.vessel.hideNonSelectedVessels)
  const selectedBaseLayer = useMainAppSelector(state => state.map.selectedBaseLayer)
  const vesselGroupsIdsDisplayed = useMainAppSelector(state => state.vesselGroup.vesselGroupsIdsDisplayed)
  const previewFilteredVesselsMode = useMainAppSelector(state => state.global.previewFilteredVesselsMode)
  const areVesselsNotInVesselGroupsHidden = useMainAppSelector(
    state => state.vesselGroup.areVesselsNotInVesselGroupsHidden
  )

  useEffect(() => {
    const isLight = VesselFeature.iconIsLight(selectedBaseLayer)
    const initStyles = {
      areVesselsNotInVesselGroupsHidden,
      hideNonSelectedVessels: false,
      isLight,
      previewFilteredVesselsMode,
      vesselGroupsIdsDisplayed
    }
    VESSELS_VECTOR_LAYER.updateStyleVariables(getWebGLVesselStyleVariables(initStyles))

    monitorfishMap.getLayers().push(VESSELS_VECTOR_LAYER)

    return () => {
      // @ts-ignore
      monitorfishMap.removeLayer(VESSELS_VECTOR_LAYER)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useWebGLLayerVisibility(VESSELS_VECTOR_LAYER, areVesselsDisplayed)

  useEffect(() => {
    VESSELS_VECTOR_LAYER.updateStyleVariables({ hideNonSelectedVessels: booleanToInt(hideNonSelectedVessels) })
    dispatch(renderLayersDependingOnVesselLayer())
  }, [dispatch, hideNonSelectedVessels])

  useEffect(() => {
    VESSELS_VECTOR_LAYER.updateStyleVariables({ previewFilteredVesselsMode: booleanToInt(previewFilteredVesselsMode) })
    dispatch(renderLayersDependingOnVesselLayer())
  }, [dispatch, previewFilteredVesselsMode])

  useEffect(() => {
    const isLight = VesselFeature.iconIsLight(selectedBaseLayer)
    VESSELS_VECTOR_LAYER.updateStyleVariables({ isLight: booleanToInt(isLight) })
    dispatch(renderLayersDependingOnVesselLayer())
  }, [dispatch, selectedBaseLayer])

  return null
}

export const VesselsLayer = memo(UnmemoizedVesselsLayer)
VesselsLayer.displayName = 'VesselsLayer'
