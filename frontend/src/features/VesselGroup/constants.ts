import { DEFAULT_VESSEL_LIST_FILTER_VALUES } from '@features/Vessel/components/VesselList/constants'
import {
  CnspService,
  type CreateOrUpdateDynamicVesselGroup,
  type CreateOrUpdateFixedVesselGroup,
  GroupType,
  Sharing
} from '@features/VesselGroup/types'
import { type Option } from '@mtes-mct/monitor-ui'

export const DEFAULT_DYNAMIC_VESSEL_GROUP: CreateOrUpdateDynamicVesselGroup = {
  color: '',
  description: undefined,
  endOfValidityUtc: undefined,
  filters: DEFAULT_VESSEL_LIST_FILTER_VALUES,
  id: undefined,
  isDeleted: false,
  name: '',
  pointsOfAttention: undefined,
  sharedTo: undefined,
  sharing: Sharing.PRIVATE,
  startOfValidityUtc: undefined,
  type: GroupType.DYNAMIC
}

export const DEFAULT_FIXED_VESSEL_GROUP: CreateOrUpdateFixedVesselGroup = {
  color: '',
  description: undefined,
  endOfValidityUtc: undefined,
  id: undefined,
  isDeleted: false,
  name: '',
  pointsOfAttention: undefined,
  sharedTo: undefined,
  sharing: Sharing.PRIVATE,
  startOfValidityUtc: undefined,
  type: GroupType.FIXED,
  vessels: []
}

export const CNSP_SERVICE_LABEL: Record<CnspService, string> = {
  POLE_OPS_METROPOLE: 'Pôle OPS métropole',
  POLE_OPS_OUTRE_MER: 'Pôle OPS outre-mer',
  POLE_REG_PLANIF: 'Pôle reg./planif.',
  POLE_SIP: 'Pôle SIP'
}

export const CNSP_SERVICE_OPTIONS: Array<Option<CnspService>> = [
  {
    label: CNSP_SERVICE_LABEL.POLE_OPS_METROPOLE,
    value: CnspService.POLE_OPS_METROPOLE
  },
  {
    label: CNSP_SERVICE_LABEL.POLE_SIP,
    value: CnspService.POLE_SIP
  },
  {
    label: CNSP_SERVICE_LABEL.POLE_REG_PLANIF,
    value: CnspService.POLE_REG_PLANIF
  },
  {
    label: CNSP_SERVICE_LABEL.POLE_OPS_OUTRE_MER,
    value: CnspService.POLE_OPS_OUTRE_MER
  }
]

export const SHARING_OPTIONS: Array<Option<Sharing>> = [
  {
    label: 'Groupe personnel',
    value: Sharing.PRIVATE
  },
  {
    label: 'Groupe partagé',
    value: Sharing.SHARED
  }
]
