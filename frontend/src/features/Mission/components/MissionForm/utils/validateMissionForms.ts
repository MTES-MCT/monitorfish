import { Mission } from '@features/Mission/mission.types'
import { MissionAction } from '@features/Mission/missionAction.types'
import { logSoftError } from '@mtes-mct/monitor-ui'

import { areMissionFormsValuesValid } from './areMissionFormsValuesValid'
import * as ActionSchemas from '../ActionForm/schemas'
import { MainFormLiveSchema } from '../MainForm/schemas'

import type { MissionActionFormValues, MissionMainFormValues } from '../types'

export function validateMissionForms(
  mainFormValues: MissionMainFormValues | Mission.Mission,
  actionsFormValues: MissionActionFormValues[] | MissionAction.MissionAction[],
  isCompletionValidation: boolean
): [
  boolean,
  {
    nextActionsFormValues: MissionActionFormValues[]
    nextMainFormValues: MissionMainFormValues
  }
] {
  const nextMainFormValues = {
    ...mainFormValues,
    // There is no closure validation schema for the main form
    isValid: MainFormLiveSchema.isValidSync(mainFormValues)
  }

  // eslint-disable-next-line no-restricted-syntax
  const nextActionsFormValues = actionsFormValues.map(actionFormValues => {
    switch (actionFormValues.actionType) {
      case MissionAction.MissionActionType.AIR_CONTROL:
        return {
          ...actionFormValues,
          isValid: isCompletionValidation
            ? ActionSchemas.AirControlFormCompletionSchema.isValidSync(actionFormValues)
            : ActionSchemas.AirControlFormLiveSchema.isValidSync(actionFormValues)
        }

      case MissionAction.MissionActionType.AIR_SURVEILLANCE:
        return {
          ...actionFormValues,
          isValid: isCompletionValidation
            ? ActionSchemas.AirSurveillanceFormCompletionSchema.isValidSync(actionFormValues)
            : ActionSchemas.AirSurveillanceFormLiveSchema.isValidSync(actionFormValues)
        }

      case MissionAction.MissionActionType.LAND_CONTROL:
        return {
          ...actionFormValues,
          isValid: isCompletionValidation
            ? ActionSchemas.LandControlFormCompletionSchema.isValidSync(actionFormValues)
            : ActionSchemas.LandControlFormLiveSchema.isValidSync(actionFormValues)
        }

      case MissionAction.MissionActionType.OBSERVATION:
        return {
          ...actionFormValues,
          // There is no completion validation schema for observation form
          isValid: ActionSchemas.ObservationFormLiveSchema.isValidSync(actionFormValues)
        }

      case MissionAction.MissionActionType.SEA_CONTROL:
        return {
          ...actionFormValues,
          isValid: isCompletionValidation
            ? ActionSchemas.SeaControlFormCompletionSchema.isValidSync(actionFormValues)
            : ActionSchemas.SeaControlFormLiveSchema.isValidSync(actionFormValues)
        }

      default:
        logSoftError({
          isSideWindowError: true,
          message: 'Unknown `actionFormValues.actionType` value.',
          userMessage: "Une erreur est survenue pendant l'enregistrement de la mission."
        })

        return {
          ...actionFormValues,
          isValid: false
        }
    }
  })

  const areFormsValid = areMissionFormsValuesValid(nextMainFormValues, nextActionsFormValues)

  return [
    areFormsValid,
    {
      nextActionsFormValues,
      nextMainFormValues
    }
  ]
}
