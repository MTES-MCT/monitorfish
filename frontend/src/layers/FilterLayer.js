import GeoJSON from 'ol/format/GeoJSON'
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'
import { Stroke, Style } from 'ol/style'
import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

import { COLORS } from '../constants/constants'
import Layers from '../domain/entities/layers'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../domain/entities/map'

function FilterLayer({ map }) {
  const { filterColor, showedFilter } = useSelector(state => {
    const _showedFilter = state.filter?.filters?.find(filter => filter.showed)

    return {
      filterColor: _showedFilter ? _showedFilter.color : null,
      showedFilter: _showedFilter
    }
  })
  const { zonesSelected } = useSelector(state => state.vesselList)
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
            color: filterColor,
            lineDash: [4, 8],
            width: 2
          })
        }),
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        zIndex: Layers.FILTERED_VESSELS.zIndex
      })
      layerRef.current.name = Layers.FILTERED_VESSELS.code
    }

    return layerRef.current
  }

  useEffect(() => {
    if (map) {
      map.getLayers().push(getLayer())
    }

    return () => {
      if (map) {
        map.removeLayer(getLayer())
      }
    }
  }, [map])

  useEffect(() => {
    if (map) {
      getVectorSource()?.clear(true)
      const feature = filterFeature && getVectorSource()?.getFormat().readFeatures(filterFeature)
      if (feature) {
        getVectorSource()?.addFeatures(feature)
      }
    }
  }, [map, filterFeature])

  useEffect(() => {
    layerRef?.current.setStyle(
      new Style({
        stroke: new Stroke({
          color: currentDrawnFilterZone ? COLORS.vesselColor : filterColor,
          lineDash: [4, 8],
          width: 2
        })
      })
    )
  }, [filterColor, currentDrawnFilterZone])

  return null
}

export default React.memo(FilterLayer)
