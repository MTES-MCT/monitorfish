import { Accent, Button, Icon, logSoftError, NotificationEvent, usePrevious } from '@mtes-mct/monitor-ui'
import { omit } from 'lodash/fp'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { useDebouncedCallback } from 'use-debounce'

import { ActionForm } from './ActionForm'
import { ActionList } from './ActionList'
import { getMissionActionFormInitialValues } from './ActionList/utils'
import { MainForm } from './MainForm'
import { DeletionConfirmationDialog } from './shared/DeletionConfirmationDialog'
import { DraftCancellationConfirmationDialog } from './shared/DraftCancellationConfirmationDialog'
import { TitleSourceTag } from './shared/TitleSourceTag'
import { TitleStatusTag } from './shared/TitleStatusTag'
import {
  areMissionFormsClosureValuesValid,
  areMissionFormsValuesValid,
  getMissionActionsDataFromMissionActionsFormValues,
  getMissionDataFromMissionFormValues,
  getMissionFormInitialValues,
  getTitleFromMissionMainFormValues,
  getUpdatedMissionFromMissionMainFormValues
} from './utils'
import { useCreateMissionMutation, useDeleteMissionMutation, useUpdateMissionMutation } from '../../../api/mission'
import {
  useCreateMissionActionMutation,
  useDeleteMissionActionMutation,
  useUpdateMissionActionMutation
} from '../../../api/missionAction'
import { missionActions } from '../../../domain/actions'
import { Mission, type MissionWithActions } from '../../../domain/entities/mission/types'
import { getMissionStatus } from '../../../domain/entities/mission/utils'
import { SideWindowMenuKey } from '../../../domain/entities/sideWindow/constants'
import { sideWindowActions } from '../../../domain/shared_slices/SideWindow'
import { retry } from '../../../domain/use_cases/error/retry'
import { getMission } from '../../../domain/use_cases/mission/getMission'
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
  const sideWindow = useMainAppSelector(store => store.sideWindow)
  const { missionFormError } = useMainAppSelector(state => state.displayedError)

  const headerDivRef = useRef<HTMLDivElement | null>(null)
  const originalMissionRef = useRef<MissionWithActions | undefined>(undefined)

  const [actionsFormValues, setActionsFormValues] = useState<MissionActionFormValues[]>([])
  const [editedActionIndex, setEditedActionIndex] = useState<number | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeletionConfirmationDialogOpen, setIsDeletionConfirmationDialogOpen] = useState(false)
  const [mainFormValues, setMainFormValues] = useState<MissionMainFormValues | undefined>(undefined)
  const [title, setTitle] = useState(getTitleFromMissionMainFormValues(undefined, undefined))
  const previousMissionId = usePrevious(sideWindow.selectedPath.id)

  // We use these keys to fully control when to re-render `<MainForm />` & `<ActionForm />`
  // since they are fully memoized in order to optimize their (heavy) re-rendering
  const [actionFormKey, setActionFormKey] = useState(0)
  const [mainFormKey, setMainFormKey] = useState(0)

  const dispatch = useMainAppDispatch()
  const [createMission] = useCreateMissionMutation()
  const [deleteMission] = useDeleteMissionMutation()
  const [createMissionAction] = useCreateMissionActionMutation()
  const [deleteMissionAction] = useDeleteMissionActionMutation()
  const [updateMission] = useUpdateMissionMutation()
  const [updateMissionAction] = useUpdateMissionActionMutation()

  const editedActionFormValues = useMemo(
    () => (editedActionIndex !== undefined ? actionsFormValues[editedActionIndex] : undefined),
    [actionsFormValues, editedActionIndex]
  )
  const isMissionFormValid = areMissionFormsValuesValid(mainFormValues, actionsFormValues)

  const addAction = useCallback(
    (actionType: MissionAction.MissionActionType) => {
      const newActionFormValues = getMissionActionFormInitialValues(actionType)
      const nextActionsFormValues = [...actionsFormValues, newActionFormValues]

      setActionsFormValues(nextActionsFormValues)
      setActionFormKey(actionFormKey + 1)
      setEditedActionIndex(nextActionsFormValues.length - 1)
    },
    [actionFormKey, actionsFormValues]
  )

  /**
   * @param mustClose Should the mission be closed?
   */
  const createOrUpdate = useCallback(
    async (mustClose: boolean = false) => {
      if (!mainFormValues) {
        logSoftError({
          isSideWindowError: true,
          message: '`mainFormValues` is undefined.',
          userMessage: "Une erreur est survenue pendant l'enregistrement de la mission."
        })

        return
      }

      setIsSaving(true)

      // Stop right there if there are live validation error
      if (!areMissionFormsValuesValid(mainFormValues, actionsFormValues)) {
        setIsSaving(false)

        return
      }

      if (mustClose) {
        const [canClose, { nextActionsFormValues, nextMainFormValues }] = areMissionFormsClosureValuesValid(
          mainFormValues,
          actionsFormValues
        )
        // Stop creation or update there in case there are closure validation error
        if (!canClose) {
          setMainFormValues(nextMainFormValues)
          setActionsFormValues(nextActionsFormValues)
          setIsSaving(false)

          dispatch(missionActions.setIsClosing(true))

          return
        }
      }

      try {
        let missionId: number

        if (!sideWindow.selectedPath.id) {
          const newMission = getMissionDataFromMissionFormValues(mainFormValues, mustClose)
          // TODO Override Redux RTK typings globally.
          // Redux RTK typing is wrong, this should be a tuple-like to help TS discriminate `data` from `error`.
          const { data, error } = (await createMission(newMission)) as any
          if (!data) {
            throw new FrontendError('`createMission()` failed', error)
          }

          missionId = data.id
        } else {
          const updatedMission = getUpdatedMissionFromMissionMainFormValues(
            sideWindow.selectedPath.id,
            mainFormValues,
            mustClose
          )
          await updateMission(updatedMission)

          missionId = sideWindow.selectedPath.id
        }

        const { deletedMissionActionIds, updatedMissionActionDatas } =
          getMissionActionsDataFromMissionActionsFormValues(
            missionId,
            actionsFormValues,
            originalMissionRef.current?.actions
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

        dispatch(sideWindowActions.openOrFocusAndGoTo({ menu: SideWindowMenuKey.MISSION_LIST }))
      } catch (err) {
        logSoftError({
          isSideWindowError: true,
          message: '`createOrUpdate()` failed.',
          originalError: err,
          userMessage: "Une erreur est survenue pendant l'enregistrement de la mission."
        })

        setIsSaving(false)
      }
    },
    [
      actionsFormValues,
      createMission,
      createMissionAction,
      deleteMissionAction,
      dispatch,
      mainFormValues,
      updateMission,
      updateMissionAction,
      sideWindow.selectedPath.id
    ]
  )

  const duplicateAction = useCallback(
    (actionIndex: number) => {
      const sourceAction = omit(['id'], actionsFormValues[actionIndex]) as MissionActionFormValues

      setActionsFormValues([...actionsFormValues, sourceAction])

      setActionFormKey(actionFormKey + 1)
      setEditedActionIndex(actionsFormValues.length - 1)
    },
    [actionFormKey, actionsFormValues]
  )

  const goToMissionList = useCallback(async () => {
    dispatch(sideWindowDispatchers.openPath({ menu: SideWindowMenuKey.MISSION_LIST }))
  }, [dispatch])

  const handleDelete = useCallback(async () => {
    if (!sideWindow.selectedPath.id) {
      throw new FrontendError('`sideWindow.selectedPath.id` is undefined')
    }

    setIsSaving(true)

    await deleteMission(sideWindow.selectedPath.id)
    dispatch(sideWindowActions.openOrFocusAndGoTo({ menu: SideWindowMenuKey.MISSION_LIST }))
  }, [deleteMission, dispatch, sideWindow.selectedPath.id])

  const removeAction = useCallback(
    (actionIndex: number) => {
      const nextActionsFormValues = actionsFormValues.reduce(
        (nextActions, action, index) => (index === actionIndex ? nextActions : [...nextActions, action]),
        [] as MissionActionFormValues[]
      )

      setActionsFormValues(nextActionsFormValues)
      if (editedActionIndex === actionIndex) {
        setActionFormKey(actionFormKey + 1)
        setEditedActionIndex(undefined)
      }
    },
    [actionFormKey, actionsFormValues, editedActionIndex]
  )

  const reopen = useCallback(() => {
    if (!mainFormValues) {
      throw new FrontendError('`mainFormValues` is undefined.')
    }

    setMainFormValues({
      ...mainFormValues,
      isClosed: false
    })

    window.document.dispatchEvent(new NotificationEvent('La mission a bien été réouverte', 'success', true))
  }, [mainFormValues])

  const updateEditedActionFormValues = (nextActionFormValues: MissionActionFormValues) => {
    if (editedActionIndex === undefined) {
      logSoftError({
        isSideWindowError: true,
        message: '`editedActionIndex` is undefined.',
        userMessage: "Une erreur est survenue pendant l'édition de la mission."
      })

      return
    }
    if (mainFormValues === undefined) {
      logSoftError({
        isSideWindowError: true,
        message: '`mainFormValues` is undefined.',
        userMessage: "Une erreur est survenue pendant l'édition de la mission."
      })

      return
    }

    const nextActionFormValuesOrActions = actionsFormValues.map((action, index) =>
      index === editedActionIndex ? nextActionFormValues : action
    )
    setActionsFormValues(nextActionFormValuesOrActions)

    updateReduxSliceDraft()
  }

  const updateEditedActionIndex = useCallback(
    (nextActionIndex: number | undefined) => {
      setActionFormKey(actionFormKey + 1)
      setEditedActionIndex(nextActionIndex)
    },
    [actionFormKey]
  )

  const updateMainFormValues = (nextMissionMainFormValues: MissionMainFormValues) => {
    const mainFormValuesWithUpdatedIsClosedProperty = {
      ...nextMissionMainFormValues,
      isClosed: mainFormValues?.isClosed || false
    }
    setMainFormValues(mainFormValuesWithUpdatedIsClosedProperty)

    updateReduxSliceDraft()
  }

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
  }, 250)

  const toggleDeletionConfirmationDialog = useCallback(async () => {
    setIsDeletionConfirmationDialogOpen(!isDeletionConfirmationDialogOpen)
  }, [isDeletionConfirmationDialogOpen])

  // ---------------------------------------------------------------------------
  // DATA

  useEffect(() => {
    if (!isLoading && sideWindow.selectedPath.id === previousMissionId) {
      return
    }

    if (sideWindow.selectedPath.id !== previousMissionId) {
      setIsLoading(true)

      dispatch(missionActions.unsetDraft())
    }

    ;(async () => {
      // When we create a new mission

      if (!sideWindow.selectedPath.id) {
        const { initialActionsFormValues, initialMainFormValues } = getMissionFormInitialValues(undefined, [])

        setActionFormKey(actionFormKey + 1)
        setActionsFormValues(initialActionsFormValues)
        setIsLoading(false)
        setMainFormKey(mainFormKey + 1)
        setMainFormValues(initialMainFormValues)
        setTitle(getTitleFromMissionMainFormValues(initialMainFormValues, undefined))

        updateReduxSliceDraft()

        return
      }

      // When we edit an existing mission
      const missionWithActions = await dispatch(getMission(sideWindow.selectedPath.id))
      if (!missionWithActions) {
        return
      }

      // @ts-ignore
      const mission = { actions: _, ...missionWithActions }

      originalMissionRef.current = missionWithActions
      const { initialActionsFormValues, initialMainFormValues } = getMissionFormInitialValues(
        mission,
        missionWithActions.actions
      )

      setActionFormKey(actionFormKey + 1)
      setActionsFormValues(initialActionsFormValues)
      setIsLoading(false)
      setMainFormKey(mainFormKey + 1)
      setMainFormValues({ ...initialMainFormValues })
      setTitle(getTitleFromMissionMainFormValues(initialMainFormValues, sideWindow.selectedPath.id))

      updateReduxSliceDraft()
    })()
  }, [
    actionFormKey,
    dispatch,
    isLoading,
    mainFormKey,
    previousMissionId,
    sideWindow.selectedPath.id,
    updateReduxSliceDraft
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
      <ErrorFallback data-cy="vessel-sidebar-error">
        🔌 {missionFormError.message}
        <br />
        <RetryButton accent={Accent.PRIMARY} onClick={() => dispatch(retry(missionFormError.useCase))}>
          Réessayer
        </RetryButton>
      </ErrorFallback>
    )
  }

  return (
    <>
      <Wrapper>
        <Header ref={headerDivRef}>
          <BackToListIcon onClick={goToMissionList} />

          <HeaderTitle>{title}</HeaderTitle>
          <TitleSourceTag missionId={sideWindow.selectedPath.id} missionSource={mainFormValues?.missionSource} />
          {mainFormValues && <TitleStatusTag status={getMissionStatus(mainFormValues)} />}
        </Header>

        <Body>
          <FrontendErrorBoundary>
            {(isLoading || !mainFormValues) && <LoadingSpinnerWall />}

            {!isLoading && mainFormValues && (
              <>
                <MainForm
                  key={`main-form-${mainFormKey}`}
                  initialValues={mainFormValues}
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
                  key={`action-form-${actionFormKey}`}
                  actionFormValues={editedActionFormValues}
                  onChange={updateEditedActionFormValues}
                />
              </>
            )}
          </FrontendErrorBoundary>
        </Body>

        <Footer>
          <div>
            {sideWindow.selectedPath.id && (
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
            <Button accent={Accent.TERTIARY} disabled={isSaving} onClick={goToMissionList}>
              Annuler
            </Button>

            <Button
              accent={Accent.PRIMARY}
              disabled={isLoading || isSaving || !isMissionFormValid}
              Icon={Icon.Save}
              onClick={() => createOrUpdate()}
            >
              Enregistrer et quitter
            </Button>

            {!mainFormValues?.isClosed && (
              <Button
                accent={Accent.SECONDARY}
                disabled={isLoading || isSaving || !isMissionFormValid}
                Icon={Icon.Confirm}
                onClick={() => createOrUpdate(true)}
              >
                Enregistrer et clôturer
              </Button>
            )}
            {mainFormValues?.isClosed && (
              <Button
                accent={Accent.SECONDARY}
                disabled={isLoading || isSaving}
                Icon={Icon.Unlock}
                onClick={reopen}
                type="button"
              >
                Ré-ouvrir la mission
              </Button>
            )}
          </div>
        </Footer>
      </Wrapper>

      {isDeletionConfirmationDialogOpen && (
        <DeletionConfirmationDialog onCancel={toggleDeletionConfirmationDialog} onConfirm={handleDelete} />
      )}
      {sideWindow.isDraftCancellationConfirmationDialogOpen && <DraftCancellationConfirmationDialog />}
    </>
  )
}

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
