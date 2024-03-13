import type { VesselIdentifier } from '../../domain/entities/vessel/types'

export namespace Vessel {
  export type VesselId = {
    identifier: VesselIdentifier
    value: string
  }
}
