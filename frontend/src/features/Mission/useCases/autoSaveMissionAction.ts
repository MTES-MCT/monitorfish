import { missionFormActions } from '@features/Mission/components/MissionForm/slice'
import { getMissionActionDataFromFormValues } from '@features/Mission/components/MissionForm/utils'
import { isMissionActionFormValid } from '@features/Mission/components/MissionForm/utils/isMissionActionFormValid'
import { MissionAction } from '@features/Mission/missionAction.types'
import { missionActionApi } from '@features/Mission/missionActionApi'
import { addSideWindowBanner } from '@features/SideWindow/useCases/addSideWindowBanner'
import { Level } from '@mtes-mct/monitor-ui'
import { createLatestOnlySaver } from '@utils/createLatestOnlySaver'
import { logSoftError } from '@utils/logSoftError'
import { omit } from 'lodash-es'

import type { MissionActionFormValues } from '@features/Mission/components/MissionForm/types'
import type { MainAppThunk } from '@store'

import MissionActionType = MissionAction.MissionActionType

/** Ids of the actions created in this session: a later save may run with form values that miss it. */
const createdIdsByDraftKey = new Map<string, number>()
/** Payload of the last save of each action, to skip the saves that would change nothing. */
const lastSavedPayloadByKey = new Map<string, string>()
const latestOnlySaver = createLatestOnlySaver<MissionActionFormValues, number | undefined>()

export function resetMissionActionSaves() {
  createdIdsByDraftKey.clear()
  lastSavedPayloadByKey.clear()
  latestOnlySaver.reset()
}

function getSaveKey(actionFormValues: MissionActionFormValues): string | undefined {
  if (actionFormValues.draftKey) {
    return actionFormValues.draftKey
  }

  return actionFormValues.id !== undefined ? `mission-action-${actionFormValues.id}` : undefined
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

    if (!missionId) {
      // The mission is still unsaved, we can't save the action

      return undefined
    }

    const saveKey = getSaveKey(actionFormValues)
    const saveOne = (values: MissionActionFormValues) => save(values, saveKey)

    return saveKey ? latestOnlySaver.save(saveKey, actionFormValues, saveOne) : saveOne(actionFormValues)

    async function save(values: MissionActionFormValues, key: string | undefined): Promise<number | undefined> {
      const { draftKey } = values
      const knownId = values.id ?? (draftKey ? createdIdsByDraftKey.get(draftKey) : undefined)
      const missionActionData = { ...getMissionActionDataFromFormValues(values, missionId!), id: knownId }
      const payload = JSON.stringify(omit(missionActionData, ['id']))

      if (key && lastSavedPayloadByKey.get(key) === payload) {
        return knownId
      }

      try {
        const savedId =
          knownId === undefined ? await create(missionActionData, draftKey) : await update(missionActionData, knownId)

        if (key) {
          lastSavedPayloadByKey.set(key, payload)
        }
        dispatch(missionFormActions.setIsDraftDirty(false))

        return savedId
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

        return values.id
      }
    }

    async function create(missionActionData, draftKey: string | undefined): Promise<number> {
      const { id } = await dispatch(missionActionApi.endpoints.createMissionAction.initiate(missionActionData)).unwrap()
      if (draftKey) {
        createdIdsByDraftKey.set(draftKey, id)
      }

      return id
    }

    async function update(missionActionData, id: number): Promise<number> {
      await dispatch(
        missionActionApi.endpoints.updateMissionAction.initiate({
          ...missionActionData,
          id,

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

      return id
    }
  }
