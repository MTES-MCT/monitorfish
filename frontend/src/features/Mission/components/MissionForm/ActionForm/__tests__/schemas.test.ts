import { MissionAction } from '@features/Mission/missionAction.types'
import { expect } from '@jest/globals'

import {
  // eslint-disable-next-line import/first
  getLandControlFormCompletionSchema,
  getSeaControlFormCompletionSchema,
  InfractionFormCompletionSchema,
  InfractionFormLiveSchema
} from '../schemas'

jest.mock('store/index', () => ({
  mainStore: {
    getState: () => ({
      gear: { gears: [] },
      missionForm: { draft: null }
    })
  }
}))

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

  describe('getSeaControlFormCompletionSchema', () => {
    const completionValuesWithoutEISR = {
      actionDatetimeUtc: '2026-06-15T10:00:00Z',
      completedBy: 'DEF',
      emitsAis: MissionAction.ControlCheck.YES,
      emitsVms: MissionAction.ControlCheck.YES,
      gearOnboard: [{ gearWasControlled: true }],
      isINNControl: false,
      isLastHaul: false,
      latitude: 48.4,
      licencesMatchActivity: MissionAction.ControlCheck.YES,
      logbookMatchesActivity: MissionAction.ControlCheck.YES,
      longitude: -4.5,
      separateStowageOfPreservedSpecies: MissionAction.ControlCheck.YES,
      speciesSizeControlled: MissionAction.ControlCheck.YES,
      speciesWeightControlled: MissionAction.ControlCheck.YES,
      userTrigram: 'ABC',
      vesselId: 1,
      vesselTargeted: MissionAction.ControlCheck.YES
    }

    const eisrFields = {
      europeanFishingLicenceValid: MissionAction.ControlCheck.YES,
      gangwayPresentAndCompliant: MissionAction.ControlCheck.YES,
      logbookOpenedPriorToControl: MissionAction.ControlCheck.YES,
      onboardWeighingPermit: MissionAction.ControlCheck.NO,
      stowagePlanPresent: MissionAction.ControlCheck.YES,
      underSizedSeparateRecording: MissionAction.ControlCheck.YES,
      underSizedSeparateStowage: MissionAction.ControlCheck.YES
    }

    it('should pass validation without e-ISR fields When e-ISR is disabled', () => {
      expect(getSeaControlFormCompletionSchema(false).isValidSync(completionValuesWithoutEISR)).toBe(true)
    })

    it('should fail validation without e-ISR fields When e-ISR is enabled', () => {
      expect(getSeaControlFormCompletionSchema(true).isValidSync(completionValuesWithoutEISR)).toBe(false)
    })

    it('should pass validation with e-ISR fields When e-ISR is enabled', () => {
      expect(
        getSeaControlFormCompletionSchema(true).isValidSync({
          ...completionValuesWithoutEISR,
          ...eisrFields,
          gearOnboard: [{ gearMarkingIsCompliant: MissionAction.ControlCheck.YES, gearWasControlled: true }]
        })
      ).toBe(true)
    })

    it('should fail validation When e-ISR is enabled and a gear is missing gearMarkingIsCompliant', () => {
      expect(
        getSeaControlFormCompletionSchema(true).isValidSync({
          ...completionValuesWithoutEISR,
          ...eisrFields
        })
      ).toBe(false)
    })

    it('should pass validation When e-ISR is disabled and a gear is missing gearMarkingIsCompliant', () => {
      expect(getSeaControlFormCompletionSchema(false).isValidSync(completionValuesWithoutEISR)).toBe(true)
    })
  })

  describe('getLandControlFormCompletionSchema', () => {
    // On land controls VMS and AIS emissions are still controlled.
    const completionValuesWithoutEISR = {
      actionDatetimeUtc: '2026-06-15T10:00:00Z',
      completedBy: 'DEF',
      emitsAis: MissionAction.ControlCheck.NOT_APPLICABLE,
      emitsVms: MissionAction.ControlCheck.NOT_APPLICABLE,
      gearOnboard: [{ gearWasControlled: true }],
      isLastHaul: false,
      licencesMatchActivity: MissionAction.ControlCheck.YES,
      logbookMatchesActivity: MissionAction.ControlCheck.YES,
      portLocode: 'FRAUR',
      separateStowageOfPreservedSpecies: MissionAction.ControlCheck.YES,
      speciesSizeControlled: MissionAction.ControlCheck.YES,
      speciesWeightControlled: MissionAction.ControlCheck.YES,
      userTrigram: 'ABC',
      vesselId: 1,
      vesselTargeted: MissionAction.ControlCheck.YES
    }

    // e-ISR fields shared with the sea control.
    const eisrFields = {
      europeanFishingLicenceValid: MissionAction.ControlCheck.YES,
      logbookOpenedPriorToControl: MissionAction.ControlCheck.YES,
      onboardWeighingPermit: MissionAction.ControlCheck.NO,
      stowagePlanPresent: MissionAction.ControlCheck.YES,
      underSizedSeparateRecording: MissionAction.ControlCheck.YES,
      underSizedSeparateStowage: MissionAction.ControlCheck.YES
    }

    // The land-specific obligation check, required only when e-ISR is enabled.
    const landEisrChecks = {
      portEntranceAndLandingAuthorized: MissionAction.ControlCheck.YES
    }

    // The land-specific species checks (two subsections), required only when e-ISR is enabled.
    const landEisrSpeciesChecks = {
      holdControlledAfterUnloading: MissionAction.ControlCheck.YES,
      minimumConservationReferenceSizeControlled: MissionAction.ControlCheck.YES,
      underSizedSeparateRecording: MissionAction.ControlCheck.YES,
      weighingOperationsMonitoredByInspectors: MissionAction.ControlCheck.YES
    }

    const gearOnboardWithEISR = [{ gearMarkingIsCompliant: MissionAction.ControlCheck.YES, gearWasControlled: true }]

    it('should pass validation without e-ISR fields When e-ISR is disabled', () => {
      expect(getLandControlFormCompletionSchema(false).isValidSync(completionValuesWithoutEISR)).toBe(true)
    })

    it('should fail validation without e-ISR fields When e-ISR is enabled', () => {
      expect(getLandControlFormCompletionSchema(true).isValidSync(completionValuesWithoutEISR)).toBe(false)
    })

    it('should pass validation with e-ISR fields including the land-specific obligation and species checks When e-ISR is enabled', () => {
      expect(
        getLandControlFormCompletionSchema(true).isValidSync({
          ...completionValuesWithoutEISR,
          ...eisrFields,
          ...landEisrChecks,
          ...landEisrSpeciesChecks,
          gearOnboard: gearOnboardWithEISR
        })
      ).toBe(true)
    })

    it('should fail validation When e-ISR is enabled and the land-specific obligation checks are missing', () => {
      expect(
        getLandControlFormCompletionSchema(true).isValidSync({
          ...completionValuesWithoutEISR,
          ...eisrFields,
          ...landEisrSpeciesChecks,
          gearOnboard: gearOnboardWithEISR
        })
      ).toBe(false)
    })

    it('should fail validation When e-ISR is enabled and the land-specific species checks are missing', () => {
      expect(
        getLandControlFormCompletionSchema(true).isValidSync({
          ...completionValuesWithoutEISR,
          ...eisrFields,
          ...landEisrChecks,
          gearOnboard: gearOnboardWithEISR
        })
      ).toBe(false)
    })

    it('should pass validation When e-ISR is disabled even without the land-specific obligation checks', () => {
      expect(getLandControlFormCompletionSchema(false).isValidSync(completionValuesWithoutEISR)).toBe(true)
    })
  })
})
