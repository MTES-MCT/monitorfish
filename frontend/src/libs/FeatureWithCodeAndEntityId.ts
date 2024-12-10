import { Feature } from 'ol'
import { Geometry } from 'ol/geom'

import type { MainMap } from '@features/MainMap/MainMap.types'

type Options<T extends Geometry> = {
  code: MainMap.MonitorFishLayer
  entityId: number
  geometry: T
}

export class FeatureWithCodeAndEntityId<T extends Geometry = Geometry> extends Feature<T> {
  public code: MainMap.MonitorFishLayer
  public entityId: number
  public id: string

  constructor({ code, entityId, geometry }: Options<T>) {
    super(geometry)

    const id = `${code}:${entityId}`

    this.code = code
    this.entityId = entityId
    this.id = id

    this.setId(id)
  }

  get isHighlighted() {
    return this.getProperties().isHighlighted as boolean
  }

  get isSelected() {
    return this.getProperties().isSelected as boolean
  }

  setState({ isHighlighted = false, isSelected = false }) {
    this.setProperties({
      isHighlighted,
      isSelected
    })
  }
}
