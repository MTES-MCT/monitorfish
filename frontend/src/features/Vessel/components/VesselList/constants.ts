import { VesselLocation } from '@features/Vessel/types/vessel'
import { getOptionsFromLabelledEnum, type Option } from '@mtes-mct/monitor-ui'
import { range } from 'lodash-es'

import type { VesselListFilter } from './types'

/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/string-enum */
export enum LastControlPeriod {
  AFTER_ONE_MONTH_AGO = 'AFTER_ONE_MONTH_AGO',
  BEFORE_ONE_MONTH_AGO = 'BEFORE_ONE_MONTH_AGO',
  BEFORE_ONE_YEAR_AGO = 'BEFORE_ONE_YEAR_AGO',
  BEFORE_SIX_MONTHS_AGO = 'BEFORE_SIX_MONTHS_AGO',
  BEFORE_THREE_MONTHS_AGO = 'BEFORE_THREE_MONTHS_AGO',
  BEFORE_TWO_YEARS_AGO = 'BEFORE_TWO_YEARS_AGO'
}
export const LAST_CONTROL_PERIOD_LABEL: Record<LastControlPeriod, string> = {
  AFTER_ONE_MONTH_AGO: 'Contrôlé il y a moins d’1 mois',
  BEFORE_ONE_MONTH_AGO: 'Contrôlé il y a plus d’1 mois',
  BEFORE_THREE_MONTHS_AGO: 'Contrôlé il y a plus de 3 mois',
  BEFORE_SIX_MONTHS_AGO: 'Contrôlé il y a plus de 6 mois',
  BEFORE_ONE_YEAR_AGO: 'Contrôlé il y a plus d’1 an',
  BEFORE_TWO_YEARS_AGO: 'Contrôlé il y a plus de 2 ans'
}
export const LAST_CONTROL_PERIODS_AS_OPTIONS = getOptionsFromLabelledEnum(LAST_CONTROL_PERIOD_LABEL)

export enum VesselSize {
  ABOVE_TWELVE_METERS = 'ABOVE_TWELVE_METERS',
  BELOW_TEN_METERS = 'BELOW_TEN_METERS',
  BELOW_TWELVE_METERS = 'BELOW_TWELVE_METERS'
}
export const VESSEL_SIZE_LABEL: Record<VesselSize, string> = {
  ABOVE_TWELVE_METERS: 'Plus de 12m',
  BELOW_TEN_METERS: 'Moins de 10m',
  BELOW_TWELVE_METERS: 'Moins de 12m'
}
export const VESSEL_SIZE_AS_OPTIONS = getOptionsFromLabelledEnum(VESSEL_SIZE_LABEL)

export const VESSEL_LOCATION_LABEL: Record<VesselLocation, string> = {
  PORT: 'Au port',
  SEA: 'En mer'
}

export const LAST_POSITION_AS_OPTIONS = [
  {
    label: 'Dernière pos. il y a 1 heure',
    value: 1
  },
  {
    label: 'Dernière pos. il y a 2 heures',
    value: 2
  },
  {
    label: 'Dernière pos. il y a 3 heures',
    value: 3
  },
  {
    label: 'Dernière pos. il y a 4 heures',
    value: 4
  },
  {
    label: 'Dernière pos. il y a 5 heures',
    value: 5
  },
  {
    label: 'Dernière pos. il y a 6 heures',
    value: 6
  },
  {
    label: 'Dernière pos. il y a 12 heures',
    value: 12
  },
  {
    label: 'Dernière pos. il y a 24 heures',
    value: 24
  }
]
export const HAS_LOGBOOK_AS_OPTIONS = [
  {
    label: 'Equipé JPE',
    value: true
  },
  {
    label: 'Non Equipé JPE',
    value: false
  }
]

export const DEFAULT_VESSEL_LIST_FILTER_VALUES: VesselListFilter = {
  countryCodes: [],
  emitsPositions: [],
  districtCodes: [],
  fleetSegments: [],
  gearCodes: [],
  vesselsLocation: [VesselLocation.SEA],
  lastControlPeriod: undefined,
  lastLandingPortLocodes: [],
  lastPositionHoursAgo: undefined,
  producerOrganizations: [],
  hasLogbook: undefined,
  specyCodes: [],
  searchQuery: undefined,
  riskFactors: [],
  vesselSize: undefined,
  zones: []
}

export const RISK_FACTOR_AS_OPTIONS: Option<number>[] = range(1, 4).map(riskFactor => ({
  label: `${riskFactor.toFixed(1)} ≼ Note de risque ≺ ${(riskFactor + 1).toFixed(1)}`,
  value: riskFactor
}))
