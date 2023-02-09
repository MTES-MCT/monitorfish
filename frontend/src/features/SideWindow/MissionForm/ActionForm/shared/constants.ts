import * as Yup from 'yup'

import { MissionAction } from '../../../../../domain/types/missionAction'
import { getOptionsFromLabelledEnum } from '../../../../../utils/getOptionsFromLabelledEnum'

export const INFRACTION_TYPES_AS_OPTIONS = getOptionsFromLabelledEnum(MissionAction.InfractionTypeLabel)

export const MissionActionInfractionSchema = Yup.object().shape({
  comments: Yup.string().required(),
  infractionType: Yup.string().required(),
  natinf: Yup.number().required()
})
