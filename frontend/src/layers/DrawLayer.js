import { useEffect } from 'react'

import { useDispatch, useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import { layersType as LayersType } from '../domain/entities/layers'
import { InteractionTypes, OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../domain/entities/map'
import Draw, { createBox } from 'ol/interaction/Draw'
import { Icon, Style } from 'ol/style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import { addZoneSelected, resetInteraction } from '../domain/reducers/Map'
import GeoJSON from 'ol/format/GeoJSON'

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
        style: new Style({
          image: new Icon({
            opacity: 1,
            src: 'Pointeur_selection_zone.svg',
            scale: 1.5
          }),
          stroke: new Stroke({
            color: '#515151',
            lineDash: [5, 5]
          }),
          fill: new Fill({
            color: 'rgb(255, 255, 255, 0.3)'
          })

        }),
        geometryFunction: interaction === InteractionTypes.SQUARE ? createBox() : null
      })
      map.addInteraction(draw)

      draw.on('drawend', event => {
        const format = new GeoJSON()
        const geoJsonStr = format.writeFeature(event.feature, {
          dataProjection: WSG84_PROJECTION,
          featureProjection: OPENLAYERS_PROJECTION
        });

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
