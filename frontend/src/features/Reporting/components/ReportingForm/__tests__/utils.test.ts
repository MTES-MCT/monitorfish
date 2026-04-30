import { ReportingOriginSource } from '@features/Reporting/types/ReportingOriginSource'
import { ReportingType } from '@features/Reporting/types/ReportingType'
import { ReportingValidityOption } from '@features/Reporting/types/ReportingValidityOption'
import { describe, expect, it } from '@jest/globals'

import { getFormFields } from '../utils'

const baseReporting = {
  cfr: 'FR123456789',
  createdBy: 'user',
  creationDate: '2024-01-01T00:00:00.000Z',
  expirationDate: '2024-06-01T00:00:00.000Z',
  externalMarker: undefined,
  flagState: 'FR',
  gearCode: undefined,
  id: 1,
  imo: undefined,
  infraction: undefined,
  ircs: undefined,
  isArchived: false,
  isDeleted: false,
  isFishing: undefined,
  isIUU: false,
  lastUpdateDate: '2024-01-01T00:00:00.000Z',
  latitude: undefined,
  length: undefined,
  longitude: undefined,
  mmsi: undefined,
  reportingDate: '2024-01-01T00:00:00.000Z',
  type: ReportingType.OBSERVATION,
  underCharter: undefined,
  validationDate: undefined,
  validityOption: undefined,
  value: {
    authorContact: undefined,
    authorTrigram: undefined,
    controlUnit: undefined,
    controlUnitId: undefined,
    description: 'Some description',
    dml: undefined,
    numberOfVessels: undefined,
    otherSourceType: undefined,
    reportingSource: ReportingOriginSource.OPS,
    satelliteType: undefined,
    seaFront: undefined,
    title: 'Some title'
  },
  vesselId: undefined,
  vesselIdentifier: undefined,
  vesselName: 'MY VESSEL'
}

describe('getFormFields', () => {
  it('keeps expirationDate for a CUSTOM reporting', () => {
    const reporting = { ...baseReporting, validityOption: ReportingValidityOption.CUSTOM }
    const fields = getFormFields(reporting as any)

    expect(fields.expirationDate).toBe(baseReporting.expirationDate)
    expect(fields.validityOption).toBe(ReportingValidityOption.CUSTOM)
  })

  it('clears expirationDate when validityOption is ONE_MONTH to enforce mutual exclusivity', () => {
    const reporting = { ...baseReporting, validityOption: ReportingValidityOption.ONE_MONTH }
    const fields = getFormFields(reporting as any)

    expect(fields.expirationDate).toBeUndefined()
    expect(fields.validityOption).toBe(ReportingValidityOption.ONE_MONTH)
  })

  it('clears expirationDate when validityOption is TWELVE_MONTHS to enforce mutual exclusivity', () => {
    const reporting = { ...baseReporting, validityOption: ReportingValidityOption.TWELVE_MONTHS }
    const fields = getFormFields(reporting as any)

    expect(fields.expirationDate).toBeUndefined()
    expect(fields.validityOption).toBe(ReportingValidityOption.TWELVE_MONTHS)
  })

  it('keeps expirationDate undefined for UNTIL_NEXT_DEP', () => {
    const reporting = {
      ...baseReporting,
      expirationDate: undefined,
      validityOption: ReportingValidityOption.UNTIL_NEXT_DEP
    }
    const fields = getFormFields(reporting as any)

    expect(fields.expirationDate).toBeUndefined()
    expect(fields.validityOption).toBe(ReportingValidityOption.UNTIL_NEXT_DEP)
  })

  it('keeps expirationDate undefined for INDEFINITE', () => {
    const reporting = {
      ...baseReporting,
      expirationDate: undefined,
      validityOption: ReportingValidityOption.INDEFINITE
    }
    const fields = getFormFields(reporting as any)

    expect(fields.expirationDate).toBeUndefined()
    expect(fields.validityOption).toBe(ReportingValidityOption.INDEFINITE)
  })

  it('uses INFRACTION_SUSPICION type when creating from scratch', () => {
    const fields = getFormFields(undefined)

    expect(fields.type).toBe(ReportingType.INFRACTION_SUSPICION)
  })

  it('sets IUU defaults when isIUU is true', () => {
    const fields = getFormFields(undefined, true)

    expect(fields.validityOption).toBe(ReportingValidityOption.CUSTOM)
    expect(fields.numberOfVessels).toBe(1)
    expect(fields.expirationDate).toBeDefined()
  })
})
