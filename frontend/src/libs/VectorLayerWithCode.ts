import VectorLayer from 'ol/layer/Vector'

import type { MonitorFishLayer } from '../domain/entities/layers/types'
import type Feature from 'ol/Feature'
import type { Geometry } from 'ol/geom'
import type { Options as LayerVectorOptions } from 'ol/layer/Vector'

type Options<T extends Feature<Geometry>> = LayerVectorOptions<T> & {
  code: MonitorFishLayer
}

export class VectorLayerWithCode<T extends Feature<Geometry> = Feature<Geometry>> extends VectorLayer<T> {
  public code: MonitorFishLayer
  /** @deprecated Replaced by `code`. */
  public name: MonitorFishLayer

  constructor({ code, ...originalOptions }: Options<T>) {
    super(originalOptions)

    this.code = code
    this.name = code
  }
}
