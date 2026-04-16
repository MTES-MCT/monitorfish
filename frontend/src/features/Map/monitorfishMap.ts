import { isCypress } from '@utils/isCypress'
import ScaleLine from 'ol/control/ScaleLine'
import Zoom from 'ol/control/Zoom'
import OpenLayerMap from 'ol/Map'
import { transform, transformExtent } from 'ol/proj'
import View from 'ol/View'

import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from './constants'

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
    extent: transformExtent([-180, -85.06, 180, 85.06], WSG84_PROJECTION, OPENLAYERS_PROJECTION),
    minZoom: 3,
    projection: OPENLAYERS_PROJECTION,
    zoom: 6
  })
})

// Only expose helpers when running under Cypress
/* eslint-disable no-underscore-dangle */
if (isCypress()) {
  // @ts-ignore
  window.olTestUtils = {
    getFeaturesFromLayer: (name: string) => {
      const layer = monitorfishMap
        .getLayers()
        .getArray()
        .find(l => l.get('code') === name)

      // @ts-ignore
      return layer?.values_?.source?.getFeatures() ?? []
    },
    getMapSize: () => monitorfishMap.getSize(),
    getPixelFromCoordinate: (coordinate: number[]) => monitorfishMap.getPixelFromCoordinate(coordinate),
    getViewCenter: () => monitorfishMap.getView().getCenter(),
    monitorfishMap
  }
}
/* eslint-enable no-underscore-dangle */
