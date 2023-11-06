import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import { Vector } from 'ol/layer'
import { Stroke, Style } from 'ol/style'

import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../../../domain/entities/map/constants'
import { LayerProperties } from '../../../domain/entities/layers/constants'
import { COLORS } from '../../../constants/constants'
import { monitorfishMap } from '../monitorfishMap'

const FilterLayer = () => {
  const { showedFilter, filterColor } = useSelector((state) => {
    const _showedFilter = state.filter?.filters?.find(filter => filter.showed)
    return {
      showedFilter: _showedFilter,
      filterColor: _showedFilter ? _showedFilter.color : null
    }
  })
  const { zonesSelected } = useSelector(state => state.vesselList)
  const currentDrawnFilterZone = zonesSelected && zonesSelected[0]?.feature
  const filterFeature = currentDrawnFilterZone || showedFilter?.filters?.zonesSelected[0]?.feature

  const vectorSourceRef = useRef(null)
  function getVectorSource () {
    if (vectorSourceRef.current === null) {
      vectorSourceRef.current = new VectorSource({
        format: new GeoJSON({
          dataProjection: WSG84_PROJECTION,
          featureProjection: OPENLAYERS_PROJECTION
        }),
        features: [],
        wrapX: false
      })
    }
    return vectorSourceRef.current
  }

  const layerRef = useRef(null)
  function getLayer () {
    if (layerRef.current === null) {
      layerRef.current = new Vector({
        renderBuffer: 4,
        source: getVectorSource(),
        zIndex: LayerProperties.FILTERED_VESSELS.zIndex,
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        style: new Style({
          stroke: new Stroke({
            color: filterColor,
            width: 2,
            lineDash: [4, 8]
          })
        })
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
    layerRef?.current.setStyle(new Style({
      stroke: new Stroke({
        color: currentDrawnFilterZone ? COLORS.charcoal : filterColor,
        width: 2,
        lineDash: [4, 8]
      })
    }))
  }, [filterColor, currentDrawnFilterZone])

  return null
}

export default React.memo(FilterLayer)
