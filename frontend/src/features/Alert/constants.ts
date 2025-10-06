import {
  ALL_SEAFRONT_GROUP,
  type AllSeafrontGroup,
  Seafront,
  SEAFRONT_GROUP_SEAFRONTS,
  SeafrontGroup
} from '@constants/seafront'

export enum PendingAlertValueType {
  MISSING_DEP_ALERT = 'MISSING_DEP_ALERT',
  MISSING_FAR_48_HOURS_ALERT = 'MISSING_FAR_48_HOURS_ALERT',
  MISSING_FAR_ALERT = 'MISSING_FAR_ALERT',
  POSITION_ALERT = 'POSITION_ALERT',
  SUSPICION_OF_UNDER_DECLARATION_ALERT = 'SUSPICION_OF_UNDER_DECLARATION_ALERT'
}

export const ALERTS_MENU_SEAFRONT_TO_SEAFRONTS: Record<
  SeafrontGroup | AllSeafrontGroup,
  {
    menuSeafront: SeafrontGroup | AllSeafrontGroup
    seafronts: Seafront[]
  }
> = {
  ALL: {
    menuSeafront: ALL_SEAFRONT_GROUP,
    seafronts: [
      Seafront.CORSE,
      Seafront.GUADELOUPE,
      Seafront.GUYANE,
      Seafront.MARTINIQUE,
      Seafront.MAYOTTE,
      Seafront.MED,
      Seafront.MEMN,
      Seafront.NAMO,
      Seafront.SA,
      Seafront.SUD_OCEAN_INDIEN
    ]
  },
  MED: {
    menuSeafront: SeafrontGroup.MED,
    seafronts: SEAFRONT_GROUP_SEAFRONTS.MED
  },
  MEMN: {
    menuSeafront: SeafrontGroup.MEMN,
    seafronts: SEAFRONT_GROUP_SEAFRONTS.MEMN
  },
  NAMO: {
    menuSeafront: SeafrontGroup.NAMO,
    seafronts: SEAFRONT_GROUP_SEAFRONTS.NAMO
  },
  OUTREMEROA: {
    menuSeafront: SeafrontGroup.OUTREMEROA,
    seafronts: SEAFRONT_GROUP_SEAFRONTS.OUTREMEROA
  },
  OUTREMEROI: {
    menuSeafront: SeafrontGroup.OUTREMEROI,
    seafronts: SEAFRONT_GROUP_SEAFRONTS.OUTREMEROI
  },
  SA: {
    menuSeafront: SeafrontGroup.SA,
    seafronts: SEAFRONT_GROUP_SEAFRONTS.SA
  }
}

export enum SilencedAlertPeriod {
  CUSTOM = 'CUSTOM',
  ONE_DAY = 'ONE_DAY',
  ONE_HOUR = 'ONE_HOUR',
  ONE_MONTH = 'ONE_MONTH',
  ONE_WEEK = 'ONE_WEEK',
  ONE_YEAR = 'ONE_YEAR',
  SIX_HOURS = 'SIX_HOURS',
  THIS_OCCURRENCE = 'THIS_OCCURRENCE',
  TWELVE_HOURS = 'TWELVE_HOURS',
  TWO_HOURS = 'TWO_HOURS'
}

export enum AdministrativeAreaType {
  DISTANCE_TO_SHORE = 'DISTANCE_TO_SHORE',
  EEZ_AREA = 'EEZ_AREA',
  FAO_AREA = 'FAO_AREA',
  NEAFC_AREA = 'NEAFC_AREA'
}

export const AdministrativeAreaTypeLabel: Record<AdministrativeAreaType, string> = {
  DISTANCE_TO_SHORE: 'Distances à la côte',
  EEZ_AREA: 'Zones ZEE',
  FAO_AREA: 'Zones FAO',
  NEAFC_AREA: 'Zones NEAFC'
}

export enum AdministrativeAreaValueLabel {
  '0-12_MINUS_DE_FISHING_AREA' = '12 milles (sans la ZEE DE)',
  '0-12_MINUS_ES_FISHING_AREA' = '12 milles (sans la ZEE ESP)',
  '0-3' = '3 milles',
  '12_MINUS_BE_AND_NL_FISHING_AREAS' = '12 milles (sans les ZEEs BEL et NLD)',
  '3-6' = 'Entre 3 et 6 milles',
  '6-12' = 'Entre 6 et 12 milles'
}
