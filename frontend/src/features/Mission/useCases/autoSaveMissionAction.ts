import { missionFormActions } from '@features/Mission/components/MissionForm/slice'
import { getMissionActionDataFromFormValues } from '@features/Mission/components/MissionForm/utils'
import { isMissionActionFormValid } from '@features/Mission/components/MissionForm/utils/isMissionActionFormValid'
import { MissionAction } from '@features/Mission/missionAction.types'
import { missionActionApi } from '@features/Mission/missionActionApi'
import { addSideWindowBanner } from '@features/SideWindow/useCases/addSideWindowBanner'
import { Level } from '@mtes-mct/monitor-ui'
import { logSoftError } from '@utils/logSoftError'

import type { MissionActionFormValues } from '@features/Mission/components/MissionForm/types'
import type { MainAppThunk } from '@store'

import MissionActionType = MissionAction.MissionActionType

/**
 * Ids (or in-flight creations) of the mission actions created from this session, keyed by their
 * client-side `draftKey`. Auto-save can run with form values that do not carry the created id yet
 * (in-flight creation, stale closure): without this registry, such a save would `POST` the same
 * draft a second time and duplicate the control (see https://github.com/MTES-MCT/monitorfish/issues/5368).
 */
const missionActionCreationsByDraftKey = new Map<string, number | Promise<number>>()

export function resetMissionActionCreations() {
  missionActionCreationsByDraftKey.clear()
}

export const autoSaveMissionAction =
  (
    actionFormValues: MissionActionFormValues,
    missionId: number | undefined,
    isAutoSaveEnabled: boolean
  ): MainAppThunk<Promise<number | undefined>> =>
  async dispatch => {
    if (!isMissionActionFormValid(actionFormValues, false, dispatch) || !isAutoSaveEnabled) {
      dispatch(missionFormActions.setIsDraftDirty(true))

      return actionFormValues.id
    }

    try {
      if (!missionId) {
        // The mission is still unsaved, we can't save the action

        return undefined
      }

      const missionActionData = getMissionActionDataFromFormValues(actionFormValues, missionId)
      const { draftKey } = actionFormValues

      let missionActionId = missionActionData.id
      if (missionActionId === undefined && draftKey) {
        // The form values may not carry the created id yet (in-flight creation or stale closure):
        // recover it from the registry so this save becomes an update instead of a duplicate creation
        const knownCreation = missionActionCreationsByDraftKey.get(draftKey)
        if (knownCreation !== undefined) {
          try {
            missionActionId = typeof knownCreation === 'number' ? knownCreation : await knownCreation
          } catch (_pendingCreationError) {
            // The pending creation failed: fall back to creating the action
            missionActionCreationsByDraftKey.delete(draftKey)
          }
        }
      }

      if (missionActionId === undefined) {
        const creation = dispatch(missionActionApi.endpoints.createMissionAction.initiate(missionActionData))
          .unwrap()
          .then(({ id }) => id)
        if (draftKey) {
          missionActionCreationsByDraftKey.set(draftKey, creation)
        }

        let id: number
        try {
          id = await creation
        } catch (creationError) {
          if (draftKey) {
            missionActionCreationsByDraftKey.delete(draftKey)
          }

          throw creationError
        }
        if (draftKey) {
          missionActionCreationsByDraftKey.set(draftKey, id)
        }

        dispatch(missionFormActions.setIsDraftDirty(false))

        return id
      }

      await dispatch(
        missionActionApi.endpoints.updateMissionAction.initiate({
          ...missionActionData,
          id: missionActionId,

          /**
           * The last haul control is only required for controls at sea or land
           */
          isLastHaul:
            missionActionData.actionType === MissionActionType.SEA_CONTROL ||
            missionActionData.actionType === MissionActionType.LAND_CONTROL
              ? missionActionData.isLastHaul
              : false,

          /**
           * This field is not used in the backend use-case, we add this property to
           * respect the MissionAction type (using `portName` when fetching missions actions).
           */
          portName: undefined
        })
      ).unwrap()

      dispatch(missionFormActions.setIsDraftDirty(false))

      return missionActionId
    } catch (err) {
      logSoftError({
        callback: () =>
          dispatch(
            addSideWindowBanner({
              children: "Une erreur est survenue pendant l'enregistrement de la mission.",
              closingDelay: 6000,
              isClosable: true,
              level: Level.ERROR,
              withAutomaticClosing: true
            })
          ),
        message: '`await autoSaveAction()` failed.',
        originalError: err
      })

      return actionFormValues.id
    }
  }
