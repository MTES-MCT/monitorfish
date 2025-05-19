import { Vessel } from '@features/Vessel/Vessel.types'

export type VesselLastPositionWithId = Vessel.ActiveVesselWithPosition & {
  id: string
}
