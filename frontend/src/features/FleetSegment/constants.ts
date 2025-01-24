import { ScipSpeciesType } from '@features/FleetSegment/types'

export const FLEET_SEGMENT_VESSEL_TYPES = [
  'Chalutier pêche arrière - congélateur',
  'Chalutier pêche arr. congélateur rampe port. fixe',
  'Chalutiers pêche arrière congélateurs'
]

export const SpeciesTypeToSpeciesTypeLabel: Record<ScipSpeciesType, string> = {
  [ScipSpeciesType.DEMERSAL]: 'Démersal',
  [ScipSpeciesType.OTHER]: 'Autres',
  [ScipSpeciesType.PELAGIC]: 'Pélagique',
  [ScipSpeciesType.TUNA]: 'Thon'
}
