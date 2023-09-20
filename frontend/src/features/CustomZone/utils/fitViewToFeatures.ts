import VectorSource from 'ol/source/Vector'

import { monitorfishMap } from '../../map/monitorfishMap'

import type { Feature } from 'ol'
import type { Geometry } from 'ol/geom'

export function fitViewToFeatures(features: Feature<Geometry>[]) {
  const vectorSource = new VectorSource({
    features: features as Feature<Geometry>[]
  })

  monitorfishMap.getView().fit(vectorSource.getExtent(), {
    padding: [30, 30, 30, 30]
  })
}
