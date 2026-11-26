import { selectIsPositionReplayActive } from '@features/PositionReplay/selectors'

import type { MainRootState } from '@store'

export enum DataKind {
  ALERTS = 'ALERTS',
  BEACON_MALFUNCTIONS = 'BEACON_MALFUNCTIONS',
  CONTROLS = 'CONTROLS',
  ESTIMATED_POSITIONS = 'ESTIMATED_POSITIONS',
  FLEET_SEGMENTS = 'FLEET_SEGMENTS',
  GEARS_ONBOARD = 'GEARS_ONBOARD',
  INFRACTION_SUSPICIONS = 'INFRACTION_SUSPICIONS',
  LANDING_PORTS = 'LANDING_PORTS',
  LOGBOOK = 'LOGBOOK',
  LOGBOOK_EQUIPMENT = 'LOGBOOK_EQUIPMENT',
  MISSIONS = 'MISSIONS',
  POSITIONS = 'POSITIONS',
  PRODUCER_ORGANIZATIONS = 'PRODUCER_ORGANIZATIONS',
  REPORTINGS = 'REPORTINGS',
  RISK_FACTOR = 'RISK_FACTOR',
  SPECIES_ONBOARD = 'SPECIES_ONBOARD',
  VESSEL_GROUPS = 'VESSEL_GROUPS',
  VESSEL_IDENTITY = 'VESSEL_IDENTITY',
  VESSEL_PROFILE = 'VESSEL_PROFILE'
}

enum DataTemporality {
  /** Only known now: hidden or disabled while replaying positions. */
  CURRENT_ONLY = 'CURRENT_ONLY',
  /** Known at the replayed date. */
  HISTORIZED = 'HISTORIZED'
}

/**
 * The single source of truth of what is displayed while replaying positions.
 * The user settings showing current-only data are left untouched, so they apply again as soon as the replay ends.
 */
const DATA_TEMPORALITY: Record<DataKind, DataTemporality> = {
  [DataKind.ALERTS]: DataTemporality.CURRENT_ONLY,
  [DataKind.BEACON_MALFUNCTIONS]: DataTemporality.CURRENT_ONLY,
  [DataKind.CONTROLS]: DataTemporality.CURRENT_ONLY,
  [DataKind.ESTIMATED_POSITIONS]: DataTemporality.CURRENT_ONLY,
  [DataKind.FLEET_SEGMENTS]: DataTemporality.CURRENT_ONLY,
  [DataKind.GEARS_ONBOARD]: DataTemporality.CURRENT_ONLY,
  [DataKind.INFRACTION_SUSPICIONS]: DataTemporality.CURRENT_ONLY,
  [DataKind.LANDING_PORTS]: DataTemporality.CURRENT_ONLY,
  [DataKind.LOGBOOK]: DataTemporality.HISTORIZED,
  [DataKind.LOGBOOK_EQUIPMENT]: DataTemporality.CURRENT_ONLY,
  [DataKind.MISSIONS]: DataTemporality.CURRENT_ONLY,
  [DataKind.POSITIONS]: DataTemporality.HISTORIZED,
  [DataKind.PRODUCER_ORGANIZATIONS]: DataTemporality.HISTORIZED,
  [DataKind.REPORTINGS]: DataTemporality.CURRENT_ONLY,
  [DataKind.RISK_FACTOR]: DataTemporality.CURRENT_ONLY,
  [DataKind.SPECIES_ONBOARD]: DataTemporality.CURRENT_ONLY,
  [DataKind.VESSEL_GROUPS]: DataTemporality.CURRENT_ONLY,
  [DataKind.VESSEL_IDENTITY]: DataTemporality.HISTORIZED,
  [DataKind.VESSEL_PROFILE]: DataTemporality.CURRENT_ONLY
}

export type IsDataAvailable = (dataKind: DataKind) => boolean

/** For the data that is never replayed, such as the vessels of a group. */
export const isAlwaysAvailable: IsDataAvailable = () => true

const isHistorized: IsDataAvailable = dataKind => DATA_TEMPORALITY[dataKind] === DataTemporality.HISTORIZED

/** A stable predicate, which can be passed to the code depending on the data availability. */
export const selectIsDataAvailablePredicate = (state: MainRootState): IsDataAvailable =>
  selectIsPositionReplayActive(state) ? isHistorized : isAlwaysAvailable

export const selectIsDataAvailable = (state: MainRootState, dataKind: DataKind): boolean =>
  selectIsDataAvailablePredicate(state)(dataKind)

export function isDataAvailableForVessel(vessel: { isReplayed?: boolean | undefined }, dataKind: DataKind): boolean {
  return vessel.isReplayed ? isHistorized(dataKind) : isAlwaysAvailable(dataKind)
}
