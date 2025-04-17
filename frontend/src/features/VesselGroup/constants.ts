import { DEFAULT_VESSEL_LIST_FILTER_VALUES } from '@features/Vessel/components/VesselList/constants'
import {
  type CreateOrUpdateDynamicVesselGroup,
  type CreateOrUpdateFixedVesselGroup,
  GroupType,
  Sharing
} from '@features/VesselGroup/types'

export const DEFAULT_DYNAMIC_VESSEL_GROUP: CreateOrUpdateDynamicVesselGroup = {
  color: '',
  description: undefined,
  endOfValidityUtc: undefined,
  filters: DEFAULT_VESSEL_LIST_FILTER_VALUES,
  isDeleted: false,
  name: '',
  pointsOfAttention: undefined,
  sharing: Sharing.PRIVATE,
  type: GroupType.DYNAMIC
}

export const DEFAULT_FIXED_VESSEL_GROUP: CreateOrUpdateFixedVesselGroup = {
  color: '',
  description: undefined,
  endOfValidityUtc: undefined,
  isDeleted: false,
  name: '',
  pointsOfAttention: undefined,
  sharing: Sharing.PRIVATE,
  type: GroupType.FIXED,
  vessels: []
}
