import { Vessel } from '@features/Vessel/Vessel.types'

export type VesselLastPositionWithId = Vessel.ActiveVesselEmittingPosition & {
  id: string
}
