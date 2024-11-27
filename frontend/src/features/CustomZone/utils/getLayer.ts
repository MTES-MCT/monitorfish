import { monitorfishMap } from '../../map/monitorfishMap'

import type { MainMap } from '@features/MainMap/MainMap.types'

export function getLayer(name: MainMap.MonitorFishLayer): MainMap.VectorLayerWithName | undefined {
  return (monitorfishMap.getLayers().getArray() as MainMap.VectorLayerWithName[]).find(layer => layer.name === name) as
    | MainMap.VectorLayerWithName
    | undefined
}
