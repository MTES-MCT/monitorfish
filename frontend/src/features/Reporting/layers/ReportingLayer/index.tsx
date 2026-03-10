import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { useMapLayer } from '@features/Map/hooks/useMapLayer'
import {
  REPORTINGS_LINE_VECTOR_LAYER,
  REPORTINGS_VECTOR_LAYER,
  REPORTINGS_VECTOR_SOURCE
} from '@features/Reporting/layers/ReportingLayer/constants'
import { useDisplayReportingsQuery } from '@features/Reporting/reportingApi'
import { reportingActions } from '@features/Reporting/slice'
import { ReportingSearchPeriod } from '@features/Reporting/types'
import { buildReportingFeature } from '@features/Reporting/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Level } from '@mtes-mct/monitor-ui'
import { memo, useCallback, useEffect, useRef } from 'react'

function UnmemoizedReportingLayer() {
  const dispatch = useMainAppDispatch()
  const isReportingLayerDisplayed = useMainAppSelector(state => state.displayedComponent.isReportingLayerDisplayed)
  const displayFilters = useMainAppSelector(state => state.reporting.displayFilters)
  const selectedReportingFeatureIds = useMainAppSelector(state => state.reporting.selectedReportingFeatureIds)

  const selectedReportingFeatureIdsRef = useRef(selectedReportingFeatureIds)
  useEffect(() => {
    selectedReportingFeatureIdsRef.current = selectedReportingFeatureIds
  }, [selectedReportingFeatureIds])

  const skipQuery =
    displayFilters.reportingPeriod === ReportingSearchPeriod.CUSTOM &&
    (!displayFilters.startDate || !displayFilters.endDate)

  const { data, error } = useDisplayReportingsQuery(displayFilters, { skip: skipQuery })

  useMapLayer(REPORTINGS_VECTOR_LAYER)
  useMapLayer(REPORTINGS_LINE_VECTOR_LAYER)

  const hideDisplayedOverlaysWhenFeatureFiltered = useCallback(() => {
    if (selectedReportingFeatureIdsRef.current.length > 0) {
      selectedReportingFeatureIdsRef.current
        .filter(id => !REPORTINGS_VECTOR_SOURCE.getFeatureById(id))
        .forEach(id => dispatch(reportingActions.toggleSelectedReportingFeatureId(id)))
    }
  }, [dispatch])

  useEffect(() => {
    if (!data) {
      return
    }

    const features = data.map(reporting => buildReportingFeature(reporting))
    REPORTINGS_VECTOR_SOURCE.clear(true)
    REPORTINGS_VECTOR_SOURCE.addFeatures(features)

    hideDisplayedOverlaysWhenFeatureFiltered()
  }, [data, dispatch, hideDisplayedOverlaysWhenFeatureFiltered])

  useEffect(() => {
    if (!error) {
      return
    }

    dispatch(
      addMainWindowBanner({
        children: (error as Error).message,
        closingDelay: 6000,
        isClosable: true,
        level: Level.ERROR,
        withAutomaticClosing: true
      })
    )
  }, [dispatch, error])

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
