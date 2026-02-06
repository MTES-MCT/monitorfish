import { MissionAction } from '@features/Mission/missionAction.types'
import { expect } from '@jest/globals'

// @ts-ignore
jest.mock('store/index', () => ({
  mainStore: {
    getState: () => ({
      gear: { gears: [] },
      missionForm: { draft: null }
    })
  }
}))

// eslint-disable-next-line import/first
import { InfractionFormCompletionSchema, InfractionFormLiveSchema } from '../schemas'

describe('ActionForm/schemas', () => {
  describe('InfractionFormLiveSchema', () => {
    it('should pass validation When infraction type is PENDING without threats', () => {
      const data = InfractionFormLiveSchema.validateSync({
        infractionType: MissionAction.InfractionType.PENDING
      })

      expect(data).toBeTruthy()
      expect(data.infractionType).toBe(MissionAction.InfractionType.PENDING)
    })

    it('should pass validation When infraction type is WITH_RECORD with threats', () => {
      const data = InfractionFormLiveSchema.validateSync({
        infractionType: MissionAction.InfractionType.WITH_RECORD,
        threats: [{ natinfCode: 1234 }]
      })

      expect(data).toBeTruthy()
      expect(data.infractionType).toBe(MissionAction.InfractionType.WITH_RECORD)
    })

    it('should pass validation When infraction type is WITHOUT_RECORD with threats', () => {
      const data = InfractionFormLiveSchema.validateSync({
        infractionType: MissionAction.InfractionType.WITHOUT_RECORD,
        threats: [{ natinfCode: 5678 }]
      })

      expect(data).toBeTruthy()
      expect(data.infractionType).toBe(MissionAction.InfractionType.WITHOUT_RECORD)
    })

    it('should fail validation When infraction type is WITH_RECORD without threats', () => {
      expect.assertions(2)

      try {
        InfractionFormLiveSchema.validateSync(
          {
            infractionType: MissionAction.InfractionType.WITH_RECORD
          },
          { abortEarly: false }
        )
      } catch (err: any) {
        expect(err.errors).toHaveLength(1)
        expect(err.errors[0]).toBe('HIDDEN_ERROR')
      }
    })

    it('should fail validation When infraction type is WITHOUT_RECORD without threats', () => {
      expect.assertions(2)

      try {
        InfractionFormLiveSchema.validateSync(
          {
            infractionType: MissionAction.InfractionType.WITHOUT_RECORD
          },
          { abortEarly: false }
        )
      } catch (err: any) {
        expect(err.errors).toHaveLength(1)
        expect(err.errors[0]).toBe('HIDDEN_ERROR')
      }
    })
  })

  describe('InfractionFormCompletionSchema', () => {
    it('should pass validation When infraction type is WITH_RECORD with threats', () => {
      const data = InfractionFormCompletionSchema.validateSync({
        infractionType: MissionAction.InfractionType.WITH_RECORD,
        threats: [{ natinfCode: 1234 }]
      })

      expect(data).toBeTruthy()
      expect(data.infractionType).toBe(MissionAction.InfractionType.WITH_RECORD)
    })

    it('should pass validation When infraction type is WITHOUT_RECORD with threats', () => {
      const data = InfractionFormCompletionSchema.validateSync({
        infractionType: MissionAction.InfractionType.WITHOUT_RECORD,
        threats: [{ natinfCode: 5678 }]
      })

      expect(data).toBeTruthy()
      expect(data.infractionType).toBe(MissionAction.InfractionType.WITHOUT_RECORD)
    })

    it('should fail validation When infraction type is PENDING', () => {
      expect.assertions(2)

      try {
        InfractionFormCompletionSchema.validateSync(
          {
            infractionType: MissionAction.InfractionType.PENDING
          },
          { abortEarly: false }
        )
      } catch (err: any) {
        expect(err.errors).toHaveLength(1)
        expect(err.errors[0]).toBe('HIDDEN_ERROR')
      }
    })
  })
})
