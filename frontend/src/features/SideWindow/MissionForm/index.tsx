import { Accent, Button, Icon, Tag } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/dist/query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { useDebouncedCallback } from 'use-debounce'

import { ActionForm } from './ActionForm'
import { ActionList } from './ActionList'
import { MainForm } from './MainForm'
import {
  getMissionActionsDataFromMissionActionsFormValues,
  getMissionDataFromMissionFormValues,
  getUpdatedMissionFromMissionFormValues,
  isMissionFormValuesComplete
} from './utils'
import { useCreateMissionMutation, useGetMissionQuery, useUpdateMissionMutation } from '../../../api/mission'
import {
  useCreateMissionActionMutation,
  useGetMissionActionsQuery,
  useUpdateMissionActionMutation
} from '../../../api/missionAction'
import { missionActions } from '../../../domain/actions'
import { getMissionSourceTagText } from '../../../domain/entities/mission'
import { Mission, type MissionWithActions } from '../../../domain/entities/mission/types'
import { openSideWindowTab } from '../../../domain/shared_slices/Global'
import { useDebouncedValue } from '../../../hooks/useDebouncedValue'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'
import { FrontendError } from '../../../libs/FrontendError'
import { FrontendErrorBoundary } from '../../../ui/FrontendErrorBoundary'
import { LoadingSpinnerWall } from '../../../ui/LoadingSpinnerWall'
import { NoRsuiteOverrideWrapper } from '../../../ui/NoRsuiteOverrideWrapper'
import { SideWindowMenuKey } from '../constants'

import type { MissionActionFormValues, MissionFormValues } from './types'

export function MissionForm() {
  const { mission } = useMainAppSelector(store => store)

  const headerDivRef = useRef<HTMLDivElement | null>(null)
  const originalMissionWithActionsRef = useRef<MissionWithActions | undefined>(undefined)

  const [isLoading, setIsLoading] = useState(true)

  const dispatch = useMainAppDispatch()
  const missionApiQuery = useGetMissionQuery(mission.draftId || skipToken)
  const missionActionsApiQuery = useGetMissionActionsQuery(mission.draftId || skipToken)
  const [createMission] = useCreateMissionMutation()
  const [createMissionAction] = useCreateMissionActionMutation()
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
    [mission.editedDraftActionIndex]
  )

  const missionTitle = useMemo(
    () =>
      mission.draftId
        ? `Mission ${
            debouncedMissionDraft?.missionTypes &&
            debouncedMissionDraft.missionTypes.map(missionType => Mission.MissionTypeLabel[missionType]).join(' / ')
          } – ${debouncedMissionDraft?.controlUnits
            .map(controlUnit => controlUnit.name?.replace('(historique)', ''))
            .join(', ')}`
        : `Nouvelle mission`,
    [debouncedMissionDraft, mission.draftId]
  )

  const goToMissionList = useCallback(async () => {
    dispatch(openSideWindowTab(SideWindowMenuKey.MISSION_LIST))
    dispatch(missionActions.unsetDraft())
  }, [dispatch])

  /**
   * @param mustClose Should the mission be closed?
   */
  const createOrUpdateMission = useCallback(
    async (mustClose: boolean = false) => {
      if (!mission.draft) {
        return
      }

      let missionId: number

      if (!mission.draftId) {
        const newMission = getMissionDataFromMissionFormValues(mission.draft, mustClose)
        // TODO Override Redux RTK typings globally.
        // Redux RTK typing is wrong, this should be a tuple-like to help TS discriminate `data` from `error`.
        const { data, error } = (await createMission(newMission)) as any
        if (!data) {
          throw new FrontendError('`createMission()` failed', error)
        }

        missionId = data.id
      } else {
        const updatedMission = getUpdatedMissionFromMissionFormValues(mission.draftId, mission.draft, mustClose)
        await updateMission(updatedMission)

        missionId = mission.draftId
      }
      // eslint-disable-next-line no-empty

      const missionActionDatas = getMissionActionsDataFromMissionActionsFormValues(
        missionId,
        mission.draft.actions,
        originalMissionWithActionsRef.current?.actions
      )

      await Promise.all(
        missionActionDatas.map(async missionActionData => {
          if (missionActionData.id === undefined) {
            await createMissionAction(missionActionData)
          } else {
            await updateMissionAction({
              ...missionActionData,
              id: missionActionData.id
            })
          }
        })
      )

      goToMissionList()
    },
    [
      createMission,
      createMissionAction,
      goToMissionList,
      mission.draft,
      mission.draftId,
      updateMission,
      updateMissionAction
    ]
  )

  const handleActionFormChange = useDebouncedCallback((nextMissionActionFormValues: MissionActionFormValues) => {
    dispatch(missionActions.setEditedDraftAction(nextMissionActionFormValues))
  }, 500)

  const handleMainFormChange = useDebouncedCallback((nextMissionFormValues: MissionFormValues) => {
    dispatch(missionActions.setDraft(nextMissionFormValues))
  }, 500)

  // ---------------------------------------------------------------------------
  // DATA

  useEffect(() => {
    if (!isLoading) {
      return
    }

    // New mission
    if (!mission.draftId) {
      setIsLoading(false)

      dispatch(missionActions.initializeDraft())

      return
    }

    // Mission edition
    if (!missionApiQuery.data || !missionActionsApiQuery.data) {
      return
    }

    originalMissionWithActionsRef.current = {
      ...missionApiQuery.data,
      actions: missionActionsApiQuery.data
    }

    setIsLoading(false)

    dispatch(
      missionActions.initializeDraft({
        mission: missionApiQuery.data,
        missionActions: missionActionsApiQuery.data
      })
    )
  }, [dispatch, isLoading, mission.draftId, missionActionsApiQuery.data, missionApiQuery.data])

  // ---------------------------------------------------------------------------

  return (
    <Wrapper>
      <Header ref={headerDivRef}>
        <HeaderTitleGroup>
          <HeaderTitle>
            <BackToListIcon onClick={goToMissionList} />
            {missionTitle}
            {mission.draftId && (
              <MissionSourceTag>{getMissionSourceTagText(debouncedMissionDraft?.missionSource)}</MissionSourceTag>
            )}
          </HeaderTitle>
        </HeaderTitleGroup>

        <HeaderButtonGroup>
          <Button accent={Accent.TERTIARY} onClick={goToMissionList}>
            Annuler
          </Button>
          <Button
            accent={Accent.SECONDARY}
            disabled={isLoading || !isMissionFormValid}
            Icon={Icon.Save}
            onClick={() => createOrUpdateMission()}
          >
            Enregistrer
          </Button>
          <Button
            accent={Accent.SECONDARY}
            disabled={isLoading || !isMissionFormValid}
            Icon={Icon.Confirm}
            onClick={() => createOrUpdateMission(true)}
          >
            Enregistrer et clôturer
          </Button>
        </HeaderButtonGroup>
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
    </Wrapper>
  )
}

const MissionSourceTag = styled(Tag)`
  background: ${p => p.theme.color.blueGray[100]};
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
  justify-content: space-between;
  min-height: 80px;
  padding: 0 32px 0 18px;
`

const HeaderTitleGroup = styled.div`
  display: flex;
`

const HeaderTitle = styled.h1`
  color: ${p => p.theme.color.charcoal};
  font-size: 22px;
  font-weight: 700;
  line-height: 31px;
  margin: 0;

  > div {
    vertical-align: middle;
  }
`

const HeaderButtonGroup = styled.div`
  display: flex;

  > button:not(:first-child) {
    margin-left: 16px;
  }
`

const Body = styled.div`
  background-color: ${p => p.theme.color.gainsboro};
  display: flex;
  flex-grow: 1;
  min-height: 0;
`
