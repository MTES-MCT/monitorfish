import VectorLayer from 'ol/layer/Vector'

import type { MonitorFishMap } from '@features/Map/Map.types'
import type Feature from 'ol/Feature'
import type { Geometry } from 'ol/geom'
import type { Options as LayerVectorOptions } from 'ol/layer/Vector'

type Options<T extends Feature<Geometry>> = LayerVectorOptions<T> & {
  code: MonitorFishMap.MonitorFishLayer
}

export class VectorLayerWithCode<T extends Feature<Geometry> = Feature<Geometry>> extends VectorLayer<T> {
  public code: MonitorFishMap.MonitorFishLayer
  /** @deprecated Replaced by `code`. */
  public name: MonitorFishMap.MonitorFishLayer

  constructor({ code, ...originalOptions }: Options<T>) {
    super(originalOptions)

    this.code = code
    this.name = code
  }
}
