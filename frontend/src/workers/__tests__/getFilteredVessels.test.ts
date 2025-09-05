import {
  DEFAULT_VESSEL_LIST_FILTER_VALUES,
  LastControlPeriod,
  VesselSize
} from '@features/Vessel/components/VesselList/constants'
import { VesselEmitsPosition, VesselLocation } from '@features/Vessel/types/vessel'
import { describe, expect, it } from '@jest/globals'

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
    expect(result).toStrictEqual(['vessel2'])
  })

  it('should filters by countryCodes', () => {
    const filters = { ...DEFAULT_VESSEL_LIST_FILTER_VALUES, countryCodes: ['US'], vesselsLocation: [] }
    const result = MonitorFishWebWorker.getFilteredVessels(DUMMY_LAST_POSITIONS, filters)
    expect(result).toStrictEqual(['vessel1'])
  })

  it('should filters by districtCodes', () => {
    const filters = { ...DEFAULT_VESSEL_LIST_FILTER_VALUES, districtCodes: ['GV'] }
    const result = MonitorFishWebWorker.getFilteredVessels(DUMMY_LAST_POSITIONS, filters)
    expect(result).toStrictEqual(['vessel2'])
  })

  it('should filters by hasLogbook true', () => {
    const filters = { ...DEFAULT_VESSEL_LIST_FILTER_VALUES, hasLogbook: true, vesselsLocation: [] }
    const result = MonitorFishWebWorker.getFilteredVessels(DUMMY_LAST_POSITIONS, filters)
    expect(result).toStrictEqual(['vessel1'])
  })

  it('should filters by hasLogbook false', () => {
    const filters = { ...DEFAULT_VESSEL_LIST_FILTER_VALUES, hasLogbook: false, vesselsLocation: [] }
    const result = MonitorFishWebWorker.getFilteredVessels(DUMMY_LAST_POSITIONS, filters)
    expect(result).toStrictEqual(['vessel2', 'vessel3'])
  })

  it('should filters by lastPositionHoursAgo', () => {
    const filters = { ...DEFAULT_VESSEL_LIST_FILTER_VALUES, lastPositionHoursAgo: 2, vesselsLocation: [] }
    const result = MonitorFishWebWorker.getFilteredVessels(DUMMY_LAST_POSITIONS, filters)
    expect(result).toStrictEqual(['vessel1', 'vessel3'])
  })

  it('should filters by riskFactors', () => {
    // Provide a riskFactors filter of [1].
    // vessel1 (riskFactor 1.5) should pass, vessel2 (riskFactor 2.5) should be filtered out.
    const filters = { ...DEFAULT_VESSEL_LIST_FILTER_VALUES, riskFactors: [1], vesselsLocation: [] }
    const result = MonitorFishWebWorker.getFilteredVessels(DUMMY_LAST_POSITIONS, filters)
    expect(result).toStrictEqual(['vessel1'])
  })

  it('should filters by fleetSegments', () => {
    const filters = { ...DEFAULT_VESSEL_LIST_FILTER_VALUES, fleetSegments: ['segment1'], vesselsLocation: [] }
    const result = MonitorFishWebWorker.getFilteredVessels(DUMMY_LAST_POSITIONS, filters)
    expect(result).toStrictEqual(['vessel1'])
  })

  it('should filters by gearCodes', () => {
    const filters = { ...DEFAULT_VESSEL_LIST_FILTER_VALUES, gearCodes: ['gear1'], vesselsLocation: [] }
    const result = MonitorFishWebWorker.getFilteredVessels(DUMMY_LAST_POSITIONS, filters)
    expect(result).toStrictEqual(['vessel1'])
  })

  it('should filters by specyCodes', () => {
    const filters = { ...DEFAULT_VESSEL_LIST_FILTER_VALUES, specyCodes: ['specy1'], vesselsLocation: [] }
    const result = MonitorFishWebWorker.getFilteredVessels(DUMMY_LAST_POSITIONS, filters)
    expect(result).toStrictEqual(['vessel1'])
  })

  it('should filters by vesselsLocation (PORT)', () => {
    const filters = { ...DEFAULT_VESSEL_LIST_FILTER_VALUES, vesselsLocation: [VesselLocation.PORT] }
    const result = MonitorFishWebWorker.getFilteredVessels(DUMMY_LAST_POSITIONS, filters)
    // vessel1 is at port; vessel2 is not.
    expect(result).toStrictEqual(['vessel1'])
  })

  it('should filters by vesselsLocation (SEA)', () => {
    const filters = { ...DEFAULT_VESSEL_LIST_FILTER_VALUES, vesselsLocation: [VesselLocation.SEA] }
    const result = MonitorFishWebWorker.getFilteredVessels(DUMMY_LAST_POSITIONS, filters)
    // vessel2 is at sea; vessel1 is not.
    expect(result).toStrictEqual(['vessel2', 'vessel3'])
  })

  it('should filters by vesselSize', () => {
    // Using the ABOVE_TWELVE_METERS filter: vessel1 (length 15) and vessel3 (length 123) passes, vessel2 (length 8) does not.
    const filters = {
      ...DEFAULT_VESSEL_LIST_FILTER_VALUES,
      vesselSize: VesselSize.ABOVE_TWELVE_METERS,
      vesselsLocation: []
    }
    const result = MonitorFishWebWorker.getFilteredVessels(DUMMY_LAST_POSITIONS, filters)
    expect(result).toStrictEqual(['vessel1', 'vessel3'])
  })

  it('should filters by lastControlPeriod (BEFORE_ONE_YEAR_AGO)', () => {
    const filters = {
      ...DEFAULT_VESSEL_LIST_FILTER_VALUES,
      lastControlAtSeaPeriod: LastControlPeriod.BEFORE_ONE_YEAR_AGO,
      vesselsLocation: []
    }
    const result = MonitorFishWebWorker.getFilteredVessels(DUMMY_LAST_POSITIONS, filters)
    expect(result).toStrictEqual(['vessel1', 'vessel3'])
  })

  it('should filters by lastControlAtSeaPeriod (AFTER_ONE_MONTH_AGO)', () => {
    const filters = {
      ...DEFAULT_VESSEL_LIST_FILTER_VALUES,
      lastControlAtSeaPeriod: LastControlPeriod.AFTER_ONE_MONTH_AGO,
      vesselsLocation: []
    }
    const result = MonitorFishWebWorker.getFilteredVessels(DUMMY_LAST_POSITIONS, filters)
    expect(result).toStrictEqual(['vessel2'])
  })

  it('should filters by lastControlAtQuayPeriod (BEFORE_ONE_YEAR_AGO)', () => {
    const filters = {
      ...DEFAULT_VESSEL_LIST_FILTER_VALUES,
      lastControlAtQuayPeriod: LastControlPeriod.BEFORE_ONE_YEAR_AGO,
      vesselsLocation: []
    }
    const result = MonitorFishWebWorker.getFilteredVessels(DUMMY_LAST_POSITIONS, filters)
    expect(result).toStrictEqual(['vessel2', 'vessel3'])
  })

  it('should filters by emitsPositions (AFTER_ONE_MONTH_AGO)', () => {
    const filters = {
      ...DEFAULT_VESSEL_LIST_FILTER_VALUES,
      emitsPositions: [VesselEmitsPosition.NO],
      vesselsLocation: []
    }
    const result = MonitorFishWebWorker.getFilteredVessels(DUMMY_LAST_POSITIONS, filters)
    expect(result).toStrictEqual([])
  })

  it('should filters by producerOrganizations', () => {
    const filters = {
      ...DEFAULT_VESSEL_LIST_FILTER_VALUES,
      producerOrganizations: ['SA THO'],
      vesselsLocation: []
    }
    const result = MonitorFishWebWorker.getFilteredVessels(DUMMY_LAST_POSITIONS, filters)
    expect(result).toStrictEqual(['vessel1', 'vessel3'])
  })

  it('should applies multiple filters simultaneously', () => {
    const filters = {
      countryCodes: ['US'],
      districtCodes: [],
      emitsPositions: [],
      fleetSegments: ['segment1'],
      gearCodes: ['gear1'],
      hasLogbook: true,
      landingPortLocodes: [],
      lastControlPeriod: undefined,
      lastPositionHoursAgo: 2,
      producerOrganizations: [],
      riskFactors: [1],
      specyCodes: ['specy1'],
      vesselSize: VesselSize.ABOVE_TWELVE_METERS,
      vesselsLocation: [VesselLocation.PORT],
      zones: []
    }

    const result = MonitorFishWebWorker.getFilteredVessels(DUMMY_LAST_POSITIONS, filters)

    expect(result).toStrictEqual(['vessel1'])
    expect(result).not.toEqual(expect.arrayContaining(['vessel2']))
  })

  it('should filter by zone', () => {
    const filters = {
      ...DEFAULT_VESSEL_LIST_FILTER_VALUES,
      vesselsLocation: [],
      zones: [
        {
          feature: {
            coordinates: [
              [
                [
                  [-10.02143724, 49.49120734],
                  [-5.59159502, 49.52808407],
                  [-3.6038453, 47.41042395],
                  [-9.42511233, 46.76271576],
                  [-10.02143724, 49.49120734]
                ]
              ]
            ],
            type: 'MultiPolygon' as 'MultiPolygon'
          },
          label: 'Zone de filtre manuelle',
          value: 'CUSTOM'
        }
      ]
    }

    const result = MonitorFishWebWorker.getFilteredVessels(DUMMY_LAST_POSITIONS, filters)

    expect(result).toStrictEqual(['vessel1'])
    expect(result).not.toEqual(expect.arrayContaining(['vessel2']))
  })
})
