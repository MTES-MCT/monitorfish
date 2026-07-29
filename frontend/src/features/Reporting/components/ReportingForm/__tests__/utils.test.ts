import { ReportingOriginSource } from '@features/Reporting/types/ReportingOriginSource'
import { ReportingType } from '@features/Reporting/types/ReportingType'
import { ReportingValidityOption } from '@features/Reporting/types/ReportingValidityOption'
import { describe, expect, it } from '@jest/globals'
import { customDayjs } from '@mtes-mct/monitor-ui'

import { getDuplicatedFormFields, getFormFields } from '../utils'

import type { FormEditedReporting } from '@features/Reporting/types'

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

describe('getDuplicatedFormFields', () => {
  const iuuFormFields = {
    authorContact: 'Jean Bon (0612365896)',
    cfr: 'FR123456789',
    description: 'Some description',
    expirationDate: '2100-01-01T00:00:00.000Z',
    externalMarker: 'AB123',
    flagState: 'FR',
    gearCode: 'PTM',
    imo: '1234567',
    infractions: [{ threatHierarchy: { natinf: 27717 } }],
    ircs: 'CALLME',
    isArchived: false,
    isFishing: true,
    isIUU: true,
    isUnknownVessel: false,
    latitude: 48.1,
    length: 24,
    longitude: -4.9,
    mmsi: '123456789',
    numberOfVessels: 1,
    otherSourceType: undefined,
    reportingDate: '2024-01-01T00:00:00.000Z',
    reportingSource: ReportingOriginSource.OPS,
    title: 'Some title',
    type: ReportingType.INFRACTION_SUSPICION,
    validityOption: ReportingValidityOption.CUSTOM,
    vesselId: 1234,
    vesselIdentifier: 'INTERNAL_REFERENCE_NUMBER',
    vesselName: 'MY VESSEL'
  } as unknown as FormEditedReporting

  it('clears the whole vessel block', () => {
    const fields = getDuplicatedFormFields(iuuFormFields)

    expect(fields.cfr).toBeUndefined()
    expect(fields.externalMarker).toBeUndefined()
    expect(fields.flagState).toBe('UNDEFINED')
    expect(fields.gearCode).toBeUndefined()
    expect(fields.imo).toBeUndefined()
    expect(fields.ircs).toBeUndefined()
    expect(fields.isFishing).toBeUndefined()
    expect(fields.isUnknownVessel).toBe(false)
    expect(fields.length).toBeUndefined()
    expect(fields.mmsi).toBeUndefined()
    expect(fields.vesselId).toBeUndefined()
    expect(fields.vesselIdentifier).toBeUndefined()
    expect(fields.vesselName).toBeUndefined()
  })

  it('keeps every other value', () => {
    const fields = getDuplicatedFormFields(iuuFormFields)

    expect(fields).toMatchObject({
      authorContact: 'Jean Bon (0612365896)',
      description: 'Some description',
      expirationDate: '2100-01-01T00:00:00.000Z',
      infractions: [{ threatHierarchy: { natinf: 27717 } }],
      latitude: 48.1,
      longitude: -4.9,
      numberOfVessels: 1,
      reportingDate: '2024-01-01T00:00:00.000Z',
      reportingSource: ReportingOriginSource.OPS,
      title: 'Some title',
      type: ReportingType.INFRACTION_SUSPICION,
      validityOption: ReportingValidityOption.CUSTOM
    })
  })

  it('unarchives the copy and refreshes an outdated validity date', () => {
    const fields = getDuplicatedFormFields({
      ...iuuFormFields,
      expirationDate: '2024-06-01T00:00:00.000Z',
      isArchived: true
    })

    expect(fields.isArchived).toBe(false)
    expect(customDayjs().isBefore(fields.expirationDate)).toBe(true)
  })

  it('marks the vessels as unknown when the reporting is about several vessels', () => {
    const fields = getDuplicatedFormFields({ ...iuuFormFields, numberOfVessels: 3 })

    expect(fields.isUnknownVessel).toBe(true)
    expect(fields.numberOfVessels).toBe(3)
  })
})
