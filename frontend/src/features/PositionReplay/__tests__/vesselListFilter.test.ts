import { describe, expect, it } from '@jest/globals'

import {
  DEFAULT_VESSEL_LIST_FILTER_VALUES,
  LAST_POSITION_AS_OPTIONS,
  LastControlPeriod
} from '../../Vessel/components/VesselList/constants'
import { VMS_REPLAY_LOOKBACK_IN_HOURS } from '../constants'
import { selectIsDataAvailablePredicate } from '../replayableData'
import { PositionReplayStatus } from '../slice'
import {
  getApplicableVesselListFilter,
  getLastPositionHoursAgoOptions,
  isVesselListFilterAvailable,
  omitUnavailableFilters
} from '../vesselListFilter'

import type { VesselListFilter } from '../../Vessel/components/VesselList/types'
import type { MainRootState } from '@store'

const getIsDataAvailable = (status: PositionReplayStatus) =>
  selectIsDataAvailablePredicate({ positionReplay: { status } } as unknown as MainRootState)
const isAlwaysAvailable = getIsDataAvailable(PositionReplayStatus.OFF)
const isAvailableWhileReplaying = getIsDataAvailable(PositionReplayStatus.REPLAYING)

const FILTERS: VesselListFilter = {
  ...DEFAULT_VESSEL_LIST_FILTER_VALUES,
  countryCodes: ['FR'],
  fleetSegments: ['NWW01'],
  gearCodes: ['OTB'],
  hasLogbook: true,
  landingPortLocodes: ['FRBES'],
  lastControlAtQuayPeriod: LastControlPeriod.AFTER_ONE_MONTH_AGO,
  lastControlAtSeaPeriod: LastControlPeriod.AFTER_ONE_MONTH_AGO,
  producerOrganizations: ['OP1'],
  riskFactors: [3],
  specyCodes: ['COD']
}

describe('PositionReplay/vesselListFilter', () => {
  it('getApplicableVesselListFilter() Should keep all the filters When not replaying', () => {
    expect(getApplicableVesselListFilter(FILTERS, isAlwaysAvailable)).toBe(FILTERS)
  })

  it('getApplicableVesselListFilter() Should only keep the filters on the replayed data When replaying', () => {
    expect(getApplicableVesselListFilter(FILTERS, isAvailableWhileReplaying)).toEqual({
      ...FILTERS,
      fleetSegments: [],
      gearCodes: [],
      hasLogbook: undefined,
      landingPortLocodes: [],
      lastControlAtQuayPeriod: undefined,
      lastControlAtSeaPeriod: undefined,
      riskFactors: [],
      specyCodes: []
    })
  })

  it('isVesselListFilterAvailable() Should be false for a current-only data filter When replaying', () => {
    expect(isVesselListFilterAvailable('riskFactors', isAlwaysAvailable)).toBe(true)
    expect(isVesselListFilterAvailable('riskFactors', isAvailableWhileReplaying)).toBe(false)
    expect(isVesselListFilterAvailable('countryCodes', isAvailableWhileReplaying)).toBe(true)
  })

  it('omitUnavailableFilters() Should not update the ignored filters When replaying', () => {
    const nextFilters = { countryCodes: [], riskFactors: [] }

    expect(omitUnavailableFilters(nextFilters, isAlwaysAvailable)).toEqual(nextFilters)
    expect(omitUnavailableFilters(nextFilters, isAvailableWhileReplaying)).toEqual({ countryCodes: [] })
  })

  it('getLastPositionHoursAgoOptions() Should disable the periods longer than the VMS look-back When replaying', () => {
    expect(getLastPositionHoursAgoOptions(LAST_POSITION_AS_OPTIONS, undefined)).toBe(LAST_POSITION_AS_OPTIONS)

    const disabledValues = getLastPositionHoursAgoOptions(LAST_POSITION_AS_OPTIONS, VMS_REPLAY_LOOKBACK_IN_HOURS)
      .filter(option => option.isDisabled)
      .map(option => option.value)
    expect(disabledValues).toEqual([12, 24])
  })
})
