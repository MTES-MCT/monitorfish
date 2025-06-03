import { isCypress } from '@utils/isCypress'
import ScaleLine from 'ol/control/ScaleLine'
import Zoom from 'ol/control/Zoom'
import OpenLayerMap from 'ol/Map'
import { transform } from 'ol/proj'
import View from 'ol/View'

import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from './constants'

import type { MonitorFishMap } from '@features/Map/Map.types'

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

// Only expose helpers when running under Cypress
/* eslint-disable no-underscore-dangle */
if (isCypress()) {
  // @ts-ignore
  window.olTestUtils = {
    getFeaturesFromLayer: (name: string) => {
      const layer = monitorfishMap
        .getLayers()
        .getArray()
        .find(l => (l as unknown as MonitorFishMap.VectorLayerWithName).name === name)

      // @ts-ignore
      return layer?.values_?.source?.getFeatures() ?? []
    },
    getViewCenter: () => monitorfishMap.getView().getCenter()
  }
}
/* eslint-enable no-underscore-dangle */
