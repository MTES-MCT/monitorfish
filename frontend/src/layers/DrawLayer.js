import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import VectorSource from 'ol/source/Vector'
import { layersType as LayersType } from '../domain/entities/layers'
import { Interactions } from '../domain/entities/map'
import Draw, { createBox } from 'ol/interaction/Draw'
import Style from 'ol/style/Style'
import RegularShape from 'ol/style/RegularShape'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import { addZoneSelected, resetInteraction } from '../domain/reducers/Map'

const DrawLayer = ({ map }) => {
  const interaction = useSelector(state => state.map.interaction)
  const dispatch = useDispatch()

  useEffect(() => {
    if(map && interaction) {
      const source = new VectorSource({ wrapX: false })

      let type = null
      switch (interaction) {
        case Interactions.SQUARE: type = 'Circle'; break;
        case Interactions.POLYGON: type = 'Polygon'; break;
        default: console.error("No interaction type specified"); return;
      }

      const draw = new Draw({
        source:  source,
        type: type,
        style: new Style({
          image: new RegularShape({
            fill: new Fill({
              color: '#515151'
            }),
            points: 4,
            radius1: 15,
            radius2: 1
          }),
          stroke: new Stroke({
            color: '#515151',
            lineDash: [5, 5]
          }),
          fill: new Fill({
            color: 'rgb(255, 255, 255, 0.3)'
          }),

        }),
        geometryFunction: interaction === Interactions.SQUARE ? createBox() : null
      })
      map.addInteraction(draw)

      draw.on('drawend', event => {
        dispatch(addZoneSelected({
          name: "Tracé libre",
          code: LayersType.FREE_DRAW,
          feature: event.feature
        }))
        dispatch(resetInteraction())
        map.removeInteraction(draw)
      })
    }
  }, [map, interaction])


  return null
}

export default DrawLayer
