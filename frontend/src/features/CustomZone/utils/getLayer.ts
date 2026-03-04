import { monitorfishMap } from '@features/Map/monitorfishMap'

import type { MonitorFishMap } from '@features/Map/Map.types'
import type VectorLayer from 'ol/layer/Vector'
import type { Feature } from 'ol'
import type { Geometry } from 'ol/geom'

export function getLayer(name: MonitorFishMap.MonitorFishLayer): VectorLayer<Feature<Geometry>> | undefined {
  return monitorfishMap
    .getLayers()
    .getArray()
    .find(layer => layer.get('code') === name) as VectorLayer<Feature<Geometry>> | undefined
}
