import ScaleLine from 'ol/control/ScaleLine'
import Zoom from 'ol/control/Zoom'
import OpenLayerMap from 'ol/Map'
import { transform } from 'ol/proj'
import View from 'ol/View'

import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../../domain/entities/map/constants'

const centeredOnFrance = [2.99049, 46.82801]

export const monitorfishMap = new OpenLayerMap({
  controls: [
    new ScaleLine({ units: 'nautical' }),
    new Zoom({
      className: 'zoom'
    })
  ],
  keyboardEventTarget: document,
  layers: [],
  view: new View({
    center: transform(centeredOnFrance, WSG84_PROJECTION, OPENLAYERS_PROJECTION),
    minZoom: 3,
    projection: OPENLAYERS_PROJECTION,
    zoom: 6
  })
})
