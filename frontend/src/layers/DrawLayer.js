import { useEffect } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import { layersType as LayersType } from '../domain/entities/layers'
import { InteractionTypes, OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../domain/entities/map'
import Draw, { createBox } from 'ol/interaction/Draw'
import { addZoneSelected, resetInteraction } from '../domain/reducers/Map'
import GeoJSON from 'ol/format/GeoJSON'
import { drawStyle } from './styles/draw.style'

const DrawLayer = ({ map }) => {
  const interaction = useSelector(state => state.map.interaction)
  const dispatch = useDispatch()

  useEffect(() => {
    drawOnMap()
  }, [map, interaction])

  function drawOnMap () {
    if (map && interaction) {
      const source = new VectorSource({ wrapX: false })

      let type = null
      switch (interaction) {
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

      const draw = new Draw({
        source: source,
        type: type,
        style: drawStyle,
        geometryFunction: interaction === InteractionTypes.SQUARE ? createBox() : null
      })
      map.addInteraction(draw)

      draw.on('drawend', event => {
        const format = new GeoJSON()
        const geoJsonStr = format.writeFeature(event.feature, {
          dataProjection: WSG84_PROJECTION,
          featureProjection: OPENLAYERS_PROJECTION
        })

        dispatch(addZoneSelected({
          name: 'Tracé libre',
          code: LayersType.FREE_DRAW,
          feature: geoJsonStr
        }))

        dispatch(resetInteraction())
        map.removeInteraction(draw)
      })
    }
  }

  return null
}

export default DrawLayer
