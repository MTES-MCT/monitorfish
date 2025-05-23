import { FleetSegmentSchema } from '@features/FleetSegment/types'
import { ActiveVesselEmittingPositionSchema } from '@features/Vessel/schemas/ActiveVesselSchema'
import { expect } from '@jest/globals'
import { parseResponseOrReturn } from '@utils/parseResponseOrReturn'

describe('utils/parseResponseOrReturn()', () => {
  it('should return the original response and print an error', () => {
    const object = { dummy: true }

    const result = parseResponseOrReturn(object, ActiveVesselEmittingPositionSchema, false)

    expect(result).toStrictEqual(object)
  })

  it('should return the original response and print an error with an array', () => {
    const object = { dummy: true }

    const result = parseResponseOrReturn([object], ActiveVesselEmittingPositionSchema, true)

    expect(result).toStrictEqual([object])
  })

  it('should validate the type successfully', () => {
    const segment = {
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
      year: 2021
    }

    const result = parseResponseOrReturn(segment, FleetSegmentSchema, false)

    expect(result).toStrictEqual(segment)
  })
})
