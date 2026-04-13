import { monitorfishMap } from '@features/Map/monitorfishMap'
import VectorSource from 'ol/source/Vector'

import type { Feature } from 'ol'
import type { Geometry } from 'ol/geom'

export function fitViewToFeatures(features: Feature<Geometry>[]) {
  const vectorSource = new VectorSource({
    features: features as Feature<Geometry>[]
  })

  const extent = vectorSource.getExtent()
  if (extent) {
    monitorfishMap.getView().fit(extent, {
      padding: [30, 30, 30, 30]
    })
  }
}
