/* eslint-disable sort-keys-fix/sort-keys-fix */

import { customDayjs } from '@mtes-mct/monitor-ui'
import { array, boolean, number, object, string } from 'yup'

import { MissionAction } from '../../../../domain/types/missionAction'
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

export const GearOnboardSchema = object({
  gearWasControlled: boolean().required("Veuillez indiquer si l'engin a été contrôlé.")
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
    // Obligations déclaratives et autorisations de pêche
    emitsVms: string().required('Veuillez indiquer si le navire émet un signal VMS.'),
    emitsAis: string().required('Veuillez indiquer si le navire émet un signal AIS.'),
    logbookMatchesActivity: string().required(
      'Veuillez indiquer si le journal de bord correspond à l’activité du navire.'
    ),
    licencesMatchActivity: string().required('Veuillez indiquer si les licences correspondent à l’activité du navire.'),

    // Espèces à bord
    speciesWeightControlled: boolean().required('Veuillez indiquer si le poids des espèces a été contrôlé.'),
    speciesSizeControlled: boolean().required('Veuillez indiquer si la taille des espèces a été contrôlée.'),
    separateStowageOfPreservedSpecies: string().required(
      'Veuillez indiquer si les espèces soumises à plan sont séparées.'
    ),

    // Engins à bord
    gearOnboard: array()
      .of(GearOnboardSchema)
      .required('Veuillez indiquer les engins à bord.')
      .min(1, 'Veuillez indiquer les engins à bord.'),

    // Qualité du contrôle
    vesselTargeted: string().required('Veuillez indiquer si le navire est ciblé par le CNSP.')
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
    // Obligations déclaratives et autorisations de pêche
    emitsVms: string().required('Veuillez indiquer si le navire émet un signal VMS.'),
    emitsAis: string().required('Veuillez indiquer si le navire émet un signal AIS.'),
    logbookMatchesActivity: string().required(
      'Veuillez indiquer si le journal de bord correspond à l’activité du navire.'
    ),
    licencesMatchActivity: string().required('Veuillez indiquer si les licences correspondent à l’activité du navire.'),

    // Espèces à bord
    speciesWeightControlled: boolean().required('Veuillez indiquer si le poids des espèces a été contrôlé.'),
    speciesSizeControlled: boolean().required('Veuillez indiquer si la taille des espèces a été contrôlée.'),
    separateStowageOfPreservedSpecies: string().required(
      'Veuillez indiquer si les espèces soumises à plan sont séparées.'
    ),

    // Engins à bord
    gearOnboard: array()
      .of(GearOnboardSchema)
      .required('Veuillez indiquer les engins à bord.')
      .min(1, 'Veuillez indiquer les engins à bord.'),

    // Qualité du contrôle
    vesselTargeted: string().required('Veuillez indiquer si le navire est ciblé par le CNSP.')
  })
)

// -----------------------------------------------------------------------------
// Infraction SubForm

export const InfractionFormLiveSchema = object({
  comments: string(),
  infractionType: string()
    .oneOf(Object.values(MissionAction.InfractionType))
    .required('Le type d’infraction est un champ obligatoire.'),
  natinf: number().when('infractionType', {
    is: (infractionType?: MissionAction.InfractionType) => infractionType !== MissionAction.InfractionType.PENDING,
    then: schema => schema.required('Le NATINF est un champ obligatoire.')
  })
})
