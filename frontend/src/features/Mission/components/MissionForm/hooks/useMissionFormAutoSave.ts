import { autoSaveMission } from '@features/Mission/useCases/autoSaveMission'
import { autoSaveMissionAction } from '@features/Mission/useCases/autoSaveMissionAction'
import { deleteMissionAction } from '@features/Mission/useCases/deleteMissionAction'
import { saveMissionAndMissionActionsByDiff } from '@features/Mission/useCases/saveMissionAndMissionActionsByDiff'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { customDayjs } from '@mtes-mct/monitor-ui'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'

import { getDuplicatedMissionActionFormValues, getMissionActionFormInitialValues } from '../ActionList/utils'
import { AUTO_SAVE_ENABLED } from '../constants'
import { missionFormActions } from '../slice'
import { getTitleFromMissionMainFormValues } from '../utils'
import { useListenToMissionEventUpdatesById } from './useListenToMissionEventUpdatesById'

import type { MissionWithActionsDraft } from '../../../types'
import type { MissionActionFormValues, MissionMainFormValues } from '../types'
import type { MissionAction } from '@features/Mission/missionAction.types'

const DEBOUNCE_DELAY = 1000
/**
 * Auto-save fires on every typing pause, and a pause shorter than `DEBOUNCE_DELAY` is a very common
 * one. `maxWait` bounds how long a continuous typing streak can go unsaved, and `flushOnExit` saves
 * what is pending when the form is left or the page is closed.
 */
const DEBOUNCE_OPTIONS = { flushOnExit: true, maxWait: 10000 }

const DRAFT_DEBOUNCE_DELAY = 250

function isMissionEndedForMoreThan48Hours(endDateTimeUtc: string | undefined): boolean {
  return !!endDateTimeUtc && customDayjs().subtract(48, 'hours').isAfter(endDateTimeUtc)
}

/**
 * Owns the mission form values and their persistence: the component below only renders them.
 */
export function useMissionFormAutoSave(draft: MissionWithActionsDraft, missionIdFromPath: number | undefined) {
  const dispatch = useMainAppDispatch()

  const missionIdRef = useRef<number | undefined>(missionIdFromPath)
  const [mainFormValues, setMainFormValues] = useState<MissionMainFormValues>(draft.mainFormValues)
  const [actionsFormValues, setActionsFormValues] = useState<MissionActionFormValues[]>(draft.actionsFormValues)
  const [editedActionIndex, setEditedActionIndex] = useState<number | undefined>(undefined)
  const [title, setTitle] = useState(getTitleFromMissionMainFormValues(draft.mainFormValues, missionIdFromPath))

  /** Latest values received from the main form: `mainFormValues` only catches up when a save resolves. */
  const latestMainFormValuesRef = useRef<MissionMainFormValues>(draft.mainFormValues)
  /** Latest actions: an async callback closure holds an outdated copy, and would drop the ids just created. */
  const actionsFormValuesRef = useRef<MissionActionFormValues[]>(draft.actionsFormValues)

  const missionEvent = useListenToMissionEventUpdatesById(missionIdRef.current)

  const isAutoSaveEnabled = useMemo(
    () => AUTO_SAVE_ENABLED && !isMissionEndedForMoreThan48Hours(mainFormValues.endDateTimeUtc),
    [mainFormValues.endDateTimeUtc]
  )

  const updateActionsFormValues = useCallback(
    (updater: (previousActionsFormValues: MissionActionFormValues[]) => MissionActionFormValues[]) => {
      setActionsFormValues(previousActionsFormValues => {
        const nextActionsFormValues = updater(previousActionsFormValues)
        actionsFormValuesRef.current = nextActionsFormValues

        return nextActionsFormValues
      })
    },
    []
  )

  const updateReduxSliceDraft = useDebouncedCallback(() => {
    dispatch(
      missionFormActions.setDraft({
        actionsFormValues: [...actionsFormValues],
        mainFormValues: { ...mainFormValues }
      })
    )

    setTitle(getTitleFromMissionMainFormValues(mainFormValues, missionIdRef.current))
  }, DRAFT_DEBOUNCE_DELAY)

  const saveEditedActionCallback = useCallback(
    async (nextActionFormValues: MissionActionFormValues) => {
      if (editedActionIndex === undefined) {
        return
      }

      const editedAction = actionsFormValuesRef.current[editedActionIndex]
      const draftKey = nextActionFormValues.draftKey ?? editedAction?.draftKey
      const savedId = await dispatch(
        autoSaveMissionAction(
          { ...nextActionFormValues, draftKey, id: editedAction?.id },
          missionIdRef.current,
          isAutoSaveEnabled
        )
      )

      updateActionsFormValues(previousActionsFormValues =>
        previousActionsFormValues.map((action, index) =>
          index === editedActionIndex ? { ...nextActionFormValues, draftKey, id: savedId } : action
        )
      )
      updateReduxSliceDraft()
    },
    [dispatch, updateActionsFormValues, updateReduxSliceDraft, editedActionIndex, isAutoSaveEnabled]
  )

  const saveEditedAction = useDebouncedCallback(saveEditedActionCallback, DEBOUNCE_DELAY, DEBOUNCE_OPTIONS)

  const flushPendingActionSave = useCallback(async () => {
    if (!saveEditedAction.isPending()) {
      return
    }

    await saveEditedAction.flush()
  }, [saveEditedAction])

  const prependAction = useCallback(
    async (actionFormValues: MissionActionFormValues) => {
      setEditedActionIndex(0)

      const createdId = await dispatch(autoSaveMissionAction(actionFormValues, missionIdRef.current, isAutoSaveEnabled))

      updateActionsFormValues(previousActionsFormValues => [
        { ...actionFormValues, id: createdId },
        ...previousActionsFormValues
      ])
      updateReduxSliceDraft()
    },
    [dispatch, updateActionsFormValues, updateReduxSliceDraft, isAutoSaveEnabled]
  )

  const addAction = useCallback(
    async (actionType: MissionAction.MissionActionType) => {
      await flushPendingActionSave()

      await prependAction(getMissionActionFormInitialValues(actionType))
    },
    [flushPendingActionSave, prependAction]
  )

  const duplicateAction = useCallback(
    async (actionIndex: number) => {
      await flushPendingActionSave()

      const actionToDuplicate = actionsFormValuesRef.current[actionIndex]
      if (!actionToDuplicate) {
        return
      }

      await prependAction(getDuplicatedMissionActionFormValues(actionToDuplicate))
    },
    [flushPendingActionSave, prependAction]
  )

  const removeAction = useCallback(
    async (actionIndex: number) => {
      await flushPendingActionSave()

      const nextActionsFormValues = await dispatch(
        deleteMissionAction(
          actionsFormValuesRef.current,
          actionIndex,
          isAutoSaveEnabled,
          mainFormValues.isGeometryComputedFromControls
        )
      )

      updateActionsFormValues(() => nextActionsFormValues)
      updateReduxSliceDraft()
      setEditedActionIndex(previousIndex => (previousIndex === actionIndex ? undefined : previousIndex))
    },
    [
      dispatch,
      flushPendingActionSave,
      updateActionsFormValues,
      updateReduxSliceDraft,
      mainFormValues.isGeometryComputedFromControls,
      isAutoSaveEnabled
    ]
  )

  const selectAction = useCallback(
    async (nextActionIndex: number | undefined) => {
      await flushPendingActionSave()

      setEditedActionIndex(nextActionIndex)
    },
    [flushPendingActionSave]
  )

  /**
   * A control date must fall within the mission period, so changing the mission dates can make a
   * previously out-of-range action valid. An action is otherwise only auto-saved when its own form
   * changes, so we re-attempt saving the edited action here to persist a control that just became
   * valid (without this, the user has to re-edit the control date to trigger its save).
   */
  const saveEditedActionAfterMissionDatesChange = useCallback(
    async (savedMainFormValues: MissionMainFormValues) => {
      if (editedActionIndex === undefined) {
        return
      }

      const editedActionFormValues = actionsFormValuesRef.current[editedActionIndex]
      if (!editedActionFormValues) {
        return
      }

      // Persist the draft synchronously so the action validation (which reads the mission dates from the
      // draft) sees the updated dates instead of the debounced, still-stale ones.
      dispatch(
        missionFormActions.setDraft({
          actionsFormValues: [...actionsFormValuesRef.current],
          mainFormValues: { ...savedMainFormValues }
        })
      )

      const savedActionId = await dispatch(
        autoSaveMissionAction(editedActionFormValues, missionIdRef.current, isAutoSaveEnabled)
      )
      if (savedActionId === editedActionFormValues.id) {
        return
      }

      updateActionsFormValues(previousActionsFormValues =>
        previousActionsFormValues.map((action, index) =>
          index === editedActionIndex ? { ...editedActionFormValues, id: savedActionId } : action
        )
      )
      updateReduxSliceDraft()
    },
    [dispatch, updateActionsFormValues, updateReduxSliceDraft, editedActionIndex, isAutoSaveEnabled]
  )

  const saveMainFormCallback = useCallback(
    async (nextMainFormValues: MissionMainFormValues) => {
      await flushPendingActionSave()

      const haveMissionDatesChanged =
        mainFormValues.startDateTimeUtc !== nextMainFormValues.startDateTimeUtc ||
        mainFormValues.endDateTimeUtc !== nextMainFormValues.endDateTimeUtc

      const savedMainFormValues = await dispatch(
        autoSaveMission(nextMainFormValues, mainFormValues, missionIdRef.current, isAutoSaveEnabled)
      )
      if (!savedMainFormValues) {
        return
      }

      setMainFormValues({
        ...latestMainFormValuesRef.current,
        createdAtUtc: savedMainFormValues.createdAtUtc,
        id: savedMainFormValues.id,
        updatedAtUtc: savedMainFormValues.updatedAtUtc
      })
      missionIdRef.current = savedMainFormValues.id
      updateReduxSliceDraft()

      if (haveMissionDatesChanged) {
        await saveEditedActionAfterMissionDatesChange(savedMainFormValues)
      }
    },
    [
      dispatch,
      flushPendingActionSave,
      saveEditedActionAfterMissionDatesChange,
      updateReduxSliceDraft,
      mainFormValues,
      isAutoSaveEnabled
    ]
  )

  const debouncedSaveMainForm = useDebouncedCallback(saveMainFormCallback, DEBOUNCE_DELAY, DEBOUNCE_OPTIONS)

  const saveMainForm = useCallback(
    (nextMainFormValues: MissionMainFormValues) => {
      latestMainFormValuesRef.current = nextMainFormValues
      debouncedSaveMainForm(nextMainFormValues)
    },
    [debouncedSaveMainForm]
  )

  /** /!\ Only used when `isAutoSaveEnabled` is false */
  const saveWholeMission = useCallback(async () => {
    const savedMission = await dispatch(
      saveMissionAndMissionActionsByDiff(mainFormValues, actionsFormValuesRef.current, missionIdRef.current)
    )

    setMainFormValues(savedMission)
    missionIdRef.current = savedMission.id
  }, [dispatch, mainFormValues])

  useEffect(() => {
    if (!missionEvent) {
      return
    }

    setMainFormValues(previousMainFormValues => ({
      ...previousMainFormValues,
      updatedAtUtc: missionEvent.updatedAtUtc
    }))
  }, [missionEvent])

  return {
    actionsFormValues,
    addAction,
    duplicateAction,
    editedActionIndex,
    isAutoSaveEnabled,
    mainFormValues,
    missionId: missionIdRef.current,
    removeAction,
    saveEditedAction,
    saveMainForm,
    saveWholeMission,
    selectAction,
    title
  }
}
