import { useMapOverlay } from '@features/Map/components/Overlay/hooks/useMapOverlay'
import { LayerProperties } from '@features/Map/constants'
import { MonitorFishMap } from '@features/Map/Map.types'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { FeatureWithCodeAndEntityId } from '@libs/FeatureWithCodeAndEntityId'
import { Feature } from 'ol'
import Point from 'ol/geom/Point'
import { useMemo } from 'react'
import styled from 'styled-components'

import { TAG_ROW_HEIGHT, OVERLAY_HEIGHT, margins } from './constants'
import { ReportingDetails } from './ReportingDetails'
import { reportingActions } from '../../slice'
import { editReportingFromMap } from '../../useCases/editReportingFromMap'

import type { Reporting } from '../../types'

export type ReportingOverlayProps = {
  feature: Feature | FeatureWithCodeAndEntityId | undefined
  isSelected?: boolean
  onDrag?: (anchorCoordinates: number[], nextCoordinates: number[], offset: number[]) => void
  zoomHasChanged?: number | undefined
}
export function ReportingOverlay({ feature, isSelected = false, onDrag, zoomHasChanged }: ReportingOverlayProps) {
  const dispatch = useMainAppDispatch()
  const selectedReportingFeatureIds = useMainAppSelector(store => store.reporting.selectedReportingFeatureIds)

  const featureId = feature?.getId()?.toString()
  const isReportingFeature = !!featureId?.includes(MonitorFishMap.MonitorFishLayer.REPORTING)
  // Prevent the hover overlay from stacking on top of a pinned overlay for the same feature
  const isSuppressed = !isSelected && !!featureId && selectedReportingFeatureIds.includes(featureId)
  const shouldShow = isReportingFeature && !isSuppressed

  const olCoordinates = useMemo(() => {
    if (!shouldShow || !feature) {
      return undefined
    }
    const geom = feature.getGeometry()

    return geom instanceof Point ? geom.getCoordinates() : undefined
  }, [shouldShow, feature])

  const reportingProperties = shouldShow ? (feature?.getProperties() as Reporting.ReportingFeature) : undefined

  const hasTag =
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    (reportingProperties?.isIUU || !!reportingProperties?.expirationDate || reportingProperties?.isArchived) ?? false
  const tagOffset = hasTag ? TAG_ROW_HEIGHT : 0
  const overlayHeight = OVERLAY_HEIGHT + tagOffset
  const dynamicMargins = useMemo(
    () => ({
      ...margins,
      yBottom: margins.yBottom - tagOffset,
      yMiddle: margins.yMiddle - Math.round(tagOffset / 2)
    }),
    [tagOffset]
  )

  const { overlayElementRef, overlayPosition } = useMapOverlay({
    coordinates: olCoordinates,
    initialOffset: [0, 0],
    margins: dynamicMargins,
    onDrag,
    overlayHeight,
    zIndex: LayerProperties[MonitorFishMap.MonitorFishLayer.REPORTING].zIndex,
    zoomHasChanged
  })

  const handleClose = () => {
    if (featureId) {
      feature?.set('isSelected', false)
      dispatch(reportingActions.toggleSelectedReportingFeatureId(featureId))
    }
  }

  const handleEdit = () => {
    const reportingId = reportingProperties?.id
    if (reportingId !== undefined) {
      dispatch(editReportingFromMap(reportingId))
    }
  }

  return (
    <WrapperToBeKeptForDOMManagement>
      <Overlay ref={overlayElementRef}>
        {reportingProperties && (
          <ReportingDetails
            cardHeight={overlayHeight}
            cardMargins={dynamicMargins}
            hasTag={hasTag}
            isSelected={isSelected}
            onClose={handleClose}
            onEdit={handleEdit}
            overlayPosition={overlayPosition}
            reporting={reportingProperties}
          />
        )}
      </Overlay>
    </WrapperToBeKeptForDOMManagement>
  )
}

const Overlay = styled.div``

/** Stays in the React DOM tree so React can cleanly unmount it. OL manages the inner div instead. */
const WrapperToBeKeptForDOMManagement = styled.div``
