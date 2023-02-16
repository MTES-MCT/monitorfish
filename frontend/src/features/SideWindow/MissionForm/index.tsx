import { Accent, Button, Icon } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/dist/query'
import { useCallback, useEffect, useMemo, useRef } from 'react'
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
import { useCreateMissionMutation, useGetMissionQuery } from '../../../api/mission'
import {
  useCreateMissionActionMutation,
  useGetMissionActionsQuery,
  useUpdateMissionActionMutation
} from '../../../api/missionAction'
import { missionActions } from '../../../domain/actions'
import { openSideWindowTab } from '../../../domain/shared_slices/Global'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'
import { FrontendError } from '../../../libs/FrontendError'
import { LoadingSpinnerWall } from '../../../ui/LoadingSpinnerWall'
import { NoRsuiteOverrideWrapper } from '../../../ui/NoRsuiteOverrideWrapper'
import { SideWindowMenuKey } from '../constants'

import type { MissionActionFormValues, MissionFormValues } from './types'

export function MissionForm() {
  const { mission } = useMainAppSelector(store => store)
  if (!mission.draft && !mission.draftId) {
    throw new FrontendError(
      'Both `mission.draft` and `mission.draftId` are undefined. This should never happen.',
      'features/SideWindow/MissionForm/index.tsx > MissionForm()'
    )
  }

  const headerDivRef = useRef<HTMLDivElement | null>(null)

  const dispatch = useMainAppDispatch()
  const missionApiQuery = useGetMissionQuery(mission.draftId || skipToken)
  const missionActionsApiQuery = useGetMissionActionsQuery(mission.draftId || skipToken)
  const [createMission] = useCreateMissionMutation()
  const [createMissionAction] = useCreateMissionActionMutation()
  const [updateMission] = useCreateMissionMutation()
  const [updateMissionAction] = useUpdateMissionActionMutation()

  const actionFormKey = useMemo(() => `actionForm-${mission.editedDraftActionIndex}`, [mission.editedDraftActionIndex])
  const isLoading = useMemo(() => !mission.draft, [mission.draft])
  const isMissionFormValid = useMemo(() => isMissionFormValuesComplete(mission.draft), [mission.draft])

  const actionFormInitialValues = useMemo(
    () => {
      if (mission.editedDraftActionIndex === undefined) {
        return undefined
      }

      if (!mission.draft || !mission.draft.actions) {
        throw new FrontendError(
          'Either `mission.draft` or `mission.draft.actions` is undefined while `mission.editedDraftActionIndex` is not. This should never happen.',
          'actionFormInitialValues'
        )
      }

      return mission.draft.actions[mission.editedDraftActionIndex]
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mission.editedDraftActionIndex]
  )

  const createOrUpdateMission = useCallback(async () => {
    if (!mission.draft) {
      return
    }

    let missionId: number

    // TODO Dev only. Remove that try/catch before merging.
    try {
      if (!mission.draftId) {
        const newMission = getMissionDataFromMissionFormValues(mission.draft)
        // TODO Override Redux RTK typings globally.
        // Redux RTK typing is wrong, this should be a tuple-like to help TS discriminate `data` from `error`.
        const { data, error } = (await createMission(newMission)) as any
        if (!data) {
          throw new FrontendError('`createMission()` failed', 'createOrUpdateMission()', error)
        }

        missionId = data.id
      } else {
        const updatedMission = getUpdatedMissionFromMissionFormValues(mission.draftId, mission.draft)
        await updateMission(updatedMission)

        missionId = mission.draftId
      }
      // eslint-disable-next-line no-empty
    } catch (_) {}

    // TODO Dev only. Remove that before merging.
    missionId = Math.ceil(Math.random() * 2)

    const missionActionsData = getMissionActionsDataFromMissionActionsFormValues(missionId, mission.draft.actions)

    await Promise.all(
      missionActionsData.map(async missionActionData => {
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
  }, [createMission, createMissionAction, mission.draftId, mission.draft, updateMission, updateMissionAction])

  const goToMissionList = useCallback(async () => {
    dispatch(openSideWindowTab(SideWindowMenuKey.MISSION_LIST))
  }, [dispatch])

  const createOrUpdateMissionAndClose = useDebouncedCallback(async () => {
    createOrUpdateMission()
    goToMissionList()
  }, 500)

  const handleActionFormChange = useDebouncedCallback((nextMissionActionFormValues: MissionActionFormValues) => {
    dispatch(missionActions.setEditedDraftAction(nextMissionActionFormValues))
  }, 500)

  const handleMainFormChange = useCallback(
    (nextMissionFormValues: MissionFormValues) => {
      dispatch(missionActions.setDraft(nextMissionFormValues))
    },
    [dispatch]
  )

  // ---------------------------------------------------------------------------
  // DATA

  useEffect(() => {
    if (mission.draft) {
      return
    }

    if (missionApiQuery.isLoading || missionActionsApiQuery.isLoading) {
      return
    }

    const editedMission = missionApiQuery.data
    const editedMissionActions = missionActionsApiQuery.data
    if (!editedMission || !editedMissionActions) {
      throw new FrontendError(
        '`editedMission` or `editedMissionActions` is undefined. This should never happen.',
        'features/SideWindow/MissionForm/index.tsx > MissionForm()',
        missionApiQuery.error || missionActionsApiQuery.error || undefined
      )
    }

    dispatch(
      missionActions.initializeDraft({
        mission: editedMission,
        missionActions: editedMissionActions
      })
    )
  }, [
    dispatch,
    mission.draft,
    missionApiQuery.data,
    missionApiQuery.error,
    missionApiQuery.isLoading,
    missionActionsApiQuery.data,
    missionActionsApiQuery.error,
    missionActionsApiQuery.isLoading
  ])

  // ---------------------------------------------------------------------------

  return (
    <Wrapper>
      <Header ref={headerDivRef}>
        <HeaderTitleGroup>
          <HeaderTitle>{mission.draftId ? `Édition d’une mission` : `Nouvelle mission`}</HeaderTitle>
        </HeaderTitleGroup>

        <HeaderButtonGroup>
          <Button accent={Accent.TERTIARY} onClick={goToMissionList}>
            Annuler
          </Button>
          <Button
            accent={Accent.SECONDARY}
            disabled={!isMissionFormValid}
            Icon={Icon.Save}
            onClick={createOrUpdateMission}
          >
            Enregistrer
          </Button>
          <Button
            accent={Accent.SECONDARY}
            disabled={!isMissionFormValid}
            Icon={Icon.Confirm}
            onClick={createOrUpdateMissionAndClose}
          >
            Enregistrer et clôturer
          </Button>
        </HeaderButtonGroup>
      </Header>

      <Body>
        {isLoading && <LoadingSpinnerWall />}

        {!isLoading && mission.draft && (
          <>
            <MainForm initialValues={mission.draft} onChange={handleMainFormChange} />
            <ActionList initialValues={mission.draft} />
            <ActionForm key={actionFormKey} initialValues={actionFormInitialValues} onChange={handleActionFormChange} />
          </>
        )}
      </Body>
    </Wrapper>
  )
}

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
  padding: 30px 32px 30px 18px;
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
