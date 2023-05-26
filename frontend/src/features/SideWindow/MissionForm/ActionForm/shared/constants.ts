import * as Yup from 'yup'

import { MissionAction } from '../../../../../domain/types/missionAction'
import { getOptionsFromLabelledEnum } from '../../../../../utils/getOptionsFromLabelledEnum'

export const FLIGHT_GOALS_AS_OPTIONS = getOptionsFromLabelledEnum(MissionAction.FLIGHT_GOAL_LABEL)
export const INFRACTION_TYPES_AS_OPTIONS = getOptionsFromLabelledEnum(MissionAction.INFRACTION_TYPE_LABEL)

export const MissionActionInfractionSchema = Yup.object().shape({
  comments: Yup.string().default(''),
  infractionType: Yup.string().required('Le type d’infraction est un champ obligatoire.'),
  natinf: Yup.number().required('Le NATINF est un champ obligatoire.')
})
