import { addMainWindowBanner } from '@features/MainWindow/useCases/addMainWindowBanner'
import { useMapLayer } from '@features/Map/hooks/useMapLayer'
import { useWebGLLayerVisibility } from '@features/Map/hooks/useWebGLLayerVisibility'
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
  const editedReporting = useMainAppSelector(state => state.reporting.editedReporting)

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

  const { data: filterData, error } = useDisplayReportingsQuery(displayFilters, { skip: skipQuery })

  // The reporting being edited and the one selected on the map (e.g. via "voir sur la carte") are fetched by
  // id below with no isArchived filter applied, so archived reportings are included regardless of archive state.
  const selectedReportingId = useMemo(() => {
    if (!selectedReportingFeatureId) {
      return undefined
    }

    const id = Number(selectedReportingFeatureId.split(':').at(-1))

    return Number.isNaN(id) ? undefined : id
  }, [selectedReportingFeatureId])

  const extraIds = useMemo(
    () => Array.from(new Set([editedReporting?.id, selectedReportingId].filter(id => id !== undefined))),
    [editedReporting?.id, selectedReportingId]
  )

  const { data: extraData, error: extraError } = useDisplayReportingsQuery({
    endDate: undefined,
    ids: extraIds,
    isArchived: undefined,
    isIUU: undefined,
    reportingPeriod: ReportingSearchPeriod.CUSTOM,
    reportingType: undefined,
    startDate: undefined
  })

  const data = useMemo(() => {
    if (!isReportingLayerDisplayed) {
      return extraData ?? []
    }

    const filterDataIds = new Set((filterData ?? []).map(d => d.id))

    return [...(filterData ?? []), ...(extraData ?? []).filter(d => !filterDataIds.has(d.id))]
  }, [extraData, filterData, isReportingLayerDisplayed])

  useMapLayer(REPORTINGS_VECTOR_LAYER)
  useMapLayer(REPORTINGS_LINE_VECTOR_LAYER)
  useWebGLLayerVisibility(REPORTINGS_VECTOR_LAYER, isReportingLayerDisplayed || !!extraData?.length)
  useWebGLLayerVisibility(REPORTINGS_LINE_VECTOR_LAYER, isReportingLayerDisplayed || !!extraData?.length)

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
    const features = data
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
  }, [data, dispatch, hideDisplayedOverlaysWhenFeatureFiltered])

  useEffect(() => {
    if (!error && !extraError) {
      return
    }

    dispatch(
      addMainWindowBanner({
        children: [(error as Error | undefined)?.message, (extraError as Error | undefined)?.message]
          .filter(d => !!d)
          .join('\n'),
        closingDelay: 6000,
        isClosable: true,
        level: Level.ERROR,
        withAutomaticClosing: true
      })
    )
  }, [dispatch, error, extraError])

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
