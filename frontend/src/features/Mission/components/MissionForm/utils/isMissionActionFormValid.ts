import { logSoftError } from '@mtes-mct/monitor-ui'
import { MissionAction } from 'domain/types/missionAction'

import * as ActionSchemas from '../ActionForm/schemas'

import type { MissionActionFormValues } from '../types'

export function isMissionActionFormValid(
  actionFormValues: MissionActionFormValues | MissionAction.MissionAction,
  isClosureValidation: boolean
): boolean {
  switch (actionFormValues.actionType) {
    case MissionAction.MissionActionType.AIR_CONTROL:
      return isClosureValidation
        ? ActionSchemas.AirControlFormClosureSchema.isValidSync(actionFormValues)
        : ActionSchemas.AirControlFormLiveSchema.isValidSync(actionFormValues)

    case MissionAction.MissionActionType.AIR_SURVEILLANCE:
      return isClosureValidation
        ? ActionSchemas.AirSurveillanceFormClosureSchema.isValidSync(actionFormValues)
        : ActionSchemas.AirSurveillanceFormLiveSchema.isValidSync(actionFormValues)

    case MissionAction.MissionActionType.LAND_CONTROL:
      return isClosureValidation
        ? ActionSchemas.LandControlFormClosureSchema.isValidSync(actionFormValues)
        : ActionSchemas.LandControlFormLiveSchema.isValidSync(actionFormValues)

    case MissionAction.MissionActionType.OBSERVATION:
      // There is no closure validation schema for observation form
      return ActionSchemas.ObservationFormLiveSchema.isValidSync(actionFormValues)

    case MissionAction.MissionActionType.SEA_CONTROL:
      return isClosureValidation
        ? ActionSchemas.SeaControlFormClosureSchema.isValidSync(actionFormValues)
        : ActionSchemas.SeaControlFormLiveSchema.isValidSync(actionFormValues)

    default:
      logSoftError({
        isSideWindowError: true,
        message: 'Unknown `actionFormValues.actionType` value.',
        userMessage: 'Une erreur est survenue pendant la validation du formulaire.'
      })

      return false
  }
}
