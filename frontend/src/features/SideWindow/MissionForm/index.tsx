import { Accent, Button, customDayjs, Icon, logSoftError, NotificationEvent } from '@mtes-mct/monitor-ui'
import { isEqual } from 'lodash'
import { omit } from 'lodash/fp'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import * as timeago from 'timeago.js'
import { useDebouncedCallback } from 'use-debounce'

import { ActionForm } from './ActionForm'
import { ActionList } from './ActionList'
import { getMissionActionFormInitialValues } from './ActionList/utils'
import { useCreateMissionMutation, useDeleteMissionMutation, useUpdateMissionMutation } from './apis'
import { AUTO_SAVE_ENABLED } from './constants'
import { useListenToMissionEventUpdatesById } from './hooks/useListenToMissionEventUpdatesById'
import { useUpdateFreezedActionFormValues } from './hooks/useUpdateFreezedActionFormValues'
import { MainForm } from './MainForm'
import { AutoSaveTag } from './shared/AutoSaveTag'
import { DeletionConfirmationDialog } from './shared/DeletionConfirmationDialog'
import { DraftCancellationConfirmationDialog } from './shared/DraftCancellationConfirmationDialog'
import { TitleSourceTag } from './shared/TitleSourceTag'
import { TitleStatusTag } from './shared/TitleStatusTag'
import {
  getMissionActionsDataFromMissionActionsFormValues,
  getMissionDataFromMissionFormValues,
  getTitleFromMissionMainFormValues,
  getUpdatedMissionFromMissionMainFormValues
} from './utils'
import { areMissionFormsValuesValid } from './utils/areMissionFormsValuesValid'
import { validateMissionForms } from './utils/validateMissionForms'
import {
  useCreateMissionActionMutation,
  useDeleteMissionActionMutation,
  useUpdateMissionActionMutation
} from '../../../api/missionAction'
import { Mission } from '../../../domain/entities/mission/types'
import { getMissionStatus } from '../../../domain/entities/mission/utils'
import { SideWindowMenuKey } from '../../../domain/entities/sideWindow/constants'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'
import { FrontendError } from '../../../libs/FrontendError'
import { FrontendErrorBoundary } from '../../../ui/FrontendErrorBoundary'
import { NoRsuiteOverrideWrapper } from '../../../ui/NoRsuiteOverrideWrapper'
import { assert } from '../../../utils/assert'
import { ensure } from '../../../utils/ensure'
import { missionFormActions } from '../../Mission/components/MissionForm/slice'
import { getMissionWithActions } from '../../Mission/useCases/getMissionWithActions'
import { openSideWindowPath } from '../useCases/openSideWindowPath'

import type { MissionActionFormValues, MissionMainFormValues } from './types'
import type { MissionAction } from '../../../domain/types/missionAction'
import type { MissionWithActionsDraft } from '../../Mission/types'

export function MissionForm() {
  const dispatch = useMainAppDispatch()
  const missionIdFromPath = useMainAppSelector(store => store.sideWindow.selectedPath.id)
  const draft = ensure(
    useMainAppSelector(store => store.missionForm.draft),
    'store.missionForm.draft'
  )

  const missionIdFromRef = useRef<number | undefined>(missionIdFromPath)

  const [createMission, { isLoading: isCreatingMission }] = useCreateMissionMutation()
  const [deleteMission, { isLoading: isDeletingMission }] = useDeleteMissionMutation()
  const [createMissionAction, { isLoading: isCreatingMissionAction }] = useCreateMissionActionMutation()
  const [deleteMissionAction, { isLoading: isDeletingMissionAction }] = useDeleteMissionActionMutation()
  const [updateMission, { isLoading: isUpdatingMission }] = useUpdateMissionMutation()
  const [updateMissionAction, { isLoading: isUpdatingMissionAction }] = useUpdateMissionActionMutation()
  const missionEvent = useListenToMissionEventUpdatesById(missionIdFromRef.current)

  const isSaving =
    isCreatingMission ||
    isDeletingMission ||
    isUpdatingMission ||
    isCreatingMissionAction ||
    isDeletingMissionAction ||
    isUpdatingMissionAction

  const [mainFormValues, setMainFormValues] = useState<MissionMainFormValues>(draft.mainFormValues)
  const [actionsFormValues, setActionsFormValues] = useState<MissionActionFormValues[]>(draft.actionsFormValues)
  const [editedActionIndex, setEditedActionIndex] = useState<number | undefined>(undefined)
  const [isDeletionConfirmationDialogOpen, setIsDeletionConfirmationDialogOpen] = useState(false)
  const isDraftCancellationConfirmationDialogOpen = useMainAppSelector(
    store => store.sideWindow.isDraftCancellationConfirmationDialogOpen
  )
  const [title, setTitle] = useState(getTitleFromMissionMainFormValues(mainFormValues, missionIdFromRef.current))

  // We use these keys to fully control when to re-render `<MainForm />` & `<ActionForm />`
  // since they are fully memoized in order to optimize their (heavy) re-rendering
  const [actionFormKey, setActionFormKey] = useState(0)

  // `formikEditedActionFormValuesRef` is freezed as Formik manage his state internally
  const formikEditedActionFormValuesRef = useRef<MissionActionFormValues | undefined>(undefined)
  useUpdateFreezedActionFormValues(
    formikEditedActionFormValuesRef.current,
    actionsFormValues,
    editedActionIndex,
    nextActionFormValues => {
      formikEditedActionFormValuesRef.current = nextActionFormValues
      setActionFormKey(key => key + 1)
    }
  )

  const isAutoSaveEnabled = useMemo(() => {
    if (!AUTO_SAVE_ENABLED) {
      return false
    }

    const now = customDayjs()
    if (mainFormValues.endDateTimeUtc && now.isAfter(mainFormValues.endDateTimeUtc) && mainFormValues.isClosed) {
      return false
    }

    return true
  }, [mainFormValues])

  const isMissionFormValid = areMissionFormsValuesValid(mainFormValues, actionsFormValues)

  const updateReduxSliceDraft = useDebouncedCallback(() => {
    dispatch(
      missionFormActions.setDraft({
        actionsFormValues: [...actionsFormValues],
        mainFormValues: { ...mainFormValues }
      })
    )

    setTitle(getTitleFromMissionMainFormValues(mainFormValues, missionIdFromRef.current))
  }, 250)

  const createOrUpdate = useCallback(
    async (missionDraft: MissionWithActionsDraft) => {
      try {
        dispatch(missionFormActions.setIsListeningToEvents(false))

        if (!missionIdFromRef.current) {
          const newMission = getMissionDataFromMissionFormValues(missionDraft.mainFormValues)
          // TODO Override Redux RTK typings globally.
          // Redux RTK typing is wrong, this should be a tuple-like to help TS discriminate `data` from `error`.
          const { data, error } = (await createMission(newMission)) as any
          if (!data) {
            throw new FrontendError('`createMission()` failed', error)
          }

          missionIdFromRef.current = data.id

          setMainFormValues({
            ...missionDraft.mainFormValues,
            createdAtUtc: data.createdAtUtc,
            updatedAtUtc: data.updatedAtUtc
          })
        } else {
          const updatedMission = getUpdatedMissionFromMissionMainFormValues(
            missionIdFromRef.current,
            missionDraft.mainFormValues
          )
          const { data, error } = (await updateMission(updatedMission)) as any
          if (!data) {
            throw new FrontendError('`updateMission()` failed', error)
          }

          missionIdFromRef.current = missionIdFromPath

          setMainFormValues({
            ...missionDraft.mainFormValues,
            updatedAtUtc: data.updatedAtUtc
          })
        }

        assert(missionIdFromRef.current, 'missionIdFromRef.current')

        const currentMissionWithActions = await dispatch(getMissionWithActions(missionIdFromRef.current))
        const { deletedMissionActionIds, updatedMissionActionDatas } =
          getMissionActionsDataFromMissionActionsFormValues(
            missionIdFromRef.current,
            missionDraft.actionsFormValues,
            currentMissionWithActions.actions
          )

        await Promise.all([
          ...deletedMissionActionIds.map(async missionActionId => {
            await deleteMissionAction(missionActionId)
          }),
          ...updatedMissionActionDatas.map(async missionActionData => {
            if (missionActionData.id === undefined) {
              await createMissionAction(missionActionData)
            } else {
              await updateMissionAction({
                ...missionActionData,
                id: missionActionData.id,
                /**
                 * This field is not used in the backend use-case, we add this property to
                 * respected the MissionAction type (using `portName` when fetching missions actions).
                 */
                portName: undefined
              })
            }
          })
        ])

        dispatch(missionFormActions.setIsDraftDirty(false))
        setTimeout(() => {
          dispatch(missionFormActions.setIsListeningToEvents(true))
        }, 500)
      } catch (err) {
        logSoftError({
          isSideWindowError: true,
          message: '`createOrUpdate()` failed.',
          originalError: err,
          userMessage: "Une erreur est survenue pendant l'enregistrement de la mission."
        })
      }
    },
    [
      dispatch,
      createMission,
      createMissionAction,
      deleteMissionAction,
      updateMission,
      updateMissionAction,
      missionIdFromRef,
      missionIdFromPath
    ]
  )

  const goToMissionList = useCallback(async () => {
    dispatch(openSideWindowPath({ menu: SideWindowMenuKey.MISSION_LIST }))
  }, [dispatch])

  const handleDelete = useCallback(async () => {
    if (!missionIdFromRef.current) {
      throw new FrontendError('`missionId` is undefined')
    }

    await deleteMission(missionIdFromRef.current)
    dispatch(openSideWindowPath({ menu: SideWindowMenuKey.MISSION_LIST }))
  }, [deleteMission, dispatch])

  const reopen = useCallback(() => {
    const nextMainFormValues = {
      ...mainFormValues,
      isClosed: false
    }
    setMainFormValues(nextMainFormValues)
    updateReduxSliceDraft()
    window.document.dispatchEvent(new NotificationEvent('La mission a bien été réouverte', 'success', true))

    if (!areMissionFormsValuesValid(nextMainFormValues, actionsFormValues)) {
      dispatch(missionFormActions.setIsDraftDirty(true))

      return
    }

    createOrUpdate({
      actionsFormValues,
      mainFormValues: nextMainFormValues
    })
  }, [dispatch, updateReduxSliceDraft, createOrUpdate, mainFormValues, actionsFormValues])

  const close = useCallback(async () => {
    const [canClose, { nextActionsFormValues, nextMainFormValues }] = validateMissionForms(
      mainFormValues,
      actionsFormValues,
      true
    )
    // Stop creation or update there in case there are closure validation error
    if (!canClose) {
      setMainFormValues(nextMainFormValues)
      setActionsFormValues(nextActionsFormValues)

      dispatch(missionFormActions.setIsDraftDirty(true))
      dispatch(missionFormActions.setIsClosing(true))

      return
    }

    const mainFormValuesWithIsClosed = {
      ...mainFormValues,
      isClosed: true
    }
    setMainFormValues(mainFormValuesWithIsClosed)
    updateReduxSliceDraft()

    await createOrUpdate({
      actionsFormValues,
      mainFormValues: mainFormValuesWithIsClosed
    })

    dispatch(openSideWindowPath({ menu: SideWindowMenuKey.MISSION_LIST }))
  }, [dispatch, updateReduxSliceDraft, createOrUpdate, mainFormValues, actionsFormValues])

  const updateEditedActionFormValuesCallback = useCallback(
    (nextActionFormValues: MissionActionFormValues) => {
      if (editedActionIndex === undefined) {
        return
      }

      const nextActionFormValuesOrActions = actionsFormValues.map((action, index) =>
        index === editedActionIndex ? nextActionFormValues : action
      )
      setActionsFormValues(nextActionFormValuesOrActions)
      updateReduxSliceDraft()

      if (!areMissionFormsValuesValid(mainFormValues, nextActionFormValuesOrActions) || !isAutoSaveEnabled) {
        dispatch(missionFormActions.setIsDraftDirty(true))

        return
      }

      createOrUpdate({
        actionsFormValues: nextActionFormValuesOrActions,
        mainFormValues
      })
    },
    [
      dispatch,
      updateReduxSliceDraft,
      createOrUpdate,
      editedActionIndex,
      mainFormValues,
      actionsFormValues,
      isAutoSaveEnabled
    ]
  )

  const updateEditedActionFormValues = useDebouncedCallback(
    (nextActionFormValues: MissionActionFormValues) => updateEditedActionFormValuesCallback(nextActionFormValues),
    250
  )

  const removeAction = useCallback(
    (actionIndex: number) => {
      /**
       * If a debounce function is not yet executed, stop there to avoid race condition.
       * /!\ This can leads to save the debounced action update to the wrong action index
       */
      if (updateEditedActionFormValues.isPending()) {
        return
      }

      const nextActionsFormValues = actionsFormValues.reduce(
        (nextActions, action, index) => (index === actionIndex ? nextActions : [...nextActions, action]),
        [] as MissionActionFormValues[]
      )

      setActionsFormValues(nextActionsFormValues)
      updateReduxSliceDraft()
      if (editedActionIndex === actionIndex) {
        setEditedActionIndex(undefined)
      }

      if (!areMissionFormsValuesValid(mainFormValues, nextActionsFormValues) || !isAutoSaveEnabled) {
        dispatch(missionFormActions.setIsDraftDirty(true))

        return
      }

      createOrUpdate({
        actionsFormValues: nextActionsFormValues,
        mainFormValues
      })
    },
    [
      dispatch,
      updateEditedActionFormValues,
      updateReduxSliceDraft,
      createOrUpdate,
      mainFormValues,
      actionsFormValues,
      editedActionIndex,
      isAutoSaveEnabled
    ]
  )

  const addAction = useCallback(
    (actionType: MissionAction.MissionActionType) => {
      /**
       * If a debounce function is not yet executed, stop there to avoid race condition.
       * /!\ This can leads to save the debounced action update to the wrong action index
       */
      if (updateEditedActionFormValues.isPending()) {
        return
      }

      const newActionFormValues = getMissionActionFormInitialValues(actionType)
      const nextActionsFormValues = [newActionFormValues, ...actionsFormValues]

      setActionsFormValues(nextActionsFormValues)
      updateReduxSliceDraft()
      setEditedActionIndex(0)

      if (!areMissionFormsValuesValid(mainFormValues, nextActionsFormValues) || !isAutoSaveEnabled) {
        dispatch(missionFormActions.setIsDraftDirty(true))

        return
      }

      createOrUpdate({
        actionsFormValues: nextActionsFormValues,
        mainFormValues
      })
    },
    [
      dispatch,
      updateEditedActionFormValues,
      updateReduxSliceDraft,
      createOrUpdate,
      mainFormValues,
      actionsFormValues,
      isAutoSaveEnabled
    ]
  )

  const duplicateAction = useCallback(
    (actionIndex: number) => {
      /**
       * If a debounce function is not yet executed, stop there to avoid race condition.
       * /!\ This can leads to save the debounced action update to the wrong action index
       */
      if (updateEditedActionFormValues.isPending()) {
        return
      }

      const actionCopy: MissionActionFormValues = omit(['id'], actionsFormValues[actionIndex])

      const nextActionsFormValues = [actionCopy, ...actionsFormValues]
      setActionsFormValues([actionCopy, ...actionsFormValues])
      updateReduxSliceDraft()
      setEditedActionIndex(0)

      if (!areMissionFormsValuesValid(mainFormValues, nextActionsFormValues) || !isAutoSaveEnabled) {
        dispatch(missionFormActions.setIsDraftDirty(true))

        return
      }

      createOrUpdate({
        actionsFormValues: nextActionsFormValues,
        mainFormValues
      })
    },
    [
      dispatch,
      updateEditedActionFormValues,
      updateReduxSliceDraft,
      createOrUpdate,
      mainFormValues,
      actionsFormValues,
      isAutoSaveEnabled
    ]
  )

  const updateEditedActionIndex = useCallback(
    (nextActionIndex: number | undefined) => {
      /**
       * If a debounce function is not yet executed, stop there to avoid race condition.
       * /!\ This can leads to save the debounced action update to the wrong action index
       */
      if (updateEditedActionFormValues.isPending()) {
        return
      }

      setEditedActionIndex(nextActionIndex)
    },
    [updateEditedActionFormValues]
  )

  const updateMainFormValuesCallback = useCallback(
    (nextMissionMainFormValues: MissionMainFormValues) => {
      /**
       * If an action debounce function is not yet executed, stop there to avoid race condition.
       * /!\ This can leads to erase a changed action value
       */
      if (updateEditedActionFormValues.isPending()) {
        return
      }

      if (isEqual(nextMissionMainFormValues, mainFormValues)) {
        return
      }

      const mainFormValuesWithUpdatedIsClosedProperty = {
        ...nextMissionMainFormValues,
        isClosed: mainFormValues.isClosed || false
      }

      setMainFormValues(mainFormValuesWithUpdatedIsClosedProperty)
      updateReduxSliceDraft()

      if (
        !areMissionFormsValuesValid(mainFormValuesWithUpdatedIsClosedProperty, actionsFormValues) ||
        !isAutoSaveEnabled
      ) {
        dispatch(missionFormActions.setIsDraftDirty(true))

        return
      }

      createOrUpdate({
        actionsFormValues,
        mainFormValues: mainFormValuesWithUpdatedIsClosedProperty
      })
    },
    [
      dispatch,
      updateEditedActionFormValues,
      updateReduxSliceDraft,
      createOrUpdate,
      actionsFormValues,
      mainFormValues,
      isAutoSaveEnabled
    ]
  )

  const updateMainFormValues = useDebouncedCallback(
    (nextMissionMainFormValues: MissionMainFormValues) => updateMainFormValuesCallback(nextMissionMainFormValues),
    250
  )

  const toggleDeletionConfirmationDialog = useCallback(async () => {
    setIsDeletionConfirmationDialogOpen(!isDeletionConfirmationDialogOpen)
  }, [isDeletionConfirmationDialogOpen])

  useEffect(() => {
    if (!missionEvent) {
      return
    }

    setMainFormValues(previousMainFormValues => ({
      ...previousMainFormValues,
      isClosed: missionEvent.isClosed,
      updatedAtUtc: missionEvent.updatedAtUtc
    }))
  }, [missionEvent])

  return (
    <>
      <Wrapper>
        <Header>
          <BackToListIcon onClick={goToMissionList} />

          <HeaderTitle>{title}</HeaderTitle>
          <TitleSourceTag missionId={missionIdFromRef.current} missionSource={mainFormValues.missionSource} />
          {mainFormValues && <TitleStatusTag status={getMissionStatus(mainFormValues)} />}
        </Header>

        <Body>
          <FrontendErrorBoundary>
            <>
              <MainForm
                key={missionIdFromRef.current}
                initialValues={mainFormValues}
                missionId={missionIdFromRef.current}
                onChange={updateMainFormValues}
              />
              <ActionList
                actionsFormValues={actionsFormValues}
                currentIndex={editedActionIndex}
                missionTypes={mainFormValues.missionTypes}
                onAdd={addAction}
                onDuplicate={duplicateAction}
                onRemove={removeAction}
                onSelect={updateEditedActionIndex}
              />
              <ActionForm
                // We use this key to fully control when to re-render `<ActionForm />`
                key={`action-form-${actionFormKey}`}
                actionFormValues={formikEditedActionFormValuesRef.current}
                onChange={updateEditedActionFormValues}
              />
            </>
          </FrontendErrorBoundary>
        </Body>
        <Footer>
          <div>
            {!!missionIdFromPath && (
              <Button
                accent={Accent.SECONDARY}
                disabled={isSaving || mainFormValues.missionSource !== Mission.MissionSource.MONITORFISH}
                Icon={Icon.Delete}
                onClick={toggleDeletionConfirmationDialog}
              >
                Supprimer la mission
              </Button>
            )}
          </div>
          <div>
            <MissionInfos>
              {mainFormValues.createdAtUtc && (
                <>Mission créée le {customDayjs(mainFormValues.createdAtUtc).utc().format('D MMM YYYY, HH:mm')}. </>
              )}
              {!mainFormValues.createdAtUtc && <>Mission non enregistrée. </>}
              {mainFormValues.updatedAtUtc && (
                <>Dernière modification enregistrée {timeago.format(mainFormValues.updatedAtUtc, 'fr')}.</>
              )}
            </MissionInfos>
            <AutoSaveTag isAutoSaveEnabled={isAutoSaveEnabled} />
            {!isAutoSaveEnabled && (
              <Button
                accent={Accent.PRIMARY}
                disabled={isSaving || !isMissionFormValid}
                Icon={Icon.Save}
                onClick={async () => {
                  await createOrUpdate({
                    actionsFormValues,
                    mainFormValues
                  })

                  goToMissionList()
                }}
              >
                Enregistrer
              </Button>
            )}
            {!mainFormValues.isClosed && (
              <Button
                accent={Accent.SECONDARY}
                data-cy="close-mission"
                disabled={isSaving || !isMissionFormValid}
                Icon={Icon.Confirm}
                onClick={close}
              >
                Clôturer
              </Button>
            )}
            {mainFormValues.isClosed && (
              <Button
                accent={Accent.SECONDARY}
                data-cy="reopen-mission"
                disabled={isSaving}
                Icon={Icon.Unlock}
                onClick={reopen}
                type="button"
              >
                Ré-ouvrir la mission
              </Button>
            )}
            <CloseButton
              accent={isAutoSaveEnabled ? Accent.PRIMARY : Accent.TERTIARY}
              disabled={isSaving}
              onClick={goToMissionList}
            >
              Fermer
            </CloseButton>
          </div>
        </Footer>
      </Wrapper>

      {isDeletionConfirmationDialogOpen && (
        <DeletionConfirmationDialog onCancel={toggleDeletionConfirmationDialog} onConfirm={handleDelete} />
      )}
      {isDraftCancellationConfirmationDialogOpen && (
        <DraftCancellationConfirmationDialog isAutoSaveEnabled={isAutoSaveEnabled} />
      )}
    </>
  )
}

const MissionInfos = styled.div`
  font-style: italic;
`

export const BackToListIcon = styled(Icon.Chevron)`
  margin-right: 12px;
  transform: rotate(90deg);
  cursor: pointer;
`

// All containers within Wrapper should now be only using flexboxes
export const Wrapper = styled(NoRsuiteOverrideWrapper)`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

export const Header = styled.div`
  align-items: center;
  background-color: ${p => p.theme.color.white};
  border-bottom: solid 2px ${p => p.theme.color.gainsboro};
  display: flex;
  max-height: 62px;
  min-height: 62px;
  padding: 0 32px 0 18px;

  > div {
    vertical-align: middle;
  }

  .Element-Tag {
    align-self: auto !important;
  }
`

export const HeaderTitle = styled.h1`
  color: ${p => p.theme.color.charcoal};
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
  margin: 0 0 4px !important;
  vertical-align: 2px;
`

export const Body = styled.div`
  background-color: ${p => p.theme.color.gainsboro};
  display: flex;
  flex-grow: 1;
  min-height: 0;
`

export const Footer = styled.div`
  background-color: ${p => p.theme.color.white};
  border-top: solid 2px ${p => p.theme.color.gainsboro};
  display: flex;
  flex-grow: 1;
  justify-content: space-between;
  max-height: 62px;
  min-height: 62px;

  > div {
    align-items: center;
    display: flex;
    flex-grow: 1;
    padding: 0 24px;

    :last-child {
      justify-content: flex-end;

      > button {
        margin-left: 16px;
      }
    }
  }
`

export const CloseButton = styled(Button)`
  height: 34px;
`
