import { monitorfishMap } from '../../map/monitorfishMap'

import type { MonitorFishLayer } from '../../../domain/entities/layers/types'
import type { VectorLayerWithName } from '../../../domain/types/layer'

export function getLayer(name: MonitorFishLayer): VectorLayerWithName | undefined {
  return (monitorfishMap.getLayers().getArray() as VectorLayerWithName[]).find(layer => layer.name === name) as
    | VectorLayerWithName
    | undefined
}
