import VectorSource from 'ol/source/Vector'
import { memo, useEffect, useMemo, useRef } from 'react'

import { getStationPointFeature, getFeatureStyle } from './utils'
import { LayerProperties } from '../../../../domain/entities/layers/constants'
import { MonitorFishLayer } from '../../../../domain/entities/layers/types'
// import { removeOverlayCoordinatesByName } from '../../../../domain/shared_slices/Global'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
// import { FrontendError } from '../../../../libs/FrontendError'
// import { stationActions } from '../../slice'
import { VectorLayerWithCode } from '../../../../libs/VectorLayerWithCode'
import { monitorfishMap } from '../../../map/monitorfishMap'
import { useGetStationsQuery } from '../../stationApi'

import type { VectorSourceForFeatureWithCodeAndEntityId } from '../../../map/types'

type StationLayerProps = {
  hoveredFeatureId: string | undefined
}
function UnmemoizedStationLayer({ hoveredFeatureId }: StationLayerProps) {
  const vectorSourceRef = useRef(new VectorSource() as VectorSourceForFeatureWithCodeAndEntityId)
  const vectorLayerRef = useRef(
    new VectorLayerWithCode({
      className: MonitorFishLayer.STATION,
      code: MonitorFishLayer.STATION,
      source: vectorSourceRef.current,
      style: getFeatureStyle,
      zIndex: LayerProperties.STATION.zIndex
    })
  )

  const dispatch = useMainAppDispatch()
  const selectedStationId = useMainAppSelector(state => state.station.selectedStationId)
  const highlightedStationIds = useMainAppSelector(state => state.station.highlightedStationIds)

  const { data: stations } = useGetStationsQuery()

  const stationsAsFeatures = useMemo(
    () => (stations || []).filter(station => station.controlUnitResourceIds.length > 0).map(getStationPointFeature),
    [stations]
  )

  useEffect(() => {
    vectorSourceRef.current.forEachFeature(feature => {
      feature.setState({
        isHighlighted: feature.id === hoveredFeatureId || highlightedStationIds.includes(feature.entityId),
        isSelected: feature.code === MonitorFishLayer.STATION && feature.entityId === selectedStationId
      })
    })
  }, [hoveredFeatureId, selectedStationId, highlightedStationIds])

  useEffect(() => {
    vectorSourceRef.current.clear()
    vectorSourceRef.current.addFeatures(stationsAsFeatures)
  }, [dispatch, stationsAsFeatures])

  useEffect(() => {
    const localVectorLayer = vectorLayerRef.current
    monitorfishMap.getLayers().push(localVectorLayer)

    return () => {
      monitorfishMap.removeLayer(localVectorLayer)
    }
  }, [])

  return null
}

export const StationLayer = memo(UnmemoizedStationLayer)
StationLayer.displayName = 'StationLayer'
