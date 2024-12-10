import { monitorfishMap } from '@features/Map/monitorfishMap'

import type { MonitorFishMap } from '@features/Map/Map.types'

export function getLayer(name: MonitorFishMap.MonitorFishLayer): MonitorFishMap.VectorLayerWithName | undefined {
  return (monitorfishMap.getLayers().getArray() as MonitorFishMap.VectorLayerWithName[]).find(
    layer => layer.name === name
  ) as MonitorFishMap.VectorLayerWithName | undefined
}
