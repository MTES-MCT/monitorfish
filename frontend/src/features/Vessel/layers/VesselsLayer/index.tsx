import { COLORS } from '@constants/constants'
import { MonitorFishMap } from '@features/Map/Map.types'
import { monitorfishMap } from '@features/Map/monitorfishMap'
import { VESSELS_VECTOR_LAYER } from '@features/Vessel/layers/VesselsLayer/constants'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { memo, useEffect } from 'react'

import { getVesselLastPositionVisibilityDates, Vessel } from '../../../../domain/entities/vessel/vessel'
import { theme } from '../../../../ui/theme'
import { booleanToInt, customHexToRGB } from '../../../../utils'
import { getWebGLVesselStyleVariables } from '../style'

function UnmemoizedVesselsLayer() {
  const areVesselsDisplayed = useMainAppSelector(state => state.displayedComponent.areVesselsDisplayed)
  const hideNonSelectedVessels = useMainAppSelector(state => state.vessel.hideNonSelectedVessels)
  const hideVesselsAtPort = useMainAppSelector(state => state.map.hideVesselsAtPort)
  const selectedBaseLayer = useMainAppSelector(state => state.map.selectedBaseLayer)
  const vesselsLastPositionVisibility = useMainAppSelector(state => state.map.vesselsLastPositionVisibility)

  const previewFilteredVesselsMode = useMainAppSelector(state => state.global.previewFilteredVesselsMode)
  const filters = useMainAppSelector(state => state.filter.filters)
  const nonFilteredVesselsAreHidden = useMainAppSelector(state => state.filter.nonFilteredVesselsAreHidden)
  const showedFilter = filters?.find(filter => filter.showed)

  useEffect(() => {
    // styles derived from state
    const isLight = Vessel.iconIsLight(selectedBaseLayer)
    const { vesselIsHidden, vesselIsOpacityReduced } =
      getVesselLastPositionVisibilityDates(vesselsLastPositionVisibility)
    const filterColorRGBArray = customHexToRGB(
      !!showedFilter?.color || isLight ? theme.color.lightGray : COLORS.charcoal
    )
    const initStyles = {
      filterColorBlue: filterColorRGBArray[2],
      filterColorGreen: filterColorRGBArray[1],
      filterColorRed: filterColorRGBArray[0],
      hideNonSelectedVessels: false,
      hideVesselsAtPort: false,
      isLight,
      nonFilteredVesselsAreHidden,
      previewFilteredVesselsMode,
      vesselIsHiddenTimeThreshold: vesselIsHidden.getTime(),
      vesselIsOpacityReducedTimeThreshold: vesselIsOpacityReduced.getTime()
    }
    const styleVariables = getWebGLVesselStyleVariables(initStyles)
    VESSELS_VECTOR_LAYER.updateStyleVariables(styleVariables)
    VESSELS_VECTOR_LAYER.name = MonitorFishMap.MonitorFishLayer.VESSELS

    monitorfishMap.getLayers().push(VESSELS_VECTOR_LAYER)

    return () => {
      // @ts-ignore
      monitorfishMap.removeLayer(VESSELS_VECTOR_LAYER)
      VESSELS_VECTOR_LAYER.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!areVesselsDisplayed) {
      // We can't use BaseLayer.setVisible() as it makes the drawing to crash
      VESSELS_VECTOR_LAYER.setOpacity(0)

      return
    }

    VESSELS_VECTOR_LAYER.setOpacity(1)
  }, [areVesselsDisplayed])

  // styles
  useEffect(() => {
    VESSELS_VECTOR_LAYER.updateStyleVariables({ hideVesselsAtPort: booleanToInt(hideVesselsAtPort) })
  }, [hideVesselsAtPort])

  useEffect(() => {
    VESSELS_VECTOR_LAYER.updateStyleVariables({ hideNonSelectedVessels: booleanToInt(hideNonSelectedVessels) })
  }, [hideNonSelectedVessels])

  useEffect(() => {
    VESSELS_VECTOR_LAYER.updateStyleVariables({ previewFilteredVesselsMode: booleanToInt(previewFilteredVesselsMode) })
  }, [previewFilteredVesselsMode])

  useEffect(() => {
    const isLight = Vessel.iconIsLight(selectedBaseLayer)
    VESSELS_VECTOR_LAYER.updateStyleVariables({ isLight: booleanToInt(isLight) })
  }, [selectedBaseLayer])

  useEffect(() => {
    const { vesselIsHidden, vesselIsOpacityReduced } =
      getVesselLastPositionVisibilityDates(vesselsLastPositionVisibility)
    VESSELS_VECTOR_LAYER.updateStyleVariables({
      vesselIsHiddenTimeThreshold: vesselIsHidden.getTime(),
      vesselIsOpacityReducedTimeThreshold: vesselIsOpacityReduced.getTime()
    })
  }, [vesselsLastPositionVisibility])
  // end styles

  return null
}

export const VesselsLayer = memo(UnmemoizedVesselsLayer)
VesselsLayer.displayName = 'VesselsLayer'
