import { Feature } from 'ol'
import VectorLayer from 'ol/layer/Vector'

import type { MonitorFishLayer } from '../domain/entities/layers/types'
import type { Geometry } from 'ol/geom'
import type { Options as VectorLayerOptions } from 'ol/layer/BaseVector'
import type VectorSource from 'ol/source/Vector'

type Options<T extends VectorSource<Feature<Geometry>>> = VectorLayerOptions<T> & {
  code: MonitorFishLayer
}

export class VectorLayerWithCode<
  T extends VectorSource<Feature<Geometry>> = VectorSource<Feature<Geometry>>
> extends VectorLayer<T> {
  public code: MonitorFishLayer
  /** @deprecated Replaced by `code`. */
  public name: MonitorFishLayer

  constructor({ code, ...originalOptions }: Options<T>) {
    super(originalOptions)

    this.code = code
    this.name = code
  }
}
