import { THEME } from '@mtes-mct/monitor-ui'
import GeoJSON from 'ol/format/GeoJSON'
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'
import { Stroke, Style } from 'ol/style'
import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

import { LayerProperties } from '../../MainMap/constants.js'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../../MainMap/constants2.js'
import { monitorfishMap } from '../../map/monitorfishMap.ts'

function VesselFilterLayer() {
  const filters = useSelector(state => state.filter.filters)
  const zonesSelected = useSelector(state => state.vesselList.zonesSelected)

  const showedFilter = filters?.find(filter => filter.showed)
  const currentDrawnFilterZone = zonesSelected && zonesSelected[0]?.feature
  const filterFeature = currentDrawnFilterZone || showedFilter?.filters?.zonesSelected[0]?.feature

  const vectorSourceRef = useRef(null)
  function getVectorSource() {
    if (vectorSourceRef.current === null) {
      vectorSourceRef.current = new VectorSource({
        features: [],
        format: new GeoJSON({
          dataProjection: WSG84_PROJECTION,
          featureProjection: OPENLAYERS_PROJECTION
        }),
        wrapX: false
      })
    }

    return vectorSourceRef.current
  }

  const layerRef = useRef(null)
  function getLayer() {
    if (layerRef.current === null) {
      layerRef.current = new Vector({
        renderBuffer: 4,
        source: getVectorSource(),
        style: new Style({
          stroke: new Stroke({
            color: showedFilter?.filterColor,
            lineDash: [4, 8],
            width: 2
          })
        }),
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        zIndex: LayerProperties.FILTERED_VESSELS.zIndex
      })
      layerRef.current.name = LayerProperties.FILTERED_VESSELS.code
    }

    return layerRef.current
  }

  useEffect(() => {
    monitorfishMap.getLayers().push(getLayer())

    return () => {
      monitorfishMap.removeLayer(getLayer())
    }
  }, [])

  useEffect(() => {
    getVectorSource()?.clear(true)
    const feature = filterFeature && getVectorSource()?.getFormat().readFeatures(filterFeature)
    if (feature) {
      getVectorSource()?.addFeatures(feature)
    }
  }, [filterFeature])

  useEffect(() => {
    layerRef?.current.setStyle(
      new Style({
        stroke: new Stroke({
          color: currentDrawnFilterZone ? THEME.color.charcoal : showedFilter?.filterColor,
          lineDash: [4, 8],
          width: 2
        })
      })
    )
  }, [showedFilter?.filterColor, currentDrawnFilterZone])

  return null
}

export default React.memo(VesselFilterLayer)
