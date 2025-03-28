import { Vessel } from '@features/Vessel/Vessel.types'

export type VesselLastPositionWithId = Vessel.VesselLastPosition & {
  id: string
}
