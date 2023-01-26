import { Accent, Button, Icon } from '@mtes-mct/monitor-ui'
import { noop } from 'lodash'
import { omit } from 'ramda'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import { ActionForm } from './ActionForm'
import { ActionList } from './ActionList'
import { MainForm } from './MainForm'
import { getMissionFormInitialValues } from './MainForm/utils'
import {
  getMissionDataFromMissionFormValues,
  getUpdatedMissionFromMissionFormValues,
  isCompleteMissionFormValues
} from './utils'
import { useCreateMissionMutation } from '../../../api/mission'
import { missionActions } from '../../../domain/actions'
import { openSideWindowTab } from '../../../domain/shared_slices/Global'
import { MissionType } from '../../../domain/types/mission'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'
import { SideWindowMenuKey } from '../constants'

import type { MissionFormValues } from './MainForm/types'
import type { PartialAction } from './types'
import type { MutableRefObject } from 'react'

export function MissionForm() {
  const headerDivRef = useRef() as MutableRefObject<HTMLDivElement>

  const [selectedType, setSelectedType] = useState<MissionType>(MissionType.SEA)
  /** Header height in pixels */
  const [headerHeight, setHeaderHeight] = useState<number>(0)
  const [newAction, setNewAction] = useState<PartialAction | undefined>(undefined)
  const [createMission] = useCreateMissionMutation()
  const [updateMission] = useCreateMissionMutation()

  const dispatch = useMainAppDispatch()
  const editedMission = useMainAppSelector(store => store.mission.editedMission)
  const missionDraftFormValues = useMainAppSelector(store => store.mission.draftFormValues)

  const mainFormInitialValues: MissionFormValues | undefined = useMemo(() => {
    if (!editedMission) {
      return undefined
    }

    const commonValues = omit(['inputDateTimeRangeUtc'], editedMission)
    const defaultInitialValues = getMissionFormInitialValues()

    return {
      ...defaultInitialValues,
      ...commonValues
    }
  }, [editedMission])

  const isMissionFormValid = useMemo(
    () => isCompleteMissionFormValues(missionDraftFormValues),
    [missionDraftFormValues]
  )

  const createOrUpdateMission = useCallback(() => {
    if (!missionDraftFormValues) {
      return
    }

    if (!editedMission) {
      const newMission = getMissionDataFromMissionFormValues(missionDraftFormValues)

      createMission(newMission)
    } else {
      const updatedMission = getUpdatedMissionFromMissionFormValues(editedMission.id, missionDraftFormValues)

      updateMission(updatedMission)
    }
  }, [createMission, editedMission, missionDraftFormValues, updateMission])

  const goToMissionList = useCallback(async () => {
    dispatch(openSideWindowTab(SideWindowMenuKey.MISSION_LIST))
  }, [dispatch])

  const createOrUpdateMissionAndClose = useCallback(async () => {
    createOrUpdateMission()
    goToMissionList()
  }, [createOrUpdateMission, goToMissionList])

  const handleMainFormChange = useCallback(
    (nextMissionFormValues: MissionFormValues) => {
      dispatch(missionActions.setDraftFormValues(nextMissionFormValues))
    },
    [dispatch]
  )

  const unsetNewAction = useCallback(() => {
    setNewAction(undefined)
  }, [])

  const handleResize = useCallback(() => {
    setHeaderHeight(headerDivRef.current.offsetHeight)
  }, [])

  useEffect(() => {
    handleResize()

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [handleResize])

  return (
    <Wrapper heightOffset={headerHeight}>
      <Header ref={headerDivRef}>
        <HeaderTitle>Ajout d’une nouvelle mission</HeaderTitle>
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
        <MainForm
          initialValues={mainFormInitialValues}
          onChange={handleMainFormChange}
          onTypeChange={setSelectedType}
        />
        <ActionList
          actions={[]}
          newAction={newAction}
          onAddAction={setNewAction}
          onDeleteAction={noop}
          onDeleteNewAction={unsetNewAction}
          selectedType={selectedType}
        />
        <ActionForm action={newAction} onChange={setNewAction} />
      </Body>
    </Wrapper>
  )
}

// TODO Check why there is a `box-sizing: revert` in index.css.
const Wrapper = styled.div<{
  // Height offset in pixels
  heightOffset: number
}>`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  /* TODO Switch to flex sizing once SideWindow is full-flex (and remove the dirty calc). */
  /* flex-grow: 1; */
  height: calc(100% - ${p => p.heightOffset}px + 1rem);
  /* max-height: calc(100% - 47px); */

  * {
    box-sizing: border-box;
  }
`

const Header = styled.div`
  align-items: center;
  background-color: ${p => p.theme.color.white};
  border-bottom: solid 2px ${p => p.theme.color.gainsboro};
  display: flex;
  justify-content: space-between;
  padding: 1.875rem 2rem 1.875rem 3rem;
`

const HeaderTitle = styled.h1`
  color: ${p => p.theme.color.charcoal};
  font-size: 22px;
  font-weight: 700;
  line-height: 1.4;
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
