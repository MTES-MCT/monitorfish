import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { useMapLayer } from '@features/Map/hooks/useMapLayer'
import { useWebGLLayerVisibility } from '@features/Map/hooks/useWebGLLayerVisibility'
import { usePinnedReportings } from '@features/Reporting/hooks/usePinnedReportings'
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
import { memo, useCallback, useEffect, useMemo, useRef } from 'react'

function UnmemoizedReportingLayer() {
  const dispatch = useMainAppDispatch()
  const isReportingLayerDisplayed = useMainAppSelector(state => state.displayedComponent.isReportingLayerDisplayed)
  const displayFilters = useMainAppSelector(state => state.reporting.displayFilters)
  const selectedReportingFeatureId = useMainAppSelector(state => state.reporting.selectedReportingFeatureId)
  const { pinnedReportings, pinnedReportingsError } = usePinnedReportings()

  const selectedReportingFeatureIdRef = useRef(selectedReportingFeatureId)
  useEffect(() => {
    const previousSelectedReportingFeatureId = selectedReportingFeatureIdRef.current
    selectedReportingFeatureIdRef.current = selectedReportingFeatureId

    trySetFeatureSelected(previousSelectedReportingFeatureId, false)
    trySetFeatureSelected(selectedReportingFeatureId, true)
  }, [selectedReportingFeatureId])

  const skipQuery =
    displayFilters.reportingPeriod === ReportingSearchPeriod.CUSTOM &&
    (!displayFilters.startDate || !displayFilters.endDate)

  const { data: filteredReportings, error: filteredReportingsError } = useDisplayReportingsQuery(displayFilters, {
    skip: skipQuery
  })

  const displayedReportings = useMemo(() => {
    if (!isReportingLayerDisplayed) {
      return pinnedReportings ?? []
    }

    const filteredReportingIds = new Set((filteredReportings ?? []).map(d => d.id))

    return [...(filteredReportings ?? []), ...(pinnedReportings ?? []).filter(d => !filteredReportingIds.has(d.id))]
  }, [pinnedReportings, filteredReportings, isReportingLayerDisplayed])

  useMapLayer(REPORTINGS_VECTOR_LAYER)
  useMapLayer(REPORTINGS_LINE_VECTOR_LAYER)
  useWebGLLayerVisibility(REPORTINGS_VECTOR_LAYER, isReportingLayerDisplayed || !!pinnedReportings?.length)
  useWebGLLayerVisibility(REPORTINGS_LINE_VECTOR_LAYER, isReportingLayerDisplayed || !!pinnedReportings?.length)

  const hideDisplayedOverlaysWhenFeatureFiltered = useCallback(() => {
    const id = selectedReportingFeatureIdRef.current

    if (id === undefined) {
      return
    }

    // Still displayed, nothing to unselect
    if (REPORTINGS_VECTOR_SOURCE.getFeatureById(id)) {
      return
    }

    dispatch(reportingActions.toggleSelectedReportingFeatureId(id))
  }, [dispatch])

  useEffect(() => {
    const features = displayedReportings
      // If the coordinates is a a valid WGS84, the backend return an empty list,
      // we need to filter them as we can't display them on map
      .filter(reporting => reporting.coordinates?.length === 2)
      .map(reporting => buildReportingFeature(reporting))
    REPORTINGS_VECTOR_SOURCE.clear(true)
    REPORTINGS_VECTOR_SOURCE.addFeatures(features)

    // The source was just rebuilt from scratch (every feature starts unselected), so the selected feature's
    // marker highlight needs reapplying here too, not just when selectedReportingFeatureId itself changes.
    trySetFeatureSelected(selectedReportingFeatureIdRef.current, true)

    hideDisplayedOverlaysWhenFeatureFiltered()
  }, [displayedReportings, dispatch, hideDisplayedOverlaysWhenFeatureFiltered])

  useEffect(() => {
    if (!filteredReportingsError && !pinnedReportingsError) {
      return
    }

    dispatch(
      addMainWindowBanner({
        children: [
          (filteredReportingsError as Error | undefined)?.message,
          (pinnedReportingsError as Error | undefined)?.message
        ]
          .filter(d => !!d)
          .join('\n'),
        closingDelay: 6000,
        isClosable: true,
        level: Level.ERROR,
        withAutomaticClosing: true
      })
    )
  }, [dispatch, filteredReportingsError, pinnedReportingsError])

  return null
}

function trySetFeatureSelected(featureId: string | undefined, value: boolean) {
  if (featureId === undefined) {
    return
  }
  const previousFeatureId = REPORTINGS_VECTOR_SOURCE.getFeatureById(featureId)
  if (previousFeatureId === null) {
    return
  }
  previousFeatureId.set('isSelected', value)
}

export const ReportingLayer = memo(UnmemoizedReportingLayer)
ReportingLayer.displayName = 'ReportingLayer'
