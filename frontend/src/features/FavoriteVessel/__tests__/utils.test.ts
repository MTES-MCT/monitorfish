import { isSameVesselIdentity } from '@features/FavoriteVessel/utils'
import { VesselIdentifier } from '@features/Vessel/schemas/ActiveVesselSchema'
import { describe, expect, it } from '@jest/globals'

import type { Vessel } from '@features/Vessel/Vessel.types'

const PHENOMENE: Vessel.VesselIdentity = {
  beaconNumber: undefined,
  districtCode: undefined,
  externalReferenceNumber: 'DONTSINK',
  flagState: 'FR',
  internalReferenceNumber: 'FAK000999999',
  ircs: 'CALLME',
  mmsi: undefined,
  vesselId: 1,
  vesselIdentifier: VesselIdentifier.INTERNAL_REFERENCE_NUMBER,
  vesselLength: undefined,
  vesselName: 'PHENOMENE'
}

describe('isSameVesselIdentity()', () => {
  it('Should match on vesselId when both identities carry one', () => {
    expect(
      isSameVesselIdentity(PHENOMENE, { ...PHENOMENE, internalReferenceNumber: undefined, vesselName: 'OTHER' })
    ).toBe(true)
  })

  it('Should not match when both vesselIds are set but differ', () => {
    expect(isSameVesselIdentity(PHENOMENE, { ...PHENOMENE, vesselId: 2 })).toBe(false)
  })

  it('Should fall back to the vesselIdentifier field when no vesselId is available', () => {
    const rebuiltFromSearch: Vessel.VesselIdentity = {
      ...PHENOMENE,
      ircs: undefined,
      vesselId: undefined
    }

    expect(isSameVesselIdentity({ ...PHENOMENE, vesselId: undefined }, rebuiltFromSearch)).toBe(true)
  })

  it('Should use its own vesselIdentifier when the other identity has none', () => {
    const bareCfr: Vessel.VesselIdentity = {
      ...PHENOMENE,
      ircs: undefined,
      vesselId: undefined,
      vesselIdentifier: undefined
    }

    expect(isSameVesselIdentity(PHENOMENE, bareCfr)).toBe(true)
  })

  it('Should not match when the vesselIdentifier field differs', () => {
    expect(
      isSameVesselIdentity(
        { ...PHENOMENE, vesselId: undefined },
        { ...PHENOMENE, internalReferenceNumber: 'OTHER_CFR', vesselId: undefined }
      )
    ).toBe(false)
  })

  it('Should not match when neither a vesselId nor a vesselIdentifier is available', () => {
    const bare: Vessel.VesselIdentity = {
      ...PHENOMENE,
      vesselId: undefined,
      vesselIdentifier: undefined
    }

    expect(isSameVesselIdentity(bare, bare)).toBe(false)
  })
})
