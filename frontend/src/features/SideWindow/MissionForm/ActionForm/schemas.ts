/* eslint-disable sort-keys-fix/sort-keys-fix */

import { customDayjs } from '@mtes-mct/monitor-ui'
import { array, number, object, string } from 'yup'

import { mainStore } from '../../../../store'

// -----------------------------------------------------------------------------
// Form Schema Validators

const actionDatetimeUtcValidator = string()
  .required('La date du contrôle est un champ obligatoire.')
  .test({
    message: 'La date du contrôle doit être postérieure à la date de début de la mission.',
    test: (actionDatetimeUtc: string | undefined) => {
      const { mission } = mainStore.getState()

      if (!actionDatetimeUtc || !mission.draft?.mainFormValues.startDateTimeUtc) {
        return true
      }

      return customDayjs(actionDatetimeUtc).isSameOrAfter(mission.draft.mainFormValues.startDateTimeUtc)
    }
  })
  .test({
    message: 'La date du contrôle doit être antérieure à la date de fin de la mission.',
    test: (actionDatetimeUtc: string | undefined) => {
      const { mission } = mainStore.getState()

      if (!actionDatetimeUtc || !mission.draft?.mainFormValues.endDateTimeUtc) {
        return true
      }

      return customDayjs(actionDatetimeUtc).isSameOrBefore(mission.draft.mainFormValues.endDateTimeUtc)
    }
  })

// -----------------------------------------------------------------------------
// Air Control Action Form

export const AirControlFormLiveSchema = object({
  actionDatetimeUtc: actionDatetimeUtcValidator,
  latitude: number().required('Veuillez indiquer la position du navire contrôlé.'),
  longitude: number().required('Veuillez indiquer la position du navire contrôlé.'),
  vesselId: number().required('Veuillez indiquer le navire contrôlé.'),
  userTrigram: string().required('Veuillez indiquer votre trigramme.')
})

// -----------------------------------------------------------------------------
// Land Control Action Form

export const LandControlFormLiveSchema = object({
  actionDatetimeUtc: actionDatetimeUtcValidator,
  portLocode: string().required('Veuillez indiquer le port de contrôle.'),
  vesselId: number().required('Veuillez indiquer le navire contrôlé.'),
  userTrigram: string().required('Veuillez indiquer votre trigramme.')
})

export const LandControlFormClosureSchema = LandControlFormLiveSchema.concat(
  object({
    gearOnboard: array().required('Veuillez indiquer les engins à bord.').min(1, 'Veuillez indiquer les engins à bord.')
  })
)

// -----------------------------------------------------------------------------
// Sea Control Action Form

export const SeaControlFormLiveSchema = object({
  longitude: number().required('Veuillez indiquer la position du navire contrôlé.'),
  latitude: number().required('Veuillez indiquer la position du navire contrôlé.'),
  vesselId: number().required('Veuillez indiquer le navire contrôlé.'),
  userTrigram: string().required('Veuillez indiquer votre trigramme.'),
  actionDatetimeUtc: actionDatetimeUtcValidator
})

export const SeaControlFormClosureSchema = SeaControlFormLiveSchema.concat(
  object({
    gearOnboard: array().required('Veuillez indiquer les engins à bord.').min(1, 'Veuillez indiquer les engins à bord.')
  })
)

// -----------------------------------------------------------------------------
// Infraction SubForm

export const InfractionFormLiveSchema = object({
  comments: string(),
  infractionType: string().required('Le type d’infraction est un champ obligatoire.'),
  natinf: number().required('Le NATINF est un champ obligatoire.')
})
