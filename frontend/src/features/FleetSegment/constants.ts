import { type FleetSegment, ScipSpeciesType } from '@features/FleetSegment/types'
import { ActivityOrigin } from '@features/Vessel/schemas/ActiveVesselSchema'
import { customDayjs } from '@mtes-mct/monitor-ui'

export const FLEET_SEGMENT_VESSEL_TYPES = [
  'Chalutier pêche arrière - congélateur',
  'Chalutier pêche arr. congélateur rampe port. fixe',
  'Chalutiers pêche arrière congélateurs'
]

export const SpeciesTypeToSpeciesTypeLabel: Record<ScipSpeciesType, string> = {
  [ScipSpeciesType.DEMERSAL]: 'Démersales',
  [ScipSpeciesType.OTHER]: 'Autres',
  [ScipSpeciesType.PELAGIC]: 'Pélagiques',
  [ScipSpeciesType.TUNA]: 'Thons'
}

export const DEFAULT_FLEET_SEGMENT: FleetSegment = {
  faoAreas: [],
  gears: [],
  impactRiskFactor: 2.0,
  mainScipSpeciesType: undefined,
  maxMesh: undefined,
  minMesh: undefined,
  minShareOfTargetSpecies: undefined,
  priority: 0,
  segment: '',
  segmentName: '',
  targetSpecies: [],
  vesselTypes: [],
  year: customDayjs().year()
}

export const FLEET_SEGMENT_ORIGIN_LABEL: Record<ActivityOrigin, string> = {
  [ActivityOrigin.FROM_LOGBOOK]: 'Segment(s) actuel(s) à partir des messages de captures',
  [ActivityOrigin.FROM_RECENT_PROFILE]: 'Segment(s) ces 7 derniers jours'
}

export const GEAR_ORIGIN_LABEL: Record<ActivityOrigin, string> = {
  [ActivityOrigin.FROM_LOGBOOK]: 'Engin(s) utilisé(s) à partir des messages de captures',
  [ActivityOrigin.FROM_RECENT_PROFILE]: 'Engin(s) utilisé(s) ces 7 derniers jours'
}
