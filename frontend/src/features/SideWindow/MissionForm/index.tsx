import {Accent, Button, Icon, logSoftError, NotificationEvent, usePrevious} from '@mtes-mct/monitor-ui'
import {skipToken} from '@reduxjs/toolkit/dist/query'
import {omit} from 'lodash/fp'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import styled from 'styled-components'

import {ActionForm} from './ActionForm'
import {ActionList} from './ActionList'
import {getMissionActionFormInitialValues} from './ActionList/utils'
import {useCreateMissionMutation, useDeleteMissionMutation, useGetMissionQuery, useUpdateMissionMutation} from './apis'
import {MainForm} from './MainForm'
import {DeletionConfirmationDialog} from './shared/DeletionConfirmationDialog'
import {DraftCancellationConfirmationDialog} from './shared/DraftCancellationConfirmationDialog'
import {TitleSourceTag} from './shared/TitleSourceTag'
import {TitleStatusTag} from './shared/TitleStatusTag'
import {
  areMissionFormsValuesValid,
  getMissionActionsDataFromMissionActionsFormValues,
  getMissionDataFromMissionFormValues,
  getMissionFormInitialValues,
  getTitleFromMissionMainFormValues,
  getUpdatedMissionFromMissionMainFormValues,
  validateMissionForms
} from './utils'
import {
  useCreateMissionActionMutation,
  useDeleteMissionActionMutation,
  useGetMissionActionsQuery,
  useUpdateMissionActionMutation
} from '../../../api/missionAction'
import {missionActions} from '../../../domain/actions'
import {getMissionStatus} from '../../../domain/entities/mission/utils'
import {SideWindowMenuKey} from '../../../domain/entities/sideWindow/constants'
import {sideWindowActions} from '../../../domain/shared_slices/SideWindow'
import {displayOrLogError} from '../../../domain/use_cases/error/displayOrLogError'
import {retry} from '../../../domain/use_cases/error/retry'
import {sideWindowDispatchers} from '../../../domain/use_cases/sideWindow'
import {useMainAppDispatch} from '../../../hooks/useMainAppDispatch'
import {useMainAppSelector} from '../../../hooks/useMainAppSelector'
import {FrontendError} from '../../../libs/FrontendError'
import {FrontendErrorBoundary} from '../../../ui/FrontendErrorBoundary'
import {LoadingSpinnerWall} from '../../../ui/LoadingSpinnerWall'
import {NoRsuiteOverrideWrapper} from '../../../ui/NoRsuiteOverrideWrapper'

import type {MissionActionFormValues, MissionMainFormValues} from './types'
import type {MissionAction} from '../../../domain/types/missionAction'
import {useDebouncedCallback} from "use-debounce";
import { Mission, type MissionWithActions } from '../../../domain/entities/mission/types'
import { isEqual } from 'lodash'

export function MissionForm() {
  const missionId = useMainAppSelector(store => store.sideWindow.selectedPath.id)
  const isDraftCancellationConfirmationDialogOpen = useMainAppSelector(
    store => store.sideWindow.isDraftCancellationConfirmationDialogOpen
  )
  const missionFormError = useMainAppSelector(state => state.displayedError.missionFormError)

  const headerDivRef = useRef<HTMLDivElement | null>(null)
  const originalMissionRef = useRef<MissionWithActions | undefined>(undefined)

  const [mainFormValues, setMainFormValues] = useState<MissionMainFormValues | undefined>(undefined)
  const [actionsFormValues, setActionsFormValues] = useState<MissionActionFormValues[]>([])
  const [editedActionIndex, setEditedActionIndex] = useState<number | undefined>(undefined)
  const [isDeletionConfirmationDialogOpen, setIsDeletionConfirmationDialogOpen] = useState(false)
  const [title, setTitle] = useState(getTitleFromMissionMainFormValues(undefined, undefined))
  const previousMissionId = usePrevious(missionId)

  // We use these keys to fully control when to re-render `<MainForm />` & `<ActionForm />`
  // since they are fully memoized in order to optimize their (heavy) re-rendering
  const [actionFormKey, setActionFormKey] = useState(0)
  const [mainFormKey, setMainFormKey] = useState(0)

  const initialMainFormValuesRef = useRef<MissionMainFormValues | undefined>(undefined)
  const initialMainFormValues = useMemo(() => {
    if (initialMainFormValuesRef.current) {
      return initialMainFormValuesRef.current
    }

    if (mainFormValues) {
      initialMainFormValuesRef.current = mainFormValues
      console.log('increment key')
      setMainFormKey(mainFormKey + 1)

      return mainFormValues
    }

    return undefined
  }, [mainFormValues])
  console.log('mainFormValues', mainFormValues)

  const dispatch = useMainAppDispatch()
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

  const isSaving =
    isCreatingMission ||
    isDeletingMission ||
    isUpdatingMission ||
    isCreatingMissionAction ||
    isDeletingMissionAction ||
    isUpdatingMissionAction

  const isLoading = isFetchingMission || isFetchingMissionActions

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

  const missionWithActions: MissionWithActions | undefined = useMemo(() => {
    if (!missionData) {
      return undefined
    }

    return {
      ...missionData,
      actions: missionActionsData || []
    }
  }, [missionData, missionActionsData])

  const editedActionFormValues = useMemo(
    () => (editedActionIndex !== undefined ? actionsFormValues[editedActionIndex] : undefined),
    [actionsFormValues, editedActionIndex]
  )
  const isMissionFormValid = areMissionFormsValuesValid(mainFormValues, actionsFormValues)

  const addAction = useCallback(
    (actionType: MissionAction.MissionActionType) => {
      const newActionFormValues = getMissionActionFormInitialValues(actionType)
      const nextActionsFormValues = [...actionsFormValues, newActionFormValues]

      // setActionsFormValues(nextActionsFormValues)
      setActionFormKey(actionFormKey + 1)
      setEditedActionIndex(nextActionsFormValues.length - 1)
    },
    [actionFormKey, actionsFormValues]
  )

  /**
   * @param mustClose Should the mission be closed?
   */
  const createOrUpdate = useCallback(
    async (createdOrUpdatedMainFormValues: MissionMainFormValues | undefined, mustClose: boolean = false) => {
      console.log("pre validation", createdOrUpdatedMainFormValues)
      if (!createdOrUpdatedMainFormValues) {
        return
      }

      // Stop right there if there are live validation error
      if (!areMissionFormsValuesValid(createdOrUpdatedMainFormValues, actionsFormValues)) {
        return
      }

      if (mustClose) {
        const [canClose, { nextActionsFormValues, nextMainFormValues }] = validateMissionForms(
          createdOrUpdatedMainFormValues,
          actionsFormValues,
          true
        )
        // Stop creation or update there in case there are closure validation error
        if (!canClose) {
          setMainFormValues(nextMainFormValues)
          // setActionsFormValues(nextActionsFormValues)

          dispatch(missionActions.setIsClosing(true))

          return
        }
      }

      try {
        let nextMissionId: number

        if (!missionId) {
          const newMission = getMissionDataFromMissionFormValues(createdOrUpdatedMainFormValues, mustClose)
          // TODO Override Redux RTK typings globally.
          // Redux RTK typing is wrong, this should be a tuple-like to help TS discriminate `data` from `error`.
          const { data, error } = (await createMission(newMission)) as any
          if (!data) {
            throw new FrontendError('`createMission()` failed', error)
          }

          nextMissionId = data.id
        } else {
          const updatedMission = getUpdatedMissionFromMissionMainFormValues(missionId, createdOrUpdatedMainFormValues, mustClose)
          await updateMission(updatedMission)

          nextMissionId = missionId
        }
        console.log("update", createdOrUpdatedMainFormValues)
        setMainFormValues(createdOrUpdatedMainFormValues)

        const { deletedMissionActionIds, updatedMissionActionDatas } =
          getMissionActionsDataFromMissionActionsFormValues(
            nextMissionId,
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
      actionsFormValues,
      createMission,
      createMissionAction,
      deleteMissionAction,
      dispatch,
      updateMission,
      updateMissionAction,
      missionId
    ]
  )

  const duplicateAction = useCallback(
    (actionIndex: number) => {
      const actionCopy: MissionActionFormValues = omit(['id'], actionsFormValues[actionIndex])

      setActionsFormValues([...actionsFormValues, actionCopy])

      setActionFormKey(actionFormKey + 1)
      setEditedActionIndex(actionsFormValues.length - 1)
    },
    [actionFormKey, actionsFormValues]
  )

  const goToMissionList = useCallback(async () => {
    dispatch(sideWindowDispatchers.openPath({ menu: SideWindowMenuKey.MISSION_LIST }))
  }, [dispatch])

  const handleDelete = useCallback(async () => {
    if (!missionId) {
      throw new FrontendError('`missionId` is undefined')
    }

    await deleteMission(missionId)
    dispatch(sideWindowActions.openOrFocusAndGoTo({ menu: SideWindowMenuKey.MISSION_LIST }))
  }, [deleteMission, dispatch, missionId])

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

    const nextMainFormValues = {
      ...mainFormValues,
      isClosed: false
    }
    createOrUpdate(nextMainFormValues)
    setMainFormValues(nextMainFormValues)

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
    setMainFormValues(mainFormValues)
  }

  const updateEditedActionIndex = useCallback(
    (nextActionIndex: number | undefined) => {
      setActionFormKey(actionFormKey + 1)
      setEditedActionIndex(nextActionIndex)
    },
    [actionFormKey]
  )

  const updateMainFormValuesCallback = useCallback((nextMissionMainFormValues: MissionMainFormValues, values: MissionMainFormValues) => {
    if (isEqual(nextMissionMainFormValues, mainFormValues)) {
      return
    }

    const mainFormValuesWithUpdatedIsClosedProperty = {
      ...nextMissionMainFormValues,
      isClosed: values?.isClosed || false
    }

    createOrUpdate(mainFormValuesWithUpdatedIsClosedProperty)
  }, [createOrUpdate])

  const updateMainFormValues = useDebouncedCallback((nextMissionMainFormValues: MissionMainFormValues, values: MissionMainFormValues) =>
    updateMainFormValuesCallback(nextMissionMainFormValues, values), 500)


  const toggleDeletionConfirmationDialog = useCallback(async () => {
    setIsDeletionConfirmationDialogOpen(!isDeletionConfirmationDialogOpen)
  }, [isDeletionConfirmationDialogOpen])

  // ---------------------------------------------------------------------------
  // DATA

  useEffect(() => {
    // We hide selected missions geometries and overlays on map
    dispatch(missionActions.unsetSelectedMissionGeoJSON())

    if (isLoading) {
      return
    }

    // When we create a new mission
    if (!missionWithActions) {
      const { initialActionsFormValues, initialMainFormValues } = getMissionFormInitialValues(undefined, [])

      console.log("mission creating", initialMainFormValues)
      setMainFormValues(initialMainFormValues)
      setActionsFormValues(initialActionsFormValues)
      setTitle(getTitleFromMissionMainFormValues(initialMainFormValues, undefined))

      return
    }

    // When we edit an existing mission

    if (missionWithActions.id !== previousMissionId) {
      dispatch(missionActions.unsetDraft())
    }

    const mission = omit(['actions'], missionWithActions)

    originalMissionRef.current = missionWithActions
    const { initialActionsFormValues, initialMainFormValues } = getMissionFormInitialValues(
      mission,
      missionWithActions.actions
    )
    const [, { nextActionsFormValues, nextMainFormValues }] = validateMissionForms(
      initialMainFormValues,
      initialActionsFormValues,
      false
    )

    console.log(nextMainFormValues)
    setMainFormValues(nextMainFormValues)
    setActionsFormValues(nextActionsFormValues)
    setTitle(getTitleFromMissionMainFormValues(initialMainFormValues, missionWithActions.id))
  }, [dispatch, missionWithActions, previousMissionId, isLoading])

  useEffect(
    () => () => {
      dispatch(missionActions.unsetDraft())
    },
    [dispatch]
  )

  const mainForm = useMemo(() => {
    return <MainForm
      key={`main-form-${mainFormKey}`}
      initialValues={initialMainFormValues!!}
      onChange={updateMainFormValues}
    />
  }, [initialMainFormValues, mainFormKey])

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
        <Header ref={headerDivRef}>
          <BackToListIcon onClick={goToMissionList} />

          <HeaderTitle>{title}</HeaderTitle>
          <TitleSourceTag missionId={missionId} missionSource={mainFormValues?.missionSource} />
          {mainFormValues && <TitleStatusTag status={getMissionStatus(mainFormValues)} />}
        </Header>

        <Body>
          <FrontendErrorBoundary>
            {(isLoading || !initialMainFormValues) && <LoadingSpinnerWall />}

            {!isLoading && initialMainFormValues && (
              <>
                {mainForm}
                <ActionList
                  actionsFormValues={actionsFormValues}
                  currentIndex={editedActionIndex}
                  missionTypes={initialMainFormValues.missionTypes}
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
            {missionId && (
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
            {!isMissionFormValid && <FooterError>Veuillez corriger les éléments en rouge</FooterError>}

            <Button accent={Accent.TERTIARY} disabled={isSaving} onClick={goToMissionList}>
              Annuler
            </Button>

            {!mainFormValues?.isClosed && (
              <Button
                accent={Accent.SECONDARY}
                disabled={isLoading || isSaving || !isMissionFormValid}
                Icon={Icon.Confirm}
                onClick={() => createOrUpdate(mainFormValues, true)}
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
      {isDraftCancellationConfirmationDialogOpen && <DraftCancellationConfirmationDialog />}
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

const FooterError = styled.p`
  color: ${p => p.theme.color.maximumRed};
  font-style: italic;
  margin: 0 0 4px 0;
`
