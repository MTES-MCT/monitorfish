import { expect } from '@jest/globals'
import dayjs from 'dayjs'

import { SilencedAlertSchema } from '../schemas'

describe('SideWindow/SilencedAlerts/schema.ts', () => {
  it('should not throw an error When the schema is valid', () => {
    const data = SilencedAlertSchema.validateSync({
      externalReferenceNumber: undefined,
      flagState: 'FR',
      internalReferenceNumber: 'FR26554654',
      ircs: undefined,
      silencedBeforeDate: dayjs(),
      value: { type: 'ALERT_TYPE' },
      vesselId: undefined,
      vesselIdentifier: 'INTERNAL_REFERENCE_NUMBER',
      vesselName: 'Vessel Name'
    })

    expect(data).toBeTruthy()
  })

  it('should throw an error When all of the vessel required field are missing', () => {
    try {
      const data = SilencedAlertSchema.validateSync(
        {
          externalReferenceNumber: undefined,
          flagState: 'FR',
          internalReferenceNumber: undefined,
          ircs: undefined,
          silencedBeforeDate: dayjs(),
          value: { type: 'ALERT_TYPE' },
          vesselId: undefined,
          vesselIdentifier: 'INTERNAL_REFERENCE_NUMBER',
          vesselName: 'Vessel Name'
        },
        { abortEarly: false }
      )

      expect(data).toBeFalsy()
    } catch (err: any) {
      expect(err.errors).toHaveLength(4)
      expect(err.errors[0]).toContain('Veuillez indiquer le navire')
    }
  })
})
