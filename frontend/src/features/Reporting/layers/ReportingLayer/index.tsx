import { MonitorFishMap } from '@features/Map/Map.types'
import { monitorfishMap } from '@features/Map/monitorfishMap'
import {
  REPORTINGS_LINE_VECTOR_LAYER,
  REPORTINGS_VECTOR_LAYER
} from '@features/Reporting/layers/ReportingLayer/constants'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { memo, useEffect } from 'react'

function UnmemoizedReportingLayer() {
  const isReportingLayerDisplayed = useMainAppSelector(state => state.displayedComponent.isReportingLayerDisplayed)

  useEffect(() => {
    REPORTINGS_VECTOR_LAYER.name = MonitorFishMap.MonitorFishLayer.REPORTING

    monitorfishMap.getLayers().push(REPORTINGS_VECTOR_LAYER)
    monitorfishMap.getLayers().push(REPORTINGS_LINE_VECTOR_LAYER)

    return () => {
      // @ts-ignore
      monitorfishMap.removeLayer(REPORTINGS_VECTOR_LAYER)
      REPORTINGS_VECTOR_LAYER.dispose()
      // @ts-ignore
      monitorfishMap.removeLayer(REPORTINGS_LINE_VECTOR_LAYER)
      REPORTINGS_LINE_VECTOR_LAYER.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isReportingLayerDisplayed) {
      // We can't use BaseLayer.setVisible() as it makes the drawing to crash
      REPORTINGS_VECTOR_LAYER.setOpacity(0)
      REPORTINGS_LINE_VECTOR_LAYER.setOpacity(0)

      return
    }

    REPORTINGS_VECTOR_LAYER.setOpacity(1)
    REPORTINGS_LINE_VECTOR_LAYER.setOpacity(1)
  }, [isReportingLayerDisplayed])

  return null
}

export const ReportingLayer = memo(UnmemoizedReportingLayer)
ReportingLayer.displayName = 'ReportingLayer'
