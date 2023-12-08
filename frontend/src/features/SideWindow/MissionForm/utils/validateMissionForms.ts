import { logSoftError } from '@mtes-mct/monitor-ui'

import { MissionAction } from '../../../../domain/types/missionAction'
import * as ActionSchemas from '../ActionForm/schemas'
import { MainFormLiveSchema } from '../MainForm/schemas'
import { areMissionFormsValuesValid } from '../utils'

import type { MissionActionFormValues, MissionMainFormValues } from '../types'

export function validateMissionForms(
  mainFormValues: MissionMainFormValues,
  actionsFormValues: MissionActionFormValues[],
  isClosureValidation: boolean
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
          // There is no closure validation schema for the air control action form
          isValid: isClosureValidation
            ? ActionSchemas.AirControlFormClosureSchema.isValidSync(actionFormValues)
            : ActionSchemas.AirControlFormLiveSchema.isValidSync(actionFormValues)
        }

      case MissionAction.MissionActionType.AIR_SURVEILLANCE:
        return {
          ...actionFormValues,
          // There is no closure validation schema for the air control action form
          isValid: isClosureValidation
            ? ActionSchemas.AirSurveillanceFormClosureSchema.isValidSync(actionFormValues)
            : ActionSchemas.AirSurveillanceFormLiveSchema.isValidSync(actionFormValues)
        }

      case MissionAction.MissionActionType.LAND_CONTROL:
        return {
          ...actionFormValues,
          isValid: isClosureValidation
            ? ActionSchemas.LandControlFormClosureSchema.isValidSync(actionFormValues)
            : ActionSchemas.LandControlFormLiveSchema.isValidSync(actionFormValues)
        }

      case MissionAction.MissionActionType.OBSERVATION:
        return {
          ...actionFormValues,
          // There is no closure validation schema for observation form
          isValid: ActionSchemas.ObservationFormLiveSchema.isValidSync(actionFormValues)
        }

      case MissionAction.MissionActionType.SEA_CONTROL:
        return {
          ...actionFormValues,
          isValid: isClosureValidation
            ? ActionSchemas.SeaControlFormClosureSchema.isValidSync(actionFormValues)
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
