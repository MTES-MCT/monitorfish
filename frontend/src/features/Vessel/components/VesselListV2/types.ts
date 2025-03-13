import { VesselLocation } from '@features/Vessel/types/vessel'

import { type LastControlPeriod, VesselSize } from './constants'

import type { Undefine } from '@mtes-mct/monitor-ui'

export type VesselListFilter = Undefine<{
  countryCodes: string[]
  fleetSegments: string[]
  gearCodes: string[]
  hasLogbook: boolean
  lastControlPeriod: LastControlPeriod
  lastLandingPortLocodes: string[]
  lastPositionHoursAgo: number
  producerOrganizations: string[]
  riskFactors: number[]
  specyCodes: string[]
  vesselSize: VesselSize
  vesselsLocation: VesselLocation[]
}>
