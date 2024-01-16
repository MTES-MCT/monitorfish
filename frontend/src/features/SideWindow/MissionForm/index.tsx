import { Accent, Button, customDayjs, Icon, logSoftError, NotificationEvent, usePrevious } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/dist/query'
import { isEqual } from 'lodash'
import { omit } from 'lodash/fp'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import * as timeago from 'timeago.js'
import { useDebouncedCallback } from 'use-debounce'

import { ActionForm } from './ActionForm'
import { ActionList } from './ActionList'
import { getMissionActionFormInitialValues } from './ActionList/utils'
import {
  useCreateMissionMutation,
  useDeleteMissionMutation,
  useGetMissionQuery,
  useUpdateMissionMutation
} from './apis'
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
import { getMissionFormInitialValues } from './utils/getMissionFormInitialValues'
import { validateMissionForms } from './utils/validateMissionForms'
import {
  useCreateMissionActionMutation,
  useDeleteMissionActionMutation,
  useGetMissionActionsQuery,
  useUpdateMissionActionMutation
} from '../../../api/missionAction'
import { missionActions } from '../../../domain/actions'
import { Mission, type MissionWithActions } from '../../../domain/entities/mission/types'
import { getMissionStatus } from '../../../domain/entities/mission/utils'
import { SideWindowMenuKey } from '../../../domain/entities/sideWindow/constants'
import { sideWindowActions } from '../../../domain/shared_slices/SideWindow'
import { displayOrLogError } from '../../../domain/use_cases/error/displayOrLogError'
import { retry } from '../../../domain/use_cases/error/retry'
import { sideWindowDispatchers } from '../../../domain/use_cases/sideWindow'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'
import { FrontendError } from '../../../libs/FrontendError'
import { FrontendErrorBoundary } from '../../../ui/FrontendErrorBoundary'
import { LoadingSpinnerWall } from '../../../ui/LoadingSpinnerWall'
import { NoRsuiteOverrideWrapper } from '../../../ui/NoRsuiteOverrideWrapper'

import type { MissionActionFormValues, MissionMainFormValues } from './types'
import type { MissionAction } from '../../../domain/types/missionAction'

export function MissionForm() {
  const dispatch = useMainAppDispatch()
  const isNewEdition = useMainAppSelector(store => store.mission.isNewEdition)
  const missionIdFromPath = useMainAppSelector(store => store.sideWindow.selectedPath.id)
  const newMissionId = useRef<number | undefined>(undefined)
  const missionId = missionIdFromPath || newMissionId?.current
  const isDraftCancellationConfirmationDialogOpen = useMainAppSelector(
    store => store.sideWindow.isDraftCancellationConfirmationDialogOpen
  )
  const missionFormError = useMainAppSelector(state => state.displayedError.missionFormError)
  const missionDraft = useMainAppSelector(state => state.mission.draft)
  const {
    data: missionData,
    error: missionError,
    isFetching: isFetchingMission
  } = useGetMissionQuery(missionId || skipToken)
  const {
    data: missionActionsData,
    error: missionActionsError,
    isFetching: isFetchingMissionActions
  } = useGetMissionActionsQuery(missionId || skipToken)
  const [createMission, { isLoading: isCreatingMission }] = useCreateMissionMutation()
  const [deleteMission, { isLoading: isDeletingMission }] = useDeleteMissionMutation()
  const [createMissionAction, { isLoading: isCreatingMissionAction }] = useCreateMissionActionMutation()
  const [deleteMissionAction, { isLoading: isDeletingMissionAction }] = useDeleteMissionActionMutation()
  const [updateMission, { isLoading: isUpdatingMission }] = useUpdateMissionMutation()
  const [updateMissionAction, { isLoading: isUpdatingMissionAction }] = useUpdateMissionActionMutation()
  const missionEvent = useListenToMissionEventUpdatesById(missionId)

  const isSaving =
    isCreatingMission ||
    isDeletingMission ||
    isUpdatingMission ||
    isCreatingMissionAction ||
    isDeletingMissionAction ||
    isUpdatingMissionAction

  const hasFetchingError = !!missionError || !!missionActionsError
  const isLoading =
    missionIdFromPath && ((isFetchingMission && !missionData) || (isFetchingMissionActions && !missionActionsData))

  const [mainFormValues, setMainFormValues] = useState<MissionMainFormValues | undefined>(undefined)
  const [actionsFormValues, setActionsFormValues] = useState<MissionActionFormValues[]>([])
  const [editedActionIndex, setEditedActionIndex] = useState<number | undefined>(undefined)
  const [isDeletionConfirmationDialogOpen, setIsDeletionConfirmationDialogOpen] = useState(false)
  const [title, setTitle] = useState(getTitleFromMissionMainFormValues(undefined, undefined))
  const previousMissionId = usePrevious(missionIdFromPath)

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

  useEffect(() => {
    if (!missionEvent) {
      return
    }

    setMainFormValues(previousMainFormValues => ({
      ...(previousMainFormValues as MissionMainFormValues),
      isClosed: missionEvent.isClosed,
      updatedAtUtc: missionEvent.updatedAtUtc
    }))
  }, [missionEvent])

  useEffect(() => {
    if (missionError) {
      dispatch(displayOrLogError(missionError as Error, undefined, true, 'missionFormError'))
    }
  }, [dispatch, missionError])

  useEffect(() => {
    if (missionActionsError) {
      dispatch(displayOrLogError(missionActionsError as Error, undefined, true, 'missionFormError'))
    }
  }, [dispatch, missionActionsError])

  const isAutoSaveEnabled = useMemo(() => {
    if (!AUTO_SAVE_ENABLED) {
      return false
    }

    const now = customDayjs()
    if (mainFormValues?.endDateTimeUtc && now.isAfter(mainFormValues?.endDateTimeUtc) && mainFormValues?.isClosed) {
      return false
    }

    return true
  }, [mainFormValues])

  const missionWithActions: MissionWithActions | undefined = useMemo(() => {
    if (!missionData) {
      return undefined
    }

    return {
      ...missionData,
      actions: missionActionsData || []
    }
  }, [missionData, missionActionsData])

  const isMissionFormValid = areMissionFormsValuesValid(mainFormValues, actionsFormValues)

  const updateReduxSliceDraft = useDebouncedCallback(() => {
    if (!mainFormValues) {
      logSoftError({
        isSideWindowError: true,
        message: '`mainFormValues` is undefined.',
        userMessage: "Une erreur est survenue pendant l'édition de la mission."
      })

      return
    }

    dispatch(
      missionActions.setDraft({
        actionsFormValues: [...actionsFormValues],
        mainFormValues: { ...mainFormValues }
      })
    )

    setTitle(getTitleFromMissionMainFormValues(mainFormValues, missionId))
  }, 250)

  const createOrUpdate = useCallback(
    async (
      createdOrUpdatedMainFormValues: MissionMainFormValues | undefined,
      createdOrUpdatedActionsFormValues: MissionActionFormValues[]
    ) => {
      if (!createdOrUpdatedMainFormValues) {
        return
      }

      try {
        dispatch(missionActions.setIsListeningToEvents(false))
        let nextMissionId: number

        if (!missionId) {
          const newMission = getMissionDataFromMissionFormValues(createdOrUpdatedMainFormValues)
          // TODO Override Redux RTK typings globally.
          // Redux RTK typing is wrong, this should be a tuple-like to help TS discriminate `data` from `error`.
          const { data, error } = (await createMission(newMission)) as any
          if (!data) {
            throw new FrontendError('`createMission()` failed', error)
          }

          newMissionId.current = data.id
          nextMissionId = data.id

          setMainFormValues({
            ...createdOrUpdatedMainFormValues,
            createdAtUtc: data.createdAtUtc,
            updatedAtUtc: data.updatedAtUtc
          })
        } else {
          const updatedMission = getUpdatedMissionFromMissionMainFormValues(missionId, createdOrUpdatedMainFormValues)
          const { data, error } = (await updateMission(updatedMission)) as any
          if (!data) {
            throw new FrontendError('`updateMission()` failed', error)
          }

          setMainFormValues({
            ...createdOrUpdatedMainFormValues,
            updatedAtUtc: data.updatedAtUtc
          })
          nextMissionId = missionId
        }

        const { deletedMissionActionIds, updatedMissionActionDatas } =
          getMissionActionsDataFromMissionActionsFormValues(
            nextMissionId,
            createdOrUpdatedActionsFormValues,
            missionWithActions?.actions
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

        dispatch(missionActions.setIsDraftDirty(false))
        setTimeout(() => {
          dispatch(missionActions.setIsListeningToEvents(true))
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
      missionWithActions,
      createMission,
      createMissionAction,
      deleteMissionAction,
      updateMission,
      updateMissionAction,
      missionId
    ]
  )

  const goToMissionList = useCallback(async () => {
    dispatch(sideWindowDispatchers.openPath({ menu: SideWindowMenuKey.MISSION_LIST }))
  }, [dispatch])

  const handleDelete = useCallback(async () => {
    if (!missionIdFromPath) {
      throw new FrontendError('`missionId` is undefined')
    }

    await deleteMission(missionIdFromPath)
    dispatch(sideWindowActions.openOrFocusAndGoTo({ menu: SideWindowMenuKey.MISSION_LIST }))
  }, [deleteMission, dispatch, missionIdFromPath])

  const reopen = useCallback(() => {
    if (!mainFormValues) {
      throw new FrontendError('`mainFormValues` is undefined.')
    }

    const nextMainFormValues = {
      ...mainFormValues,
      isClosed: false
    }
    setMainFormValues(nextMainFormValues)
    updateReduxSliceDraft()
    window.document.dispatchEvent(new NotificationEvent('La mission a bien été réouverte', 'success', true))

    if (!areMissionFormsValuesValid(nextMainFormValues, actionsFormValues)) {
      dispatch(missionActions.setIsDraftDirty(true))

      return
    }

    createOrUpdate(nextMainFormValues, actionsFormValues)
  }, [dispatch, updateReduxSliceDraft, createOrUpdate, mainFormValues, actionsFormValues])

  const close = useCallback(async () => {
    if (!mainFormValues) {
      throw new FrontendError('`mainFormValues` is undefined.')
    }

    const [canClose, { nextActionsFormValues, nextMainFormValues }] = validateMissionForms(
      mainFormValues,
      actionsFormValues,
      true
    )
    // Stop creation or update there in case there are closure validation error
    if (!canClose) {
      setMainFormValues(nextMainFormValues)
      setActionsFormValues(nextActionsFormValues)

      dispatch(missionActions.setIsDraftDirty(true))
      dispatch(missionActions.setIsClosing(true))

      return
    }

    const mainFormValuesWithIsClosed = {
      ...mainFormValues,
      isClosed: true
    }
    setMainFormValues(mainFormValuesWithIsClosed)
    updateReduxSliceDraft()
    await createOrUpdate(mainFormValuesWithIsClosed, actionsFormValues)
    dispatch(sideWindowDispatchers.openPath({ menu: SideWindowMenuKey.MISSION_LIST }))
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
        dispatch(missionActions.setIsDraftDirty(true))

        return
      }

      createOrUpdate(mainFormValues, nextActionFormValuesOrActions)
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
        dispatch(missionActions.setIsDraftDirty(true))

        return
      }

      createOrUpdate(mainFormValues, nextActionsFormValues)
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
      // setActionFormKey(key => key + 1)

      if (!areMissionFormsValuesValid(mainFormValues, nextActionsFormValues) || !isAutoSaveEnabled) {
        dispatch(missionActions.setIsDraftDirty(true))

        return
      }

      createOrUpdate(mainFormValues, nextActionsFormValues)
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
      // setActionFormKey(key => key + 1)

      if (!areMissionFormsValuesValid(mainFormValues, nextActionsFormValues) || !isAutoSaveEnabled) {
        dispatch(missionActions.setIsDraftDirty(true))

        return
      }

      createOrUpdate(mainFormValues, nextActionsFormValues)
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
        isClosed: mainFormValues?.isClosed || false
      }

      setMainFormValues(mainFormValuesWithUpdatedIsClosedProperty)
      updateReduxSliceDraft()

      if (
        !areMissionFormsValuesValid(mainFormValuesWithUpdatedIsClosedProperty, actionsFormValues) ||
        !isAutoSaveEnabled
      ) {
        dispatch(missionActions.setIsDraftDirty(true))

        return
      }

      createOrUpdate(mainFormValuesWithUpdatedIsClosedProperty, actionsFormValues)
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

  // ---------------------------------------------------------------------------
  // DATA INITIALIZATION ON COMPONENT MOUNT

  useEffect(() => {
    if (isLoading || hasFetchingError || (mainFormValues && missionIdFromPath === previousMissionId && !isNewEdition)) {
      return
    }

    dispatch(missionActions.unsetIsNewEdition())

    formikEditedActionFormValuesRef.current = undefined
    newMissionId.current = undefined

    // When we create a new mission
    if (!missionId) {
      if (!missionDraft) {
        throw new FrontendError('`missionDraft` is undefined.')
      }

      setMainFormValues(missionDraft.mainFormValues)
      setActionsFormValues(missionDraft.actionsFormValues)
      updateReduxSliceDraft()
      setActionFormKey(key => key + 1)

      return
    }

    // When we edit an existing mission
    const mission = omit(['actions'], missionWithActions)

    const { initialActionsFormValues, initialMainFormValues } = getMissionFormInitialValues(
      mission,
      missionWithActions?.actions ?? []
    )
    const [, { nextActionsFormValues, nextMainFormValues }] = validateMissionForms(
      initialMainFormValues,
      initialActionsFormValues,
      false
    )

    setMainFormValues(nextMainFormValues)
    setActionsFormValues(nextActionsFormValues)
    updateReduxSliceDraft()

    setActionFormKey(key => key + 1)
  }, [
    dispatch,
    hasFetchingError,
    isNewEdition,
    isLoading,
    mainFormValues,
    missionDraft,
    missionId,
    missionIdFromPath,
    updateReduxSliceDraft,
    missionWithActions,
    previousMissionId
  ])

  useEffect(
    () => () => {
      dispatch(missionActions.unsetDraft())
    },
    [dispatch]
  )

  // ---------------------------------------------------------------------------

  if (missionFormError) {
    return (
      <ErrorFallback data-cy="mission-form-error">
        🔌 {missionFormError.message}
        <br />
        {missionFormError.useCase && (
          <RetryButton accent={Accent.PRIMARY} onClick={() => dispatch(retry(missionFormError.useCase))}>
            Réessayer
          </RetryButton>
        )}
      </ErrorFallback>
    )
  }

  return (
    <>
      <Wrapper>
        <Header>
          <BackToListIcon onClick={goToMissionList} />

          <HeaderTitle>{title}</HeaderTitle>
          <TitleSourceTag missionId={missionId} missionSource={mainFormValues?.missionSource} />
          {mainFormValues && <TitleStatusTag status={getMissionStatus(mainFormValues)} />}
        </Header>

        <Body>
          <FrontendErrorBoundary>
            {(isLoading || !mainFormValues) && <LoadingSpinnerWall />}

            {!isLoading && mainFormValues && (
              <>
                <MainForm
                  // We use this key to fully control when to re-render `<MainForm />`
                  key={missionId}
                  initialValues={mainFormValues}
                  missionId={missionId}
                  onChange={updateMainFormValues}
                />
                <ActionList
                  actionsFormValues={actionsFormValues}
                  currentIndex={editedActionIndex}
                  missionTypes={mainFormValues?.missionTypes}
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
            )}
          </FrontendErrorBoundary>
        </Body>
        <Footer>
          <div>
            {missionIdFromPath && (
              <Button
                accent={Accent.SECONDARY}
                disabled={isLoading || isSaving || mainFormValues?.missionSource !== Mission.MissionSource.MONITORFISH}
                Icon={Icon.Delete}
                onClick={toggleDeletionConfirmationDialog}
              >
                Supprimer la mission
              </Button>
            )}
          </div>
          <div>
            <MissionInfos>
              {mainFormValues?.createdAtUtc && (
                <>Mission créée le {customDayjs(mainFormValues.createdAtUtc).utc().format('D MMM YYYY, HH:mm')}. </>
              )}
              {!mainFormValues?.createdAtUtc && <>Mission non enregistrée. </>}
              {mainFormValues?.updatedAtUtc && (
                <>Dernière modification enregistrée {timeago.format(mainFormValues.updatedAtUtc, 'fr')}.</>
              )}
            </MissionInfos>
            <AutoSaveTag isAutoSaveEnabled={isAutoSaveEnabled} />
            {!isAutoSaveEnabled && (
              <Button
                accent={Accent.PRIMARY}
                disabled={isLoading || isSaving || !isMissionFormValid}
                Icon={Icon.Save}
                onClick={async () => {
                  await createOrUpdate(mainFormValues, actionsFormValues)

                  goToMissionList()
                }}
              >
                Enregistrer
              </Button>
            )}
            {!mainFormValues?.isClosed && (
              <Button
                accent={Accent.SECONDARY}
                data-cy="close-mission"
                disabled={isLoading || isSaving || !isMissionFormValid}
                Icon={Icon.Confirm}
                onClick={close}
              >
                Clôturer
              </Button>
            )}
            {mainFormValues?.isClosed && (
              <Button
                accent={Accent.SECONDARY}
                data-cy="reopen-mission"
                disabled={isLoading || isSaving}
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

const ErrorFallback = styled.div`
  width: 250px;
  height: 90px;
  color: ${p => p.theme.color.slateGray};
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  margin: 0 auto;
  transform: translateY(-50%);
  text-align: center;
`

const RetryButton = styled(Button)`
  margin-top: 10px;
`

const BackToListIcon = styled(Icon.Chevron)`
  margin-right: 12px;
  transform: rotate(90deg);
  cursor: pointer;
`

// All containers within Wrapper should now be only using flexboxes
const Wrapper = styled(NoRsuiteOverrideWrapper)`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

const Header = styled.div`
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

const HeaderTitle = styled.h1`
  color: ${p => p.theme.color.charcoal};
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
  margin: 0 0 4px !important;
  vertical-align: 2px;
`

const Body = styled.div`
  background-color: ${p => p.theme.color.gainsboro};
  display: flex;
  flex-grow: 1;
  min-height: 0;
`

const Footer = styled.div`
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

const CloseButton = styled(Button)`
  height: 34px;
`
