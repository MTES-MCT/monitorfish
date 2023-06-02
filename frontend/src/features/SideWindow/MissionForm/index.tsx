import { Accent, Button, Icon, usePrevious } from '@mtes-mct/monitor-ui'
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
import {
  areMissionFormValuesValid,
  getMissionActionsDataFromMissionActionsFormValues,
  getMissionDataFromMissionFormValues,
  getMissionFormInitialValues,
  getTitleFromMissionMainFormValues,
  getUpdatedMissionFromMissionMainFormValues
} from './utils'
import {
  monitorenvMissionApi,
  useCreateMissionMutation,
  useDeleteMissionMutation,
  useUpdateMissionMutation
} from '../../../api/mission'
import {
  missionActionApi,
  useCreateMissionActionMutation,
  useDeleteMissionActionMutation,
  useUpdateMissionActionMutation
} from '../../../api/missionAction'
import { missionActions } from '../../../domain/actions'
import { Mission, type MissionWithActions } from '../../../domain/entities/mission/types'
import { SideWindowMenuKey } from '../../../domain/entities/sideWindow/constants'
import { sideWindowActions } from '../../../domain/shared_slices/SideWindow'
import { sideWindowDispatchers } from '../../../domain/use_cases/sideWindow'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'
import { FrontendError } from '../../../libs/FrontendError'
import { logSoftError } from '../../../libs/logSoftError'
import { FrontendErrorBoundary } from '../../../ui/FrontendErrorBoundary'
import { LoadingSpinnerWall } from '../../../ui/LoadingSpinnerWall'
import { NoRsuiteOverrideWrapper } from '../../../ui/NoRsuiteOverrideWrapper'

import type { MissionActionFormValues, MissionMainFormValues } from './types'
import type { MissionAction } from '../../../domain/types/missionAction'

export function MissionForm() {
  const { sideWindow } = useMainAppSelector(store => store)

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
  const isMissionFormValid = areMissionFormValuesValid(mainFormValues, actionsFormValues)

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
        logSoftError('`mainFormValues` is undefined.')

        return
      }

      setIsSaving(true)

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
                id: missionActionData.id
              })
            }
          })
        ])

        dispatch(sideWindowActions.openOrFocusAndGoTo({ menu: SideWindowMenuKey.MISSION_LIST }))
      } catch (err) {
        logSoftError('`createOrUpdate()` failed.', { err })

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
        setEditedActionIndex(undefined)
      }
    },
    [actionsFormValues, editedActionIndex]
  )

  const reopen = useCallback(() => {
    if (!mainFormValues) {
      throw new FrontendError('`mainFormValues` is undefined.')
    }

    setMainFormValues({
      ...mainFormValues,
      isClosed: false
    })
  }, [mainFormValues])

  const updateDraft = useDebouncedCallback(
    // We need to use a callback within to memoize it
    // https://codesandbox.io/s/4wvmp1xlw4?file=/src/InputWithCallback.js:357-386
    useCallback(() => {
      if (!mainFormValues) {
        logSoftError('`mainFormValues` is undefined.')

        return
      }

      dispatch(
        missionActions.setDraft({
          actionsFormValues,
          mainFormValues
        })
      )
    }, [actionsFormValues, dispatch, mainFormValues]),
    250
  )

  const updateEditedActionFormValues = useCallback(
    (nextActionFormValues: MissionActionFormValues) => {
      if (editedActionIndex === undefined) {
        logSoftError('`editedActionIndex` is undefined.')

        return
      }

      setActionsFormValues(
        actionsFormValues.reduce(
          (nextActions, action, index) => [...nextActions, index === editedActionIndex ? nextActionFormValues : action],
          [] as MissionActionFormValues[]
        )
      )

      updateDraft()
    },
    [actionsFormValues, editedActionIndex, updateDraft]
  )

  const updateEditedActionIndex = useCallback(
    (nextActionIndex: number | undefined) => {
      setActionFormKey(actionFormKey + 1)
      setEditedActionIndex(nextActionIndex)
    },
    [actionFormKey]
  )

  const updateMainFormValues = useCallback(
    (nextMissionMainFormValues: MissionMainFormValues) => {
      setMainFormValues(nextMissionMainFormValues)

      updateDraft()
    },
    [updateDraft]
  )

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

        updateDraft()

        return
      }

      // When we edit an existing mission

      const missionResponse = await dispatch(
        monitorenvMissionApi.endpoints.getMission.initiate(sideWindow.selectedPath.id)
      )
      const missionActionsResponse = await dispatch(
        missionActionApi.endpoints.getMissionActions.initiate(sideWindow.selectedPath.id)
      )
      if (!missionResponse.data) {
        throw new FrontendError('`missionResponse.data` is undefined.')
      }
      if (!missionActionsResponse.data) {
        throw new FrontendError('`missionActionsResponse.data` is undefined.')
      }

      originalMissionRef.current = {
        ...missionResponse.data,
        actions: missionActionsResponse.data
      }
      const { initialActionsFormValues, initialMainFormValues } = getMissionFormInitialValues(
        missionResponse.data,
        missionActionsResponse.data
      )

      setActionFormKey(actionFormKey + 1)
      setActionsFormValues(initialActionsFormValues)
      setIsLoading(false)
      setMainFormKey(mainFormKey + 1)
      setMainFormValues(initialMainFormValues)
      setTitle(getTitleFromMissionMainFormValues(initialMainFormValues, sideWindow.selectedPath.id))

      updateDraft()
    })()
  }, [actionFormKey, dispatch, isLoading, mainFormKey, previousMissionId, sideWindow.selectedPath.id, updateDraft])

  useEffect(
    () => () => {
      dispatch(missionActions.unsetDraft())
    },
    [dispatch]
  )

  // ---------------------------------------------------------------------------

  return (
    <>
      <Wrapper>
        <Header ref={headerDivRef}>
          <BackToListIcon onClick={goToMissionList} />

          <HeaderTitle>{title}</HeaderTitle>
          <TitleSourceTag missionId={sideWindow.selectedPath.id} missionSource={mainFormValues?.missionSource} />
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
            {mainFormValues?.isClosed && (
              <FooterMessage>Veuillez rouvrir la mission avant d’en modifier les informations.</FooterMessage>
            )}

            <Button accent={Accent.TERTIARY} disabled={isSaving} onClick={goToMissionList}>
              Annuler
            </Button>

            {!mainFormValues?.isClosed && (
              <>
                <Button
                  accent={Accent.SECONDARY}
                  disabled={isLoading || isSaving || !isMissionFormValid}
                  Icon={Icon.Save}
                  onClick={() => createOrUpdate()}
                >
                  Enregistrer
                </Button>
                <Button
                  accent={Accent.SECONDARY}
                  disabled={isLoading || isSaving || !isMissionFormValid}
                  Icon={Icon.Confirm}
                  onClick={() => createOrUpdate(true)}
                >
                  Enregistrer et clôturer
                </Button>
              </>
            )}
            {mainFormValues?.isClosed && (
              <Button
                accent={Accent.PRIMARY}
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

const FooterMessage = styled.p`
  font-style: italic;
`
