import type { SeaFrontGroup } from '../../domain/entities/seaFront/constants'
import type { Vessel } from '../../domain/entities/vessel/types'
import type { Port } from '../../domain/types/port'
import type { FleetSegment } from '@features/FleetSegment/types'

export namespace PriorNotification {
  export interface PriorNotification {
    alertCount: number
    estimatedTimeOfArrival: string
    facade: SeaFrontGroup
    fleetSegments: FleetSegment[]
    id: number
    isSubmitted: boolean
    port: Port.Port
    reason: PriorNotificationReason
    receivedAt: string
    scheduledTimeOfLanding: string
    types: PriorNotificationType[]
    vessel: Vessel
  }

  export enum PriorNotificationReason {
    LANDING = 'LANDING'
  }
  export const PRIOR_NOTIFICATION_REASON_LABEL: Record<PriorNotificationReason, string> = {
    LANDING: 'Débarquement'
  }

  /* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/string-enum */
  export enum PriorNotificationType {
    BASS = 'BASS',
    DEEP_SEA_SPECIES = 'DEEP_SEA_SPECIES',
    HAKE = 'HAKE',
    SMALL_PELLAGIC_SPECIES = 'SMALL_PELLAGIC_SPECIES',
    SOLE = 'SOLE',
    BLUEFIN_THUMA = 'BLUEFIN_THUMA',
    RED_CORAL = 'RED_CORAL',
    SHORE_SEINE = 'SHORE_SEINE',
    COMMUNITY = 'COMMUNITY',
    THIRD_PARTY_VESSEL = 'THIRD_PARTY_VESSEL',
    NOT_APPLICABLE = 'NOT_APPLICABLE'
  }
  export const PRIOR_NOTIFICATION_TYPE_LABEL: Record<PriorNotificationType, string> = {
    BASS: 'Bar',
    DEEP_SEA_SPECIES: 'Espèces eaux profondes',
    HAKE: 'Merlu',
    SMALL_PELLAGIC_SPECIES: 'Petits pélagiques',
    SOLE: 'Sole',
    BLUEFIN_THUMA: 'Thon rouge',
    RED_CORAL: 'Corail rouge',
    SHORE_SEINE: 'Senne de plage',
    COMMUNITY: 'Navire communautaire',
    THIRD_PARTY_VESSEL: 'Navire tiers',
    NOT_APPLICABLE: 'Non soumis'
  }
  /* eslint-enable sort-keys-fix/sort-keys-fix */
}
