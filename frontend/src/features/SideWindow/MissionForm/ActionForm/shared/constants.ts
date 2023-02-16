import * as Yup from 'yup'

import { MissionAction } from '../../../../../domain/types/missionAction'
import { getOptionsFromLabelledEnum } from '../../../../../utils/getOptionsFromLabelledEnum'

export const INFRACTION_TYPES_AS_OPTIONS = getOptionsFromLabelledEnum(MissionAction.InfractionTypeLabel)

export const MissionActionInfractionSchema = Yup.object().shape({
  comments: Yup.string().required('L’observation est un champ obligatoire.'),
  infractionType: Yup.string().required('Le type d’infraction est un champ obligatoire.'),
  natinf: Yup.number().required('Le NATINF est un champ obligatoire.')
})
