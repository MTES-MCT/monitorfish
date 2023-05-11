import { Accent, Button, Icon, Tag, usePrevious } from '@mtes-mct/monitor-ui'
import { captureMessage } from '@sentry/react'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { useDebouncedCallback } from 'use-debounce'

import { ActionForm } from './ActionForm'
import { ActionList } from './ActionList'
import { MainForm } from './MainForm'
import { DeletionConfirmationDialog } from './shared/DeletionConfirmationDialog'
import { DraftCancellationConfirmationDialog } from './shared/DraftCancellationConfirmationDialog'
import {
  getMissionActionsDataFromMissionActionsFormValues,
  getMissionDataFromMissionFormValues,
  getUpdatedMissionFromMissionFormValues,
  isMissionFormValuesComplete
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
import { getMissionSourceTagText } from '../../../domain/entities/mission'
import { Mission } from '../../../domain/entities/mission/types'
import { SideWindowMenuKey } from '../../../domain/entities/sideWindow/constants'
import { sideWindowActions } from '../../../domain/shared_slices/SideWindow'
import { sideWindowDispatchers } from '../../../domain/use_cases/sideWindow'
import { useDebouncedValue } from '../../../hooks/useDebouncedValue'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'
import { FrontendError } from '../../../libs/FrontendError'
import { FrontendErrorBoundary } from '../../../ui/FrontendErrorBoundary'
import { LoadingSpinnerWall } from '../../../ui/LoadingSpinnerWall'
import { NoRsuiteOverrideWrapper } from '../../../ui/NoRsuiteOverrideWrapper'

import type { MissionActionFormValues, MissionFormValues } from './types'
import type { MissionWithActions } from '../../../domain/entities/mission/types'

export function UnmemoizedMissionForm() {
  const { mission, sideWindow } = useMainAppSelector(store => store)

  const headerDivRef = useRef<HTMLDivElement | null>(null)
  const originalMissionRef = useRef<MissionWithActions | undefined>(undefined)

  const previousMissionId = usePrevious(sideWindow.selectedPath.id)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeletionConfirmationDialogOpen, setIsDeletionConfirmationDialogOpen] = useState(false)

  const dispatch = useMainAppDispatch()
  const [createMission] = useCreateMissionMutation()
  const [deleteMission] = useDeleteMissionMutation()
  const [createMissionAction] = useCreateMissionActionMutation()
  const [deleteMissionAction] = useDeleteMissionActionMutation()
  const [updateMission] = useUpdateMissionMutation()
  const [updateMissionAction] = useUpdateMissionActionMutation()

  const actionFormKey = useMemo(() => `actionForm-${mission.editedDraftActionIndex}`, [mission.editedDraftActionIndex])
  const [debouncedMissionDraft] = useDebouncedValue(mission.draft, 250)
  const isMissionFormValid = useMemo(() => isMissionFormValuesComplete(debouncedMissionDraft), [debouncedMissionDraft])

  const actionFormInitialValues = useMemo(
    () => {
      if (mission.editedDraftActionIndex === undefined) {
        return undefined
      }

      if (!mission.draft || !mission.draft.actions) {
        throw new FrontendError(
          'Either `mission.draft` or `mission.draft.actions` is undefined while `mission.editedDraftActionIndex` is not'
        )
      }

      return mission.draft.actions[mission.editedDraftActionIndex]
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mission.editedDraftActionIndex, mission.draft?.actions]
  )

  const missionTitle = useMemo(
    () =>
      sideWindow.selectedPath.id
        ? `Mission ${
            debouncedMissionDraft?.missionTypes &&
            debouncedMissionDraft.missionTypes.map(missionType => Mission.MissionTypeLabel[missionType]).join(' / ')
          } – ${debouncedMissionDraft?.controlUnits
            .map(controlUnit => controlUnit.name?.replace('(historique)', ''))
            .join(', ')}`
        : `Nouvelle mission`,
    [debouncedMissionDraft, sideWindow.selectedPath.id]
  )

  /**
   * @param mustClose Should the mission be closed?
   */
  const createOrUpdate = useCallback(
    async (mustClose: boolean = false) => {
      if (!mission.draft) {
        return
      }

      let missionId: number

      if (!sideWindow.selectedPath.id) {
        const newMission = getMissionDataFromMissionFormValues(mission.draft, mustClose)
        // TODO Override Redux RTK typings globally.
        // Redux RTK typing is wrong, this should be a tuple-like to help TS discriminate `data` from `error`.
        const { data, error } = (await createMission(newMission)) as any
        if (!data) {
          throw new FrontendError('`createMission()` failed', error)
        }

        missionId = data.id
      } else {
        const updatedMission = getUpdatedMissionFromMissionFormValues(
          sideWindow.selectedPath.id,
          mission.draft,
          mustClose
        )
        await updateMission(updatedMission)

        missionId = sideWindow.selectedPath.id
      }
      // eslint-disable-next-line no-empty

      const { deletedMissionActionIds, updatedMissionActionDatas } = getMissionActionsDataFromMissionActionsFormValues(
        missionId,
        mission.draft.actions,
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
    },
    [
      createMission,
      createMissionAction,
      deleteMissionAction,
      dispatch,
      mission.draft,
      updateMission,
      updateMissionAction,
      sideWindow.selectedPath.id
    ]
  )

  // eslint-disable-next-line no-underscore-dangle
  const _delete = useCallback(async () => {
    if (!sideWindow.selectedPath.id) {
      captureMessage('`sideWindow.selectedPath.id` is undefined')

      return
    }

    await deleteMission(sideWindow.selectedPath.id)

    dispatch(sideWindowActions.openOrFocusAndGoTo({ menu: SideWindowMenuKey.MISSION_LIST }))
  }, [deleteMission, dispatch, sideWindow.selectedPath.id])

  const goToMissionList = useCallback(async () => {
    dispatch(sideWindowDispatchers.openPath({ menu: SideWindowMenuKey.MISSION_LIST }))
  }, [dispatch])

  const handleActionFormChange = useDebouncedCallback((nextMissionActionFormValues: MissionActionFormValues) => {
    dispatch(missionActions.setEditedDraftAction(nextMissionActionFormValues))
  }, 500)

  const handleMainFormChange = useDebouncedCallback((nextMissionFormValues: MissionFormValues) => {
    dispatch(missionActions.setDraft(nextMissionFormValues))
  }, 500)

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
    }

    ;(async () => {
      // New mission
      if (!sideWindow.selectedPath.id) {
        dispatch(missionActions.initializeDraft())

        setIsLoading(false)

        return
      }

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

      setIsLoading(false)

      dispatch(
        missionActions.initializeDraft({
          mission: missionResponse.data,
          missionActions: missionActionsResponse.data
        })
      )
    })()
  }, [dispatch, isLoading, previousMissionId, sideWindow.selectedPath.id])

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

          <HeaderTitle>{missionTitle}</HeaderTitle>

          {sideWindow.selectedPath.id && (
            <MissionSourceTag
              isFromCacem={
                debouncedMissionDraft?.missionSource === Mission.MissionSource.POSEIDON_CACEM ||
                debouncedMissionDraft?.missionSource === Mission.MissionSource.MONITORENV
              }
            >
              {getMissionSourceTagText(debouncedMissionDraft?.missionSource)}
            </MissionSourceTag>
          )}
        </Header>

        <Body>
          <FrontendErrorBoundary>
            {(isLoading || !debouncedMissionDraft) && <LoadingSpinnerWall />}

            {!isLoading && debouncedMissionDraft && (
              <>
                <MainForm initialValues={debouncedMissionDraft} onChange={handleMainFormChange} />
                <ActionList initialValues={debouncedMissionDraft} />
                <ActionForm
                  key={actionFormKey}
                  initialValues={actionFormInitialValues}
                  onChange={handleActionFormChange}
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
                disabled={isLoading}
                Icon={Icon.Delete}
                onClick={toggleDeletionConfirmationDialog}
              >
                Supprimer la mission
              </Button>
            )}
          </div>

          <div>
            <Button accent={Accent.TERTIARY} onClick={goToMissionList}>
              Annuler
            </Button>
            <Button
              accent={Accent.SECONDARY}
              disabled={isLoading || !isMissionFormValid}
              Icon={Icon.Save}
              onClick={() => createOrUpdate()}
            >
              Enregistrer
            </Button>
            <Button
              accent={Accent.SECONDARY}
              disabled={isLoading || !isMissionFormValid}
              Icon={Icon.Confirm}
              onClick={() => createOrUpdate(true)}
            >
              Enregistrer et clôturer
            </Button>
          </div>
        </Footer>
      </Wrapper>

      {isDeletionConfirmationDialogOpen && (
        <DeletionConfirmationDialog onCancel={toggleDeletionConfirmationDialog} onConfirm={_delete} />
      )}
      {sideWindow.isDraftCancellationConfirmationDialogOpen && <DraftCancellationConfirmationDialog />}
    </>
  )
}

export const MissionForm = memo(UnmemoizedMissionForm)

const MissionSourceTag = styled(Tag)<{
  isFromCacem: boolean
}>`
  background: ${p => (p.isFromCacem ? p.theme.color.mediumSeaGreen : p.theme.color.blueGray[100])};
  color: ${p => p.theme.color.white};
  margin-left: 24px;
  vertical-align: middle;
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
