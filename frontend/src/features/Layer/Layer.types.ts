import type { GearRegulation } from '@features/Regulation/types'
import type { MonitorFishLayer } from 'domain/entities/layers/types'

export namespace Layer {
  // TODO This type was created "guessing" some props while migration regulations to TS. Needs rechecking and renaming.
  export type UnknownZone = {
    gears: GearRegulation
    id: string
    layerName?: string
    namespace: string
    topic?: string
    type: MonitorFishLayer
    zone: string
  }
}
