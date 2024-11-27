import VectorLayer from 'ol/layer/Vector'

import type { MainMap } from '@features/MainMap/MainMap.types'
import type Feature from 'ol/Feature'
import type { Geometry } from 'ol/geom'
import type { Options as LayerVectorOptions } from 'ol/layer/Vector'

type Options<T extends Feature<Geometry>> = LayerVectorOptions<T> & {
  code: MainMap.MonitorFishLayer
}

export class VectorLayerWithCode<T extends Feature<Geometry> = Feature<Geometry>> extends VectorLayer<T> {
  public code: MainMap.MonitorFishLayer
  /** @deprecated Replaced by `code`. */
  public name: MainMap.MonitorFishLayer

  constructor({ code, ...originalOptions }: Options<T>) {
    super(originalOptions)

    this.code = code
    this.name = code
  }
}
