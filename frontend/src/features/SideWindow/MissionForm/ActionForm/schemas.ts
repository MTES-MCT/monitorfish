/* eslint-disable sort-keys-fix/sort-keys-fix */

import { customDayjs } from '@mtes-mct/monitor-ui'
import { number, object, string } from 'yup'

import { mainStore } from '../../../../store'

const actionDatetimeUtcValidator = string()
  .required('La date du contrôle est un champ obligatoire.')
  .test({
    message: 'La date du contrôle doit être postérieure à la date de début de la mission.',
    test: (actionDatetimeUtc: string | undefined) => {
      const { mission } = mainStore.getState()

      if (!actionDatetimeUtc || !mission.draft?.startDateTimeUtc) {
        return true
      }

      return customDayjs(actionDatetimeUtc).isSameOrAfter(mission.draft.startDateTimeUtc)
    }
  })
  .test({
    message: 'La date du contrôle doit être antérieure à la date de fin de la mission.',
    test: (actionDatetimeUtc: string | undefined) => {
      const { mission } = mainStore.getState()

      if (!actionDatetimeUtc || !mission.draft?.endDateTimeUtc) {
        return true
      }

      return customDayjs(actionDatetimeUtc).isSameOrBefore(mission.draft.endDateTimeUtc)
    }
  })

export const InfractionFormSchema = object({
  comments: string().default(''),
  infractionType: string().required('Le type d’infraction est un champ obligatoire.'),
  natinf: number().required('Le NATINF est un champ obligatoire.')
})

export const AirControlFormSchema = object().shape({
  vesselId: number().integer().required('Veuillez indiquer le navire contrôlé.'),
  actionDatetimeUtc: actionDatetimeUtcValidator
})

export const LandControlFormSchema = object().shape({
  vesselId: number().integer().required('Veuillez indiquer le navire contrôlé.'),
  actionDatetimeUtc: actionDatetimeUtcValidator
})

export const SeaControlFormSchema = object().shape({
  vesselId: number().integer().required('Veuillez indiquer le navire contrôlé.'),
  actionDatetimeUtc: actionDatetimeUtcValidator
})
