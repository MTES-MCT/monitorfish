import { MissionAction } from '@features/Mission/missionAction.types'
import { addSideWindowBanner } from '@features/SideWindow/useCases/addSideWindowBanner'
import { Level } from '@mtes-mct/monitor-ui'
import { mainStore } from '@store'
import { logSoftError } from '@utils/logSoftError'

import * as ActionSchemas from '../ActionForm/schemas'
import { computeIsEISREnabled } from '../hooks/useIsEISREnabled'

import type { MissionActionFormValues } from '../types'
import type { MainAppDispatch } from '@store'

export function getMissionActionMissingFields(
  actionFormValues: MissionActionFormValues | MissionAction.MissionAction,
  dispatch: MainAppDispatch
): number {
  const controlUnits = mainStore.getState().missionForm.draft?.mainFormValues.controlUnits ?? []
  const isEISR = computeIsEISREnabled(controlUnits.map(cu => cu.id))

  try {
    switch (actionFormValues.actionType) {
      case MissionAction.MissionActionType.AIR_CONTROL: {
        ActionSchemas.AirControlFormCompletionSchema.validateSync(actionFormValues, { abortEarly: false })

        return 0
      }

      case MissionAction.MissionActionType.AIR_SURVEILLANCE: {
        ActionSchemas.AirSurveillanceFormCompletionSchema.validateSync(actionFormValues, { abortEarly: false })

        return 0
      }

      case MissionAction.MissionActionType.LAND_CONTROL: {
        ActionSchemas.getLandControlFormCompletionSchema(isEISR).validateSync(actionFormValues, { abortEarly: false })

        return 0
      }

      case MissionAction.MissionActionType.OBSERVATION: {
        // There is no closure validation schema for observation form
        ActionSchemas.ObservationFormLiveSchema.validateSync(actionFormValues, { abortEarly: false })

        return 0
      }

      case MissionAction.MissionActionType.SEA_CONTROL: {
        ActionSchemas.getSeaControlFormCompletionSchema(isEISR).validateSync(actionFormValues, { abortEarly: false })

        return 0
      }

      default:
        logSoftError({
          callback: () =>
            dispatch(
              addSideWindowBanner({
                children: 'Une erreur est survenue pendant la validation du formulaire.',
                closingDelay: 6000,
                isClosable: true,
                level: Level.ERROR,
                withAutomaticClosing: true
              })
            ),
          message: 'Unknown `actionFormValues.actionType` value.'
        })

        return 0
    }
  } catch (e: any) {
    return e.errors.length
  }
}
