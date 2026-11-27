import { DataKind, type IsDataAvailable } from '@features/PositionReplay/replayableData'

import type { VesselListFilter } from '@features/Vessel/components/VesselList/types'
import type { Option } from '@mtes-mct/monitor-ui'

/**
 * The data each filter reads: the filters on unavailable data are ignored, and apply again as soon as it is available.
 */
const VESSEL_LIST_FILTER_DATA_KIND: Record<keyof VesselListFilter, DataKind> = {
  countryCodes: DataKind.VESSEL_IDENTITY,
  districtCodes: DataKind.VESSEL_IDENTITY,
  emitsPositions: DataKind.POSITIONS,
  fleetSegments: DataKind.FLEET_SEGMENTS,
  gearCodes: DataKind.GEARS_ONBOARD,
  hasLogbook: DataKind.LOGBOOK_EQUIPMENT,
  landingPortLocodes: DataKind.LANDING_PORTS,
  lastControlAtQuayPeriod: DataKind.CONTROLS,
  lastControlAtSeaPeriod: DataKind.CONTROLS,
  lastPositionHoursAgo: DataKind.POSITIONS,
  producerOrganizations: DataKind.PRODUCER_ORGANIZATIONS,
  riskFactors: DataKind.RISK_FACTOR,
  searchQuery: DataKind.VESSEL_IDENTITY,
  specyCodes: DataKind.SPECIES_ONBOARD,
  vesselSize: DataKind.VESSEL_IDENTITY,
  vesselsLocation: DataKind.POSITIONS,
  zones: DataKind.POSITIONS
}

export function isVesselListFilterAvailable(key: keyof VesselListFilter, isDataAvailable: IsDataAvailable): boolean {
  return isDataAvailable(VESSEL_LIST_FILTER_DATA_KIND[key])
}

export function getApplicableVesselListFilter(
  filters: VesselListFilter,
  isDataAvailable: IsDataAvailable
): VesselListFilter {
  const unavailableEntries = Object.entries(filters).filter(
    ([key]) => !isVesselListFilterAvailable(key as keyof VesselListFilter, isDataAvailable)
  )
  if (unavailableEntries.length === 0) {
    return filters
  }

  const blankedUnavailableFilters = Object.fromEntries(
    unavailableEntries.map(([key, value]) => [key, Array.isArray(value) ? [] : undefined])
  )

  return { ...filters, ...blankedUnavailableFilters }
}

/**
 * Keeps the ignored filters as they were when updating the filters from their applicable values.
 */
export function omitUnavailableFilters(
  filters: Partial<VesselListFilter>,
  isDataAvailable: IsDataAvailable
): Partial<VesselListFilter> {
  return Object.fromEntries(
    Object.entries(filters).filter(([key]) =>
      isVesselListFilterAvailable(key as keyof VesselListFilter, isDataAvailable)
    )
  )
}

/** Older positions are not fetched, longer periods would display the same vessels. */
export function getLastPositionHoursAgoOptions(
  options: Option<number>[],
  maxLastPositionHoursAgo: number | undefined
): Option<number>[] {
  if (maxLastPositionHoursAgo === undefined) {
    return options
  }

  return options.map(option => ({
    ...option,
    isDisabled: option.value > maxLastPositionHoursAgo
  }))
}
