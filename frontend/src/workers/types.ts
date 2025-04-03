import { Vessel } from '@features/Vessel/Vessel.types'

export type VesselGroupDisplayInformation = {
  groupColor: Array<number>
  groupsDisplayed: Vessel.VesselGroup[]
  numberOfGroupsHidden: number
}
