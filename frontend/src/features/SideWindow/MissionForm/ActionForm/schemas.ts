/* eslint-disable sort-keys-fix/sort-keys-fix */

import { customDayjs } from '@mtes-mct/monitor-ui'
import { array, number, object, string } from 'yup'

import { mainStore } from '../../../../store'

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

export const InfractionFormSchema = object({
  comments: string(),
  infractionType: string().required('Le type d’infraction est un champ obligatoire.'),
  natinf: number().required('Le NATINF est un champ obligatoire.')
})

export const AirControlFormSchema = object({
  longitude: number().required('Veuillez indiquer la position du navire contrôlé.'),
  latitude: number().required('Veuillez indiquer la position du navire contrôlé.'),
  vesselId: number().required('Veuillez indiquer le navire contrôlé.'),
  userTrigram: string().required('Veuillez indiquer votre trigramme.'),
  actionDatetimeUtc: actionDatetimeUtcValidator
})

const OpenedLandControlFormSchema = object({
  portLocode: string().required('Veuillez indiquer le port de contrôle.'),
  vesselId: number().required('Veuillez indiquer le navire contrôlé.'),
  userTrigram: string().required('Veuillez indiquer votre trigramme.'),
  actionDatetimeUtc: actionDatetimeUtcValidator
})

const ClosedLandControlFormSchema = OpenedLandControlFormSchema.concat(
  object({
    gearOnboard: array().required('Veuillez indiquer les engins à bord.').min(1, 'Veuillez indiquer les engins à bord.')
  })
)

export const getLandControlFormSchema = (isMissionClosed: boolean | undefined) => {
  if (isMissionClosed) {
    return ClosedLandControlFormSchema
  }

  return OpenedLandControlFormSchema
}

const OpenedSeaControlFormSchema = object({
  longitude: number().required('Veuillez indiquer la position du navire contrôlé.'),
  latitude: number().required('Veuillez indiquer la position du navire contrôlé.'),
  vesselId: number().required('Veuillez indiquer le navire contrôlé.'),
  userTrigram: string().required('Veuillez indiquer votre trigramme.'),
  actionDatetimeUtc: actionDatetimeUtcValidator
})

const ClosedSeaControlFormSchema = OpenedSeaControlFormSchema.concat(
  object({
    gearOnboard: array().required('Veuillez indiquer les engins à bord.').min(1, 'Veuillez indiquer les engins à bord.')
  })
)

export const getSeaControlFormSchema = (isMissionClosed: boolean | undefined) => {
  if (isMissionClosed) {
    return ClosedSeaControlFormSchema
  }

  return OpenedSeaControlFormSchema
}
