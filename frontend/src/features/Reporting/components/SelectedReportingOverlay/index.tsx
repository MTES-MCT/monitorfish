import { monitorfishMap } from '@features/Map/monitorfishMap'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import Feature from 'ol/Feature'
import LineString from 'ol/geom/LineString'
import { unByKey } from 'ol/Observable'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { REPORTINGS_LINE_VECTOR_SOURCE, REPORTINGS_VECTOR_SOURCE } from '../../layers/ReportingLayer/constants'
import { ReportingOverlay } from '../ReportingOverlay'

import type { Coordinate } from 'ol/coordinate'

export function SelectedReportingOverlay() {
  const selectedReportingFeatureIds = useMainAppSelector(store => store.reporting.selectedReportingFeatureIds)
  const isReportingLayerDisplayed = useMainAppSelector(store => store.displayedComponent.isReportingLayerDisplayed)

  if (!isReportingLayerDisplayed) {
    return null
  }

  return (
    <>
      {selectedReportingFeatureIds.map(featureId => (
        <SelectedReportingItem key={featureId} featureId={featureId} />
      ))}
    </>
  )
}

type SelectedReportingItemProps = {
  featureId: string
}
function SelectedReportingItem({ featureId }: SelectedReportingItemProps) {
  const selectedFeature = useMemo(() => REPORTINGS_VECTOR_SOURCE.getFeatureById(featureId) ?? undefined, [featureId])

  const [zoomHasChanged, setZoomHasChanged] = useState<number | undefined>(undefined)
  useEffect(() => {
    const key = monitorfishMap.getView().on('change:resolution', () => {
      setZoomHasChanged(monitorfishMap.getView().getZoom())
    })

    return () => unByKey(key)
  }, [])

  // Clear the drag line when this item unmounts (feature deselected)
  useEffect(
    () => () => {
      const lineFeature = REPORTINGS_LINE_VECTOR_SOURCE.getFeatureById(getLineFeatureId(featureId))
      if (lineFeature) {
        REPORTINGS_LINE_VECTOR_SOURCE.removeFeature(lineFeature)
      }
    },
    [featureId]
  )

  const handleDrag = useCallback(
    (anchorCoordinates: number[], nextCoordinates: number[]) => {
      const lineFeatureId = getLineFeatureId(featureId)
      const existingLine = REPORTINGS_LINE_VECTOR_SOURCE.getFeatureById(lineFeatureId)

      if (existingLine) {
        existingLine.setGeometry(new LineString([anchorCoordinates as Coordinate, nextCoordinates as Coordinate]))
      } else {
        const lineFeature = new Feature({
          geometry: new LineString([anchorCoordinates, nextCoordinates as Coordinate])
        })

        lineFeature.setId(lineFeatureId)
        REPORTINGS_LINE_VECTOR_SOURCE.addFeature(lineFeature)
      }
    },
    [featureId]
  )

  return <ReportingOverlay feature={selectedFeature} isSelected onDrag={handleDrag} zoomHasChanged={zoomHasChanged} />
}

function getLineFeatureId(reportingFeatureId: string) {
  return `${reportingFeatureId}:line`
}
