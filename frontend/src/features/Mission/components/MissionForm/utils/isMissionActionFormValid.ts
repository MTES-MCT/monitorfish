import { MissionAction } from '@features/Mission/missionAction.types'
import { addSideWindowBanner } from '@features/SideWindow/useCases/addSideWindowBanner'
import { Level } from '@mtes-mct/monitor-ui'
import { logSoftError } from '@utils/logSoftError'

import * as ActionSchemas from '../ActionForm/schemas'

import type { MissionActionFormValues } from '../types'
import type { MainAppDispatch } from '@store'

export function isMissionActionFormValid(
  actionFormValues: MissionActionFormValues | MissionAction.MissionAction,
  isCompletionValidation: boolean,
  dispatch: MainAppDispatch
): boolean {
  switch (actionFormValues.actionType) {
    case MissionAction.MissionActionType.AIR_CONTROL:
      return isCompletionValidation
        ? ActionSchemas.AirControlFormCompletionSchema.isValidSync(actionFormValues)
        : ActionSchemas.AirControlFormLiveSchema.isValidSync(actionFormValues)

    case MissionAction.MissionActionType.AIR_SURVEILLANCE:
      return isCompletionValidation
        ? ActionSchemas.AirSurveillanceFormCompletionSchema.isValidSync(actionFormValues)
        : ActionSchemas.AirSurveillanceFormLiveSchema.isValidSync(actionFormValues)

    case MissionAction.MissionActionType.LAND_CONTROL:
      return isCompletionValidation
        ? ActionSchemas.LandControlFormCompletionSchema.isValidSync(actionFormValues)
        : ActionSchemas.LandControlFormLiveSchema.isValidSync(actionFormValues)

    case MissionAction.MissionActionType.OBSERVATION:
      // There is no closure validation schema for observation form
      return ActionSchemas.ObservationFormLiveSchema.isValidSync(actionFormValues)

    case MissionAction.MissionActionType.SEA_CONTROL:
      return isCompletionValidation
        ? ActionSchemas.SeaControlFormCompletionSchema.isValidSync(actionFormValues)
        : ActionSchemas.SeaControlFormLiveSchema.isValidSync(actionFormValues)

    default:
      logSoftError({
        callback: () =>
          dispatch(
            addSideWindowBanner({
              children: 'Une erreur est survenue pendant la validation du formulaire.',
              closingDelay: 3000,
              isClosable: true,
              level: Level.ERROR,
              withAutomaticClosing: true
            })
          ),
        message: 'Unknown `actionFormValues.actionType` value.'
      })

      return false
  }
}
