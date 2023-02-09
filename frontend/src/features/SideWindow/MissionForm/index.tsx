import { Accent, Button, Icon } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/dist/query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import { ActionForm } from './ActionForm'
import { ActionList } from './ActionList'
import { MainForm } from './MainForm'
import {
  getMissionDataFromMissionFormValues,
  getUpdatedMissionFromMissionFormValues,
  isMissionFormValuesComplete
} from './utils'
import { useCreateMissionMutation, useGetMissionQuery } from '../../../api/mission'
import { useGetMissionActionsQuery } from '../../../api/missionAction'
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

  const [hasRenderedOnce, setHasRenderedOnce] = useState(false)
  /** Header height in pixels */
  const [headerHeight, setHeaderHeight] = useState<number>(0)

  const dispatch = useMainAppDispatch()
  const missionApiQuery = useGetMissionQuery(mission.draftId || skipToken)
  const missionActionsApiQuery = useGetMissionActionsQuery(mission.draftId || skipToken)
  const [createMission] = useCreateMissionMutation()
  const [updateMission] = useCreateMissionMutation()

  const actionFormKey = useMemo(() => `actionForm-${mission.editedDraftActionIndex}`, [mission.editedDraftActionIndex])
  const isMissionFormValid = useMemo(() => isMissionFormValuesComplete(mission.draft), [mission.draft])

  const actionFormInitialValues = useMemo(
    () => {
      if (mission.editedDraftActionIndex === undefined) {
        return undefined
      }

      if (!mission.draft || !mission.draft.actions) {
        throw new FrontendError(
          'Either `mission.draft` or `mission.draft.actions` is undefined while `mission.editedDraftActionIndex` is not. This should never happen.',
          'features/SideWindow/MissionForm/index.tsx > MissionForm()'
        )
      }

      return mission.draft.actions[mission.editedDraftActionIndex]
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mission.editedDraftActionIndex]
  )

  const createOrUpdateMission = useCallback(() => {
    if (!mission.draft) {
      return
    }

    if (!mission.draftId) {
      const newMission = getMissionDataFromMissionFormValues(mission.draft)

      createMission(newMission)
    } else {
      const updatedMission = getUpdatedMissionFromMissionFormValues(mission.draftId, mission.draft)

      updateMission(updatedMission)
    }
  }, [createMission, mission.draftId, mission.draft, updateMission])

  const goToMissionList = useCallback(async () => {
    dispatch(openSideWindowTab(SideWindowMenuKey.MISSION_LIST))
  }, [dispatch])

  const createOrUpdateMissionAndClose = useCallback(async () => {
    createOrUpdateMission()
    goToMissionList()
  }, [createOrUpdateMission, goToMissionList])

  const handleActionFormChange = useCallback(
    (nextMissionActionFormValues: MissionActionFormValues) => {
      dispatch(missionActions.setEditedDraftAction(nextMissionActionFormValues))
    },
    [dispatch]
  )

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
  }, [dispatch, mission.draft, missionApiQuery, missionActionsApiQuery])

  // ---------------------------------------------------------------------------
  // DOM

  const handleResize = useCallback(
    () => {
      if (!headerDivRef.current) {
        return
      }

      setHasRenderedOnce(true)
      setHeaderHeight(headerDivRef.current.offsetHeight)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasRenderedOnce]
  )

  useEffect(() => {
    handleResize()

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [handleResize])

  // ---------------------------------------------------------------------------

  if (!mission.draft) {
    return <LoadingSpinnerWall />
  }

  // if (mission.draft.actions.length > 0) {
  //   console.log(mission.draft.actions[0])
  // }

  return (
    <Wrapper heightOffset={headerHeight}>
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
        <MainForm initialValues={mission.draft} onChange={handleMainFormChange} />
        <ActionList initialValues={mission.draft} />
        <ActionForm key={actionFormKey} initialValues={actionFormInitialValues} onChange={handleActionFormChange} />
      </Body>
    </Wrapper>
  )
}

const Wrapper = styled(NoRsuiteOverrideWrapper)<{
  /** Height offset in pixels */
  heightOffset: number
}>`
  display: flex;
  flex-direction: column;
  /* TODO Switch to flex sizing once SideWindow is full-flex (and remove the dirty calc). */
  /* flex-grow: 1; */
  height: calc(100% - ${p => p.heightOffset}px + 17px);
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
    margin-left: 1rem;
  }
`

const Body = styled.div`
  background-color: ${p => p.theme.color.gainsboro};
  display: flex;
  flex-grow: 1;
  max-height: calc(100% - 67px);
`
