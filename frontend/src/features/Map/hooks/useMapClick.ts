import { HIT_PIXEL_TO_TOLERANCE } from '@constants/constants'
import { clickOnMapFeature } from '@features/Map/useCases/clickOnMapFeature'
import { getTopmostFeatureAtPixel } from '@features/Map/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { platformModifierKeyOnly } from 'ol/events/condition'
import { useCallback, useEffect } from 'react'

import type { MainAppThunk } from '@store'
import type { MapBrowserEvent } from 'ol'
import type OpenLayerMap from 'ol/Map'

export function useMapClick(map: OpenLayerMap) {
  const dispatch = useMainAppDispatch()

  const handleClick = useCallback(
    (event: MapBrowserEvent<any>) => {
      if (!event) {
        return
      }

      const feature = getTopmostFeatureAtPixel(map, event.pixel, {
        hitTolerance: HIT_PIXEL_TO_TOLERANCE,
        layerFilter: layer => layer.get('isClickable') === true && layer.getOpacity() > 0
      })
      const isCtrl = platformModifierKeyOnly(event)
      dispatch(clickOnMapFeature({ ctrlKeyPressed: isCtrl, feature }) as unknown as MainAppThunk)
    },
    [dispatch, map]
  )

  useEffect(() => {
    map.on('click', handleClick)

    return () => {
      map.un('click', handleClick)
    }
  }, [map, handleClick])
}
