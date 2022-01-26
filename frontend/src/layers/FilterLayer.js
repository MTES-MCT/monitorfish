import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import { Vector } from 'ol/layer'
import { Stroke, Style } from 'ol/style'

import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../domain/entities/map'
import Layers from '../domain/entities/layers'
import { COLORS } from '../constants/constants'

const FilterLayer = ({ map }) => {
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
  if (!vectorSourceRef.current) {
    vectorSourceRef.current = new VectorSource({
      format: new GeoJSON({
        dataProjection: WSG84_PROJECTION,
        featureProjection: OPENLAYERS_PROJECTION
      }),
      features: []
    })
  }
  const layerRef = useRef(null)
  if (!layerRef.current) {
    layerRef.current = new Vector({
      renderBuffer: 4,
      source: vectorSourceRef.current,
      zIndex: Layers.SELECTED_VESSEL.zIndex,
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
  }

  useEffect(() => {
    if (map) {
      layerRef.current.name = 'currentFilter'
      map.getLayers().push(layerRef.current)
    }

    return () => {
      if (map) {
        map.removeLayer(layerRef.current)
      }
    }
  }, [map])

  useEffect(() => {
    if (map) {
      vectorSourceRef.current?.clear(true)
      const feature = filterFeature && vectorSourceRef.current?.getFormat().readFeatures(filterFeature)
      if (feature) {
        vectorSourceRef.current?.addFeatures(feature)
      }
    }
  }, [map, filterFeature])

  useEffect(() => {
    layerRef?.current.setStyle(new Style({
      stroke: new Stroke({
        color: currentDrawnFilterZone ? COLORS.vesselColor : filterColor,
        width: 2,
        lineDash: [4, 8]
      })
    }))
  }, [filterColor, currentDrawnFilterZone])

  return null
}

export default FilterLayer
