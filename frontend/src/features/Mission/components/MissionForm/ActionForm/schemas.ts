/* eslint-disable sort-keys-fix/sort-keys-fix */

import { HIDDEN_ERROR } from '@features/Mission/components/MissionForm/constants'
import { MissionAction } from '@features/Mission/missionAction.types'
import { customDayjs } from '@mtes-mct/monitor-ui'
import { mainStore } from '@store/index'
import { array, boolean, number, object, string } from 'yup'

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

export const GearOnboardSchema = object({
  gearWasControlled: boolean().required(HIDDEN_ERROR)
})

// -----------------------------------------------------------------------------
// Air Control Action Form

export const AirControlFormLiveSchema = object({
  actionDatetimeUtc: actionDatetimeUtcValidator,
  latitude: number().required(HIDDEN_ERROR),
  longitude: number().required(HIDDEN_ERROR),
  vesselId: number().required(HIDDEN_ERROR),
  userTrigram: string().trim().required(HIDDEN_ERROR)
})

export const AirControlFormClosureSchema = AirControlFormLiveSchema.concat(
  object({
    closedBy: string().trim().required(HIDDEN_ERROR)
  })
)

// -----------------------------------------------------------------------------
// Air Surveillance Action Form

export const AirSurveillanceFormLiveSchema = object({
  userTrigram: string().trim().required(HIDDEN_ERROR)
})

export const AirSurveillanceFormClosureSchema = AirSurveillanceFormLiveSchema.concat(
  object({
    closedBy: string().trim().required(HIDDEN_ERROR)
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

export const LandControlFormClosureSchema = LandControlFormLiveSchema.concat(
  object({
    // Obligations déclaratives et autorisations de pêche
    emitsVms: string().required(HIDDEN_ERROR),
    emitsAis: string().required(HIDDEN_ERROR),
    logbookMatchesActivity: string().required(HIDDEN_ERROR),
    licencesMatchActivity: string().required(HIDDEN_ERROR),

    // Espèces à bord
    speciesWeightControlled: boolean().required(HIDDEN_ERROR),
    speciesSizeControlled: boolean().required(HIDDEN_ERROR),
    separateStowageOfPreservedSpecies: string().required(HIDDEN_ERROR),

    // Engins à bord
    gearOnboard: array().of(GearOnboardSchema).required(HIDDEN_ERROR).min(1, HIDDEN_ERROR),

    // Qualité du contrôle
    vesselTargeted: string().required(HIDDEN_ERROR),

    // Saisi par / Clôturé par
    closedBy: string().trim().required(HIDDEN_ERROR)
  })
)

// -----------------------------------------------------------------------------
// Sea Control Action Form

export const SeaControlFormLiveSchema = object({
  longitude: number().required(HIDDEN_ERROR),
  latitude: number().required(HIDDEN_ERROR),
  vesselId: number().required(HIDDEN_ERROR),
  actionDatetimeUtc: actionDatetimeUtcValidator,
  userTrigram: string().required(HIDDEN_ERROR)
})

export const SeaControlFormClosureSchema = SeaControlFormLiveSchema.concat(
  object({
    // Obligations déclaratives et autorisations de pêche
    emitsVms: string().required(HIDDEN_ERROR),
    emitsAis: string().required(HIDDEN_ERROR),
    logbookMatchesActivity: string().required(HIDDEN_ERROR),
    licencesMatchActivity: string().required(HIDDEN_ERROR),

    // Espèces à bord
    speciesWeightControlled: boolean().required(HIDDEN_ERROR),
    speciesSizeControlled: boolean().required(HIDDEN_ERROR),
    separateStowageOfPreservedSpecies: string().required(HIDDEN_ERROR),

    // Engins à bord
    gearOnboard: array().of(GearOnboardSchema).required(HIDDEN_ERROR).min(1, HIDDEN_ERROR),

    // Qualité du contrôle
    vesselTargeted: string().required(HIDDEN_ERROR),

    // Saisi par / Clôturé par
    closedBy: string().trim().required(HIDDEN_ERROR)
  })
)

// -----------------------------------------------------------------------------
// Infraction SubForm

export const InfractionFormLiveSchema = object({
  comments: string(),
  infractionType: string().oneOf(Object.values(MissionAction.InfractionType)).required(HIDDEN_ERROR),
  natinf: number().when('infractionType', {
    is: (infractionType?: MissionAction.InfractionType) => infractionType !== MissionAction.InfractionType.PENDING,
    then: schema => schema.required(HIDDEN_ERROR)
  })
})
