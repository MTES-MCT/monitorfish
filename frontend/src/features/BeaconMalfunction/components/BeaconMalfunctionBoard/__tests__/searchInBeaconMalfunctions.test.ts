import { describe, expect, it } from '@jest/globals'

import { BeaconMalfunctionsStage } from '../../../constants'
import { searchInBeaconMalfunctions } from '../utils'

import type { BeaconMalfunction } from '../../../types'

const makeBeaconMalfunction = (overrides: Record<string, any>) => ({
  endOfBeaconMalfunctionReason: undefined,
  externalReferenceNumber: 'EXT-001',
  flagState: 'FR',
  id: 1,
  internalReferenceNumber: 'CFR001',
  ircs: 'IRCS001',
  malfunctionEndDateTime: undefined,
  malfunctionStartDateTime: '2024-01-01T00:00:00Z',
  notificationRequested: undefined,
  stage: BeaconMalfunctionsStage.INITIAL_ENCOUNTER,
  vesselIdentifier: 'INTERNAL_REFERENCE_NUMBER',
  vesselName: 'VESSEL ONE',
  vesselStatus: 'AT_SEA' as any,
  vesselStatusLastModificationDateTime: '2024-01-01T00:00:00Z',
  ...overrides
})

const vessel1 = makeBeaconMalfunction({
  id: 1,
  internalReferenceNumber: 'CFR001',
  vesselName: 'VESSEL ONE',
  vesselStatus: 'AT_SEA' as any
})
const vessel2 = makeBeaconMalfunction({
  id: 2,
  internalReferenceNumber: 'CFR002',
  vesselName: 'VESSEL TWO',
  vesselStatus: 'AT_PORT' as any
})
const vessel3 = makeBeaconMalfunction({
  id: 3,
  internalReferenceNumber: 'CFR003',
  vesselName: 'OTHER BOAT',
  vesselStatus: 'AT_SEA' as any
})

const malfunctions = {
  [BeaconMalfunctionsStage.INITIAL_ENCOUNTER]: [vessel1, vessel2, vessel3],
  [BeaconMalfunctionsStage.FOLLOWING]: [],
  [BeaconMalfunctionsStage.AT_QUAY]: [],
  [BeaconMalfunctionsStage.FOUR_HOUR_REPORT]: [],
  [BeaconMalfunctionsStage.TARGETING_VESSEL]: [],
  [BeaconMalfunctionsStage.RESUMED_TRANSMISSION]: [],
  [BeaconMalfunctionsStage.END_OF_MALFUNCTION]: [],
  [BeaconMalfunctionsStage.ARCHIVED]: []
} as Record<BeaconMalfunctionsStage, BeaconMalfunction[]>

describe('searchInBeaconMalfunctions()', () => {
  it('returns all malfunctions when search term is empty and no status filter', () => {
    const result = searchInBeaconMalfunctions(malfunctions, '', undefined)

    expect(result[BeaconMalfunctionsStage.INITIAL_ENCOUNTER]).toHaveLength(3)
  })

  it('returns all malfunctions when search term is one character (below threshold)', () => {
    const result = searchInBeaconMalfunctions(malfunctions, 'V', undefined)

    expect(result[BeaconMalfunctionsStage.INITIAL_ENCOUNTER]).toHaveLength(3)
  })

  it('filters by vessel name (case-insensitive, accent-insensitive)', () => {
    const result = searchInBeaconMalfunctions(malfunctions, 'vessel', undefined)

    const hits = result[BeaconMalfunctionsStage.INITIAL_ENCOUNTER]
    expect(hits).toHaveLength(2)
    expect(hits.map(v => v.id)).toEqual(expect.arrayContaining([1, 2]))
  })

  it('filters by internal reference number (CFR)', () => {
    const result = searchInBeaconMalfunctions(malfunctions, 'CFR001', undefined)

    const hits = result[BeaconMalfunctionsStage.INITIAL_ENCOUNTER]
    expect(hits).toHaveLength(1)
    expect(hits[0]!.id).toBe(1)
  })

  it('returns empty arrays for stages with no matching vessels', () => {
    const result = searchInBeaconMalfunctions(malfunctions, 'VESSEL', undefined)

    expect(result[BeaconMalfunctionsStage.FOLLOWING]).toHaveLength(0)
    expect(result[BeaconMalfunctionsStage.AT_QUAY]).toHaveLength(0)
  })

  it('filters by vessel status', () => {
    const atSeaFilter = { value: 'AT_SEA' } as any

    const result = searchInBeaconMalfunctions(malfunctions, '', atSeaFilter)

    const hits = result[BeaconMalfunctionsStage.INITIAL_ENCOUNTER]
    expect(hits).toHaveLength(2)
    expect(hits.map(v => v.id)).toEqual(expect.arrayContaining([1, 3]))
  })

  it('combines vessel name search with status filter', () => {
    const atSeaFilter = { value: 'AT_SEA' } as any

    const result = searchInBeaconMalfunctions(malfunctions, 'vessel', atSeaFilter)

    const hits = result[BeaconMalfunctionsStage.INITIAL_ENCOUNTER]
    expect(hits).toHaveLength(1)
    expect(hits[0]!.id).toBe(1)
  })

  it('returns empty arrays when no vessel matches the search term', () => {
    const result = searchInBeaconMalfunctions(malfunctions, 'UNKNOWN VESSEL NAME', undefined)

    expect(result[BeaconMalfunctionsStage.INITIAL_ENCOUNTER]).toHaveLength(0)
  })
})
