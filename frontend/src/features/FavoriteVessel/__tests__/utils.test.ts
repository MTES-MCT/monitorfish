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

  it('Should not match when this has a vesselIdentifier but the other does not', () => {
    const bareCfr: Vessel.VesselIdentity = {
      ...PHENOMENE,
      ircs: undefined,
      vesselId: undefined,
      vesselIdentifier: undefined
    }

    expect(isSameVesselIdentity({ ...PHENOMENE, vesselId: undefined }, bareCfr)).toBe(false)
  })

  it('Should not match when the vesselIdentifier field differs', () => {
    expect(
      isSameVesselIdentity(
        { ...PHENOMENE, vesselId: undefined },
        { ...PHENOMENE, internalReferenceNumber: 'OTHER_CFR', vesselId: undefined }
      )
    ).toBe(false)
  })

  it('Should not match when vesselIdentifiers differ even if a shared identifier field is equal', () => {
    const sameIrcsButDifferentDesignatedIdentifier: Vessel.VesselIdentity = {
      ...PHENOMENE,
      internalReferenceNumber: undefined,
      vesselId: undefined,
      vesselIdentifier: VesselIdentifier.IRCS
    }

    expect(isSameVesselIdentity({ ...PHENOMENE, vesselId: undefined }, sameIrcsButDifferentDesignatedIdentifier)).toBe(
      false
    )
  })

  it('Should match on a shared identifier field when neither identity has a vesselIdentifier', () => {
    const bare: Vessel.VesselIdentity = {
      ...PHENOMENE,
      vesselId: undefined,
      vesselIdentifier: undefined
    }

    expect(isSameVesselIdentity(bare, { ...bare, vesselName: 'OTHER_NAME' })).toBe(true)
  })

  it('Should not match when neither identity has a vesselIdentifier and no field is shared', () => {
    const bare: Vessel.VesselIdentity = {
      ...PHENOMENE,
      vesselId: undefined,
      vesselIdentifier: undefined
    }

    expect(isSameVesselIdentity(bare, { ...bare, internalReferenceNumber: 'OTHER_CFR' })).toBe(false)
  })
})
