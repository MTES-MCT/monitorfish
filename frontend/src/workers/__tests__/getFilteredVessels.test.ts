import {
  DEFAULT_VESSEL_LIST_FILTER_VALUES,
  LastControlPeriod,
  VesselSize
} from '@features/Vessel/components/VesselList/constants'
import { VesselLocation } from '@features/Vessel/types/vessel'
import { describe, it, expect } from '@jest/globals'

import { MonitorFishWebWorker } from '../MonitorFishWebWorker'
import { DUMMY_LAST_POSITIONS } from './__mocks__/dummyLastPositions'

describe('MonitorFishWebWorker.getFilteredVessels', () => {
  it('should return vessels When there is only default filter', () => {
    const filters = { ...DEFAULT_VESSEL_LIST_FILTER_VALUES, vesselsLocation: [] }
    const result = MonitorFishWebWorker.getFilteredVessels(DUMMY_LAST_POSITIONS, filters)
    expect(result).toEqual(expect.arrayContaining(['vessel1', 'vessel2', 'vessel3']))
  })

  it('should filter by search query', () => {
    const filters = { ...DEFAULT_VESSEL_LIST_FILTER_VALUES, searchQuery: 'PHENO' }
    const result = MonitorFishWebWorker.getFilteredVessels(DUMMY_LAST_POSITIONS, filters)
    expect(result).toContain('vessel2')
    expect(result).not.toContain('vessel1')
  })

  it('should filters by countryCodes', () => {
    const filters = { ...DEFAULT_VESSEL_LIST_FILTER_VALUES, countryCodes: ['US'], vesselsLocation: [] }
    const result = MonitorFishWebWorker.getFilteredVessels(DUMMY_LAST_POSITIONS, filters)
    expect(result).toContain('vessel1')
    expect(result).not.toContain('vessel2')
  })

  it('should filters by districtCodes', () => {
    const filters = { ...DEFAULT_VESSEL_LIST_FILTER_VALUES, districtCodes: ['GV'] }
    const result = MonitorFishWebWorker.getFilteredVessels(DUMMY_LAST_POSITIONS, filters)
    expect(result).toContain('vessel2')
    expect(result).not.toContain('vessel1')
  })

  it('should filters by hasLogbook true', () => {
    const filters = { ...DEFAULT_VESSEL_LIST_FILTER_VALUES, hasLogbook: true, vesselsLocation: [] }
    const result = MonitorFishWebWorker.getFilteredVessels(DUMMY_LAST_POSITIONS, filters)
    expect(result).toContain('vessel1')
    expect(result).not.toContain('vessel2')
  })

  it('should filters by hasLogbook false', () => {
    const filters = { ...DEFAULT_VESSEL_LIST_FILTER_VALUES, hasLogbook: false, vesselsLocation: [] }
    const result = MonitorFishWebWorker.getFilteredVessels(DUMMY_LAST_POSITIONS, filters)
    expect(result).toContain('vessel2')
    expect(result).not.toContain('vessel1')
  })

  it('should filters by lastPositionHoursAgo', () => {
    const filters = { ...DEFAULT_VESSEL_LIST_FILTER_VALUES, lastPositionHoursAgo: 2, vesselsLocation: [] }
    const result = MonitorFishWebWorker.getFilteredVessels(DUMMY_LAST_POSITIONS, filters)
    expect(result).toContain('vessel1')
    expect(result).not.toContain('vessel2')
  })

  it('should filters by riskFactors', () => {
    // Provide a riskFactors filter of [1].
    // vessel1 (riskFactor 1.5) should pass, vessel2 (riskFactor 2.5) should be filtered out.
    const filters = { ...DEFAULT_VESSEL_LIST_FILTER_VALUES, riskFactors: [1], vesselsLocation: [] }
    const result = MonitorFishWebWorker.getFilteredVessels(DUMMY_LAST_POSITIONS, filters)
    expect(result).toContain('vessel1')
    expect(result).not.toContain('vessel2')
  })

  it('should filters by fleetSegments', () => {
    const filters = { ...DEFAULT_VESSEL_LIST_FILTER_VALUES, fleetSegments: ['segment1'], vesselsLocation: [] }
    const result = MonitorFishWebWorker.getFilteredVessels(DUMMY_LAST_POSITIONS, filters)
    expect(result).toContain('vessel1')
    expect(result).not.toContain('vessel2')
  })

  it('should filters by recentSegments', () => {
    const filters = { ...DEFAULT_VESSEL_LIST_FILTER_VALUES, fleetSegments: ['segment666'], vesselsLocation: [] }
    const result = MonitorFishWebWorker.getFilteredVessels(DUMMY_LAST_POSITIONS, filters)
    expect(result).toContain('vessel3')
    expect(result).not.toContain('vessel1')
  })

  it('should filters by gearCodes', () => {
    const filters = { ...DEFAULT_VESSEL_LIST_FILTER_VALUES, gearCodes: ['gear1'], vesselsLocation: [] }
    const result = MonitorFishWebWorker.getFilteredVessels(DUMMY_LAST_POSITIONS, filters)
    expect(result).toContain('vessel1')
    expect(result).not.toContain('vessel2')
  })

  it('should filters by recentGearCodes', () => {
    const filters = { ...DEFAULT_VESSEL_LIST_FILTER_VALUES, gearCodes: ['gear666'], vesselsLocation: [] }
    const result = MonitorFishWebWorker.getFilteredVessels(DUMMY_LAST_POSITIONS, filters)
    expect(result).toContain('vessel3')
    expect(result).not.toContain('vessel1')
  })

  it('should filters by specyCodes', () => {
    const filters = { ...DEFAULT_VESSEL_LIST_FILTER_VALUES, specyCodes: ['specy1'], vesselsLocation: [] }
    const result = MonitorFishWebWorker.getFilteredVessels(DUMMY_LAST_POSITIONS, filters)
    expect(result).toContain('vessel1')
    expect(result).not.toContain('vessel2')
  })

  it('should filters by vesselsLocation (PORT)', () => {
    const filters = { ...DEFAULT_VESSEL_LIST_FILTER_VALUES, vesselsLocation: [VesselLocation.PORT] }
    const result = MonitorFishWebWorker.getFilteredVessels(DUMMY_LAST_POSITIONS, filters)
    // vessel1 is at port; vessel2 is not.
    expect(result).toContain('vessel1')
    expect(result).not.toContain('vessel2')
  })

  it('should filters by vesselsLocation (SEA)', () => {
    const filters = { ...DEFAULT_VESSEL_LIST_FILTER_VALUES, vesselsLocation: [VesselLocation.SEA] }
    const result = MonitorFishWebWorker.getFilteredVessels(DUMMY_LAST_POSITIONS, filters)
    // vessel2 is at sea; vessel1 is not.
    expect(result).toContain('vessel2')
    expect(result).not.toContain('vessel1')
  })

  it('should filters by vesselSize', () => {
    // Using the ABOVE_TWELVE_METERS filter: vessel1 (length 15) passes, vessel2 (length 8) does not.
    const filters = {
      ...DEFAULT_VESSEL_LIST_FILTER_VALUES,
      vesselSize: VesselSize.ABOVE_TWELVE_METERS,
      vesselsLocation: []
    }
    const result = MonitorFishWebWorker.getFilteredVessels(DUMMY_LAST_POSITIONS, filters)
    expect(result).toContain('vessel1')
    expect(result).not.toContain('vessel2')
  })

  it('should filters by lastControlPeriod (BEFORE_ONE_YEAR_AGO)', () => {
    const filters = {
      ...DEFAULT_VESSEL_LIST_FILTER_VALUES,
      lastControlPeriod: LastControlPeriod.BEFORE_ONE_YEAR_AGO,
      vesselsLocation: []
    }
    const result = MonitorFishWebWorker.getFilteredVessels(DUMMY_LAST_POSITIONS, filters)
    expect(result).toContain('vessel1')
    expect(result).not.toContain('vessel2')
  })

  it('should filters by lastControlPeriod (AFTER_ONE_MONTH_AGO)', () => {
    const filters = {
      ...DEFAULT_VESSEL_LIST_FILTER_VALUES,
      lastControlPeriod: LastControlPeriod.AFTER_ONE_MONTH_AGO,
      vesselsLocation: []
    }
    const result = MonitorFishWebWorker.getFilteredVessels(DUMMY_LAST_POSITIONS, filters)
    expect(result).toContain('vessel2')
    expect(result).not.toContain('vessel1')
  })

  it('should applies multiple filters simultaneously', () => {
    const filters = {
      countryCodes: ['US'],
      districtCodes: [],
      fleetSegments: ['segment1'],
      gearCodes: ['gear1'],
      hasLogbook: true,
      lastControlPeriod: undefined,
      lastLandingPortLocodes: [],
      lastPositionHoursAgo: 2,
      producerOrganizations: [],
      riskFactors: [1],
      specyCodes: ['specy1'],
      vesselSize: VesselSize.ABOVE_TWELVE_METERS,
      vesselsLocation: [VesselLocation.PORT],
      zones: []
    }

    const result = MonitorFishWebWorker.getFilteredVessels(DUMMY_LAST_POSITIONS, filters)

    expect(result).toEqual(expect.arrayContaining(['vessel1']))
    expect(result).not.toEqual(expect.arrayContaining(['vessel2']))
  })
})
