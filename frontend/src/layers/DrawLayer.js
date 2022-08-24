import GeoJSON from 'ol/format/GeoJSON'
import Draw, { createBox } from 'ol/interaction/Draw'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { layersType, layersType as LayersType } from '../domain/entities/layers'
import { InteractionTypes, OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../domain/entities/map'
import { resetInteraction } from '../domain/shared_slices/Map'
import { setZoneSelected } from '../features/layers/regulatory/search/RegulatoryLayerSearch.slice'
import { addZoneSelected } from '../features/vessel_list/VesselList.slice'
import { useEscapeFromKeyboard } from '../hooks/useEscapeFromKeyboard'
import { dottedLayerStyle } from './styles/dottedLayer.style'
import { drawStyle } from './styles/draw.style'

function DrawLayer({ map }) {
  const interaction = useSelector(state => state.map.interaction)
  const { zoneSelected } = useSelector(state => state.regulatoryLayerSearch)
  const dispatch = useDispatch()
  const draw = useRef()
  const escape = useEscapeFromKeyboard()

  const [vectorSource] = useState(
    new VectorSource({
      format: new GeoJSON({
        dataProjection: WSG84_PROJECTION,
        featureProjection: OPENLAYERS_PROJECTION,
      }),
      projection: OPENLAYERS_PROJECTION,
      wrapX: false,
    }),
  )
  const [vectorLayer] = useState(
    new VectorLayer({
      renderBuffer: 7,
      source: vectorSource,
      style: dottedLayerStyle,
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      zIndex: 999,
    }),
  )

  useEffect(() => {
    if (escape) {
      dispatch(resetInteraction())
      map.removeInteraction(draw.current)
    }
  }, [escape])

  useEffect(() => {
    function addLayerToMap() {
      if (map) {
        map.getLayers().push(vectorLayer)
      }

      return () => {
        if (map) {
          map.removeLayer(vectorLayer)
        }
      }
    }

    addLayerToMap()
  }, [map, vectorLayer])

  useEffect(() => {
    function drawOnMap() {
      if (map && interaction) {
        const source = new VectorSource({ wrapX: false })

        let type = null
        switch (interaction.type) {
          case InteractionTypes.SQUARE:
            type = 'Circle'
            break
          case InteractionTypes.POLYGON:
            type = 'Polygon'
            break
          default:
            console.error('No interaction type specified')

            return
        }

        draw.current = new Draw({
          geometryFunction: interaction.type === InteractionTypes.SQUARE ? createBox() : null,
          source,
          style: drawStyle,
          type,
        })
        map.addInteraction(draw.current)

        draw.current.on('drawend', event => {
          const format = new GeoJSON()
          const { feature } = event
          feature.set('type', interaction.type)
          const geoJSONString = format.writeFeature(event.feature, {
            dataProjection: WSG84_PROJECTION,
            featureProjection: OPENLAYERS_PROJECTION,
          })

          const newSelectedZone = {
            code: LayersType.FREE_DRAW,
            feature: geoJSONString,
            name: 'Tracé libre',
          }
          switch (interaction.listener) {
            case layersType.VESSEL:
              dispatch(addZoneSelected(newSelectedZone))
              break
            case layersType.REGULATORY:
              dispatch(setZoneSelected(newSelectedZone))
              break
          }

          dispatch(resetInteraction())
          map.removeInteraction(draw.current)
        })
      }
    }

    drawOnMap()
  }, [map, interaction])

  useEffect(() => {
    if (!vectorSource) {
      return
    }

    if (zoneSelected?.feature) {
      const features = vectorSource.getFormat().readFeatures(zoneSelected?.feature)
      features.map(feature => feature.setId(feature.ol_uid))
      vectorSource.clear(true)
      vectorSource.addFeatures(features)
    } else {
      vectorSource.clear(true)
    }
  }, [zoneSelected, vectorSource])

  return null
}

export default React.memo(DrawLayer)
