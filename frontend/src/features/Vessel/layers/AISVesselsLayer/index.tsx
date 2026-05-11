import { FIVE_MINUTES } from '@api/APIWorker'
import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { useWebGLLayerVisibility } from '@features/Map/hooks/useWebGLLayerVisibility'
import { monitorfishMap } from '@features/Map/monitorfishMap'
import { AIS_VESSELS_VECTOR_LAYER } from '@features/Vessel/layers/AISVesselsLayer/constants'
import { getWebGLAISVesselStyleVariables } from '@features/Vessel/layers/AISVesselsLayer/style'
import { VesselFeature } from '@features/Vessel/types/vessel'
import { renderAISVesselFeatures } from '@features/Vessel/useCases/rendering/renderAISVesselFeatures'
import { useGetAISVesselsQuery } from '@features/Vessel/vesselApi'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Level } from '@mtes-mct/monitor-ui'
import { memo, useEffect } from 'react'

import { booleanToInt } from '../../../../utils'

function UnmemoizedAISVesselsLayer() {
  const dispatch = useMainAppDispatch()
  const areAISVesselsDisplayed = useMainAppSelector(state => state.displayedComponent.areAISVesselsDisplayed)
  const hideNonSelectedVessels = useMainAppSelector(state => state.vessel.hideNonSelectedVessels)
  const selectedBaseLayer = useMainAppSelector(state => state.map.selectedBaseLayer)
  const areVesselsNotInVesselGroupsHidden = useMainAppSelector(
    state => state.vesselGroup.areVesselsNotInVesselGroupsHidden
  )

  const {
    data: vessels,
    error,
    isError
  } = useGetAISVesselsQuery(undefined, {
    pollingInterval: FIVE_MINUTES
  })

  useEffect(() => {
    if (isError || !vessels) {
      if (error) {
        dispatch(
          addMainWindowBanner({
            children: (error as Error).message,
            closingDelay: 6000,
            isClosable: true,
            isFixed: true,
            level: Level.ERROR,
            withAutomaticClosing: true
          })
        )
      }

      return
    }

    renderAISVesselFeatures(vessels)
  }, [dispatch, isError, error, vessels])

  useEffect(() => {
    const isLight = VesselFeature.iconIsLight(selectedBaseLayer)
    const initStyles = {
      areVesselsNotInVesselGroupsHidden,
      hideNonSelectedVessels: false,
      isLight
    }
    AIS_VESSELS_VECTOR_LAYER.updateStyleVariables(getWebGLAISVesselStyleVariables(initStyles))

    monitorfishMap.getLayers().push(AIS_VESSELS_VECTOR_LAYER)

    return () => {
      // @ts-ignore
      monitorfishMap.removeLayer(AIS_VESSELS_VECTOR_LAYER)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useWebGLLayerVisibility(AIS_VESSELS_VECTOR_LAYER, areAISVesselsDisplayed)

  useEffect(() => {
    AIS_VESSELS_VECTOR_LAYER.updateStyleVariables({ hideNonSelectedVessels: booleanToInt(hideNonSelectedVessels) })
  }, [dispatch, hideNonSelectedVessels])

  useEffect(() => {
    const isLight = VesselFeature.iconIsLight(selectedBaseLayer)
    AIS_VESSELS_VECTOR_LAYER.updateStyleVariables({ isLight: booleanToInt(isLight) })
  }, [dispatch, selectedBaseLayer])

  return null
}

export const AISVesselsLayer = memo(UnmemoizedAISVesselsLayer)
AISVesselsLayer.displayName = 'AISVesselsLayer'
