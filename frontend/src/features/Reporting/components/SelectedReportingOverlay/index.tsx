import { monitorfishMap } from '@features/Map/monitorfishMap'
import { usePinnedReportings } from '@features/Reporting/hooks/usePinnedReportings'
import { buildReportingFeature } from '@features/Reporting/utils'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import Feature from 'ol/Feature'
import LineString from 'ol/geom/LineString'
import { unByKey } from 'ol/Observable'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { REPORTINGS_LINE_VECTOR_SOURCE, REPORTINGS_VECTOR_SOURCE } from '../../layers/ReportingLayer/constants'
import { ReportingOverlay } from '../ReportingOverlay'

export function SelectedReportingOverlay() {
  const featureId = useMainAppSelector(store => store.reporting.selectedReportingFeatureId)

  if (!featureId) {
    return null
  }

  return <SelectedReportingItem key={featureId} featureId={featureId} />
}

type SelectedReportingItemProps = {
  featureId: string
}
function SelectedReportingItem({ featureId }: SelectedReportingItemProps) {
  const sourceFeature = REPORTINGS_VECTOR_SOURCE.getFeatureById(featureId) ?? undefined

  const reportingId = useMemo(() => {
    const id = Number(featureId.split(':').at(-1))

    return Number.isNaN(id) ? undefined : id
  }, [featureId])

  const { pinnedReportings } = usePinnedReportings()

  const selectedFeature = useMemo(() => {
    if (sourceFeature) {
      return sourceFeature
    }

    const pinnedReporting = pinnedReportings?.find(reporting => reporting.id === reportingId)

    return pinnedReporting?.coordinates?.length === 2 ? buildReportingFeature(pinnedReporting) : undefined
  }, [sourceFeature, pinnedReportings, reportingId])

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
        existingLine.setGeometry(new LineString([anchorCoordinates, nextCoordinates]))
      } else {
        const lineFeature = new Feature({
          geometry: new LineString([anchorCoordinates, nextCoordinates])
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
