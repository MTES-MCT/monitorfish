import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import { Vector } from 'ol/layer'
import { Stroke, Style } from 'ol/style'

import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../domain/entities/map'
import Layers from '../domain/entities/layers'

const FilterLayer = ({ map }) => {
  const { showedFilter, filterColor } = useSelector((state) => {
    const showedFilter = state.filter?.filters?.find(filter => filter.showed)
    return {
      showedFilter,
      filterColor: showedFilter ? showedFilter.color : null
    }
  })
  const filterGeoJSON = showedFilter?.filters?.zonesSelected[0]?.feature

  const vectorSourceRef = useRef(new VectorSource({
    format: new GeoJSON({
      dataProjection: WSG84_PROJECTION,
      featureProjection: OPENLAYERS_PROJECTION
    }),
    features: []
  }))
  const layerRef = useRef(new Vector({
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
  }))

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
      const filterfeature = filterGeoJSON && vectorSourceRef.current?.getFormat().readFeatures(filterGeoJSON)
      if (filterfeature) {
        vectorSourceRef.current?.addFeatures(filterfeature)
      }
    }
  }, [filterGeoJSON])

  useEffect(() => {
    layerRef?.current.setStyle(new Style({
      stroke: new Stroke({
        color: filterColor,
        width: 2,
        lineDash: [4, 8]
      })
    }))
  }, [filterColor])

  return null
}

export default FilterLayer
