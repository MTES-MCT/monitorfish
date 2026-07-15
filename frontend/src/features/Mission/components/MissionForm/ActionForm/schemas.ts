/* eslint-disable sort-keys-fix/sort-keys-fix */

import { HIDDEN_ERROR } from '@features/Mission/components/MissionForm/constants'
import { MissionAction } from '@features/Mission/missionAction.types'
import { customDayjs } from '@mtes-mct/monitor-ui'
import { mainStore } from '@store'
import { array, boolean, number, object, string } from 'yup'

function makeEIsrDeclarativeObligationsSchema(isEISR: boolean) {
  return isEISR
    ? object({
        logbookOpenedPriorToControl: string().required(HIDDEN_ERROR),
        europeanFishingLicenceValid: string().required(HIDDEN_ERROR),
        stowagePlanPresent: string().required(HIDDEN_ERROR),
        onboardWeighingPermit: string().required(HIDDEN_ERROR),
        weighingCertificateAndSystemsValid: string().when('onboardWeighingPermit', {
          is: (val?: string) => val === MissionAction.ControlCheck.YES,
          then: schema => schema.required(HIDDEN_ERROR),
          otherwise: schema => schema.notRequired()
        })
      })
    : object({})
}

function makeSeaControlEIsrObligationsSchema(isEISR: boolean) {
  return isEISR
    ? object({
        gangwayPresentAndCompliant: string().required(HIDDEN_ERROR)
      })
    : object({})
}

function makeLandControlEIsrObligationsSchema(isEISR: boolean) {
  return isEISR
    ? object({
        portEntranceAndLandingAuthorized: string().required(HIDDEN_ERROR)
      })
    : object({})
}

function makeEIsrSpeciesSchema(isEISR: boolean) {
  return isEISR
    ? object({
        underSizedSeparateStowage: string().required(HIDDEN_ERROR),
        underSizedSeparateRecording: string().required(HIDDEN_ERROR)
      })
    : object({})
}

// On land controls under e-ISR, the sea species checks are replaced by these subsection fields.
function makeLandControlEIsrSpeciesSchema(isEISR: boolean) {
  return isEISR
    ? object({
        underSizedSeparateRecording: string().required(HIDDEN_ERROR),
        minimumConservationReferenceSizeControlled: string().required(HIDDEN_ERROR),
        weightControlMethod: string().required(HIDDEN_ERROR),
        holdControlledAfterUnloading: string().required(HIDDEN_ERROR),
        weighingOperationsMonitoredByInspectors: string().required(HIDDEN_ERROR)
      })
    : object({})
}

// On non-e-ISR land controls, the legacy species checks are still required.
function makeNonEIsrLandSpeciesSchema(isEISR: boolean) {
  return isEISR
    ? object({})
    : object({
        speciesWeightControlled: string().required(HIDDEN_ERROR),
        speciesSizeControlled: string().required(HIDDEN_ERROR),
        separateStowageOfPreservedSpecies: string().required(HIDDEN_ERROR)
      })
}

function makeEIsrSpeciesOnboardSchema(isEISR: boolean) {
  return isEISR
    ? object({
        faoZones: array().of(string()).required(HIDDEN_ERROR).min(1, HIDDEN_ERROR)
      })
    : object({})
}

function makeDiscardedSpeciesSchema(isEISR: boolean) {
  return isEISR
    ? object({
        discardReason: string().required(HIDDEN_ERROR),
        rejectedWeight: number().required(HIDDEN_ERROR),
        faoZones: array().of(string()).required(HIDDEN_ERROR).min(1, HIDDEN_ERROR)
      })
    : object({})
}

// -----------------------------------------------------------------------------
// Form Schema Validators

const actionDatetimeUtcValidator = string()
  .required(HIDDEN_ERROR)
  .test({
    message: 'La date du contrôle doit être postérieure à la date de début de la mission.',
    test: (actionDatetimeUtc: string | undefined) => {
      const { draft } = mainStore.getState().missionForm
      const mission = draft?.mainFormValues
      if (!mission) {
        return true
      }

      if (!actionDatetimeUtc || !mission.startDateTimeUtc) {
        return true
      }

      return customDayjs(actionDatetimeUtc).isSameOrAfter(mission.startDateTimeUtc)
    }
  })
  .test({
    message: 'La date du contrôle doit être antérieure à la date de fin de la mission.',
    test: (actionDatetimeUtc: string | undefined) => {
      const { draft } = mainStore.getState().missionForm
      const mission = draft?.mainFormValues
      if (!mission) {
        return true
      }

      if (!actionDatetimeUtc || !mission.endDateTimeUtc) {
        return true
      }

      return customDayjs(actionDatetimeUtc).isSameOrBefore(mission.endDateTimeUtc)
    }
  })

export function makeGearOnboardSchema(isEISR: boolean) {
  return object({
    gearWasControlled: boolean().required(HIDDEN_ERROR),
    declaredMesh: number().when(['gearCode', 'controlledMesh'], {
      is: (gearCode, controlledMesh, context) => {
        const { gears } = mainStore.getState().gear
        const isMeshRequiredForSegment = gears.find(gear => gear.code === gearCode)?.isMeshRequiredForSegment
        const declaredMesh = context?.parent?.declaredMesh

        if (isMeshRequiredForSegment) {
          return controlledMesh === undefined && declaredMesh === undefined
        }

        return false
      },
      then: schema => schema.required('Au moins un maillage déclaré ou contrôlé est requis pour cet engin.'),
      otherwise: schema => schema.notRequired()
    }),
    controlledMesh: number(),
    gearMarkingIsCompliant: isEISR ? string().required(HIDDEN_ERROR) : string().notRequired()
  })
}

// -----------------------------------------------------------------------------
// Air Control Action Form

export const AirControlFormLiveSchema = object({
  actionDatetimeUtc: actionDatetimeUtcValidator,
  latitude: number().required(HIDDEN_ERROR),
  longitude: number().required(HIDDEN_ERROR),
  vesselId: number().required(HIDDEN_ERROR),
  userTrigram: string().trim().required(HIDDEN_ERROR)
})

export const AirControlFormCompletionSchema = AirControlFormLiveSchema.concat(
  object({
    isINNControl: boolean().required(HIDDEN_ERROR),
    completedBy: string().trim().required(HIDDEN_ERROR)
  })
)

// -----------------------------------------------------------------------------
// Air Surveillance Action Form

export const AirSurveillanceFormLiveSchema = object({
  userTrigram: string().trim().required(HIDDEN_ERROR)
})

export const AirSurveillanceFormCompletionSchema = AirSurveillanceFormLiveSchema.concat(
  object({
    completedBy: string().trim().required(HIDDEN_ERROR)
  })
)

// -----------------------------------------------------------------------------
// Observation Action Form

export const ObservationFormLiveSchema = object({
  userTrigram: string().trim().required(HIDDEN_ERROR)
})

// -----------------------------------------------------------------------------
// Land Control Action Form

export const LandControlFormLiveSchema = object({
  actionDatetimeUtc: actionDatetimeUtcValidator,
  portLocode: string().required(HIDDEN_ERROR),
  vesselId: number().required(HIDDEN_ERROR),
  userTrigram: string().trim().required(HIDDEN_ERROR)
})

export function getLandControlFormCompletionSchema(isEISR: boolean) {
  return LandControlFormLiveSchema.concat(
    object({
      // Obligations déclaratives et autorisations
      emitsVms: string().required(HIDDEN_ERROR),
      emitsAis: string().required(HIDDEN_ERROR),
      logbookMatchesActivity: string().required(HIDDEN_ERROR),
      licencesMatchActivity: string().required(HIDDEN_ERROR),

      // Inspection des captures (legacy checks required only outside e-ISR, see makeNonEIsrLandSpeciesSchema)
      speciesOnboard: array().of(makeEIsrSpeciesOnboardSchema(isEISR)),
      discardedSpecies: array().of(makeDiscardedSpeciesSchema(isEISR)),

      // Quantités saisies
      speciesQuantitySeized: number().when('hasSomeSpeciesSeized', {
        is: (hasSomeSpeciesSeized?: boolean) => hasSomeSpeciesSeized === true,
        then: schema => schema.required(HIDDEN_ERROR)
      }),

      infractions: array().of(
        object({
          infractionType: string().required().notOneOf([MissionAction.InfractionType.PENDING], HIDDEN_ERROR)
        })
      ),
      // Engins à bord
      gearOnboard: array().of(makeGearOnboardSchema(isEISR)).required(HIDDEN_ERROR).min(1, HIDDEN_ERROR),

      // Qualité du contrôle
      vesselTargeted: string().required(HIDDEN_ERROR),
      isLastHaul: boolean().required(HIDDEN_ERROR),

      // Saisi par / Complété par
      completedBy: string().trim().required(HIDDEN_ERROR)
    })
  )
    .concat(makeEIsrDeclarativeObligationsSchema(isEISR))
    .concat(makeLandControlEIsrObligationsSchema(isEISR))
    .concat(makeLandControlEIsrSpeciesSchema(isEISR))
    .concat(makeNonEIsrLandSpeciesSchema(isEISR))
}

// -----------------------------------------------------------------------------
// Sea Control Action Form

export const SeaControlFormLiveSchema = object({
  longitude: number().required(HIDDEN_ERROR),
  latitude: number().required(HIDDEN_ERROR),
  vesselId: number().required(HIDDEN_ERROR),
  actionDatetimeUtc: actionDatetimeUtcValidator,
  userTrigram: string().required(HIDDEN_ERROR)
})

export function getSeaControlFormCompletionSchema(isEISR: boolean) {
  return SeaControlFormLiveSchema.concat(
    object({
      // Obligations déclaratives et autorisations
      emitsVms: string().required(HIDDEN_ERROR),
      emitsAis: string().required(HIDDEN_ERROR),
      logbookMatchesActivity: string().required(HIDDEN_ERROR),
      licencesMatchActivity: string().required(HIDDEN_ERROR),

      // Espèces à bord
      speciesWeightControlled: string().required(HIDDEN_ERROR),
      speciesSizeControlled: string().required(HIDDEN_ERROR),
      separateStowageOfPreservedSpecies: string().required(HIDDEN_ERROR),
      speciesOnboard: array().of(makeEIsrSpeciesOnboardSchema(isEISR)),
      discardedSpecies: array().of(makeDiscardedSpeciesSchema(isEISR)),

      // Engins à bord
      gearOnboard: array().of(makeGearOnboardSchema(isEISR)).required(HIDDEN_ERROR).min(1, HIDDEN_ERROR),

      // Quantités saisies
      speciesQuantitySeized: number().when('hasSomeSpeciesSeized', {
        is: (hasSomeSpeciesSeized?: boolean) => hasSomeSpeciesSeized === true,
        then: schema => schema.required(HIDDEN_ERROR)
      }),

      isINNControl: boolean().required(HIDDEN_ERROR),

      infractions: array().of(
        object({
          infractionType: string().required().notOneOf([MissionAction.InfractionType.PENDING], HIDDEN_ERROR)
        })
      ),

      // Qualité du contrôle
      vesselTargeted: string().required(HIDDEN_ERROR),
      isLastHaul: boolean().required(HIDDEN_ERROR),

      // Saisi par / Complété par
      completedBy: string().trim().required(HIDDEN_ERROR)
    })
  )
    .concat(makeEIsrDeclarativeObligationsSchema(isEISR))
    .concat(makeSeaControlEIsrObligationsSchema(isEISR))
    .concat(makeEIsrSpeciesSchema(isEISR))
}

// -----------------------------------------------------------------------------
// Infraction SubForm

export const InfractionFormLiveSchema = object({
  comments: string(),
  infractionType: string().oneOf(Object.values(MissionAction.InfractionType)).required(HIDDEN_ERROR),
  threats: array().when('infractionType', {
    is: (infractionType?: MissionAction.InfractionType) => infractionType !== MissionAction.InfractionType.PENDING,
    then: schema => schema.required(HIDDEN_ERROR)
  })
})

export const InfractionFormCompletionSchema = InfractionFormLiveSchema.concat(
  object({
    infractionType: string().required().notOneOf([MissionAction.InfractionType.PENDING], HIDDEN_ERROR)
  })
)
