import { Accent, Button, Icon } from '@mtes-mct/monitor-ui'
import { noop } from 'lodash'
import { dispatch } from 'ramda-adjunct'
import { RefObject, useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { missionApi } from '../../../api/mission'
import { openSideWindowTab, setError } from '../../../domain/shared_slices/Global'
import { MissionType } from '../../../domain/types/mission'
import { closeAddMissionZone } from '../../../domain/use_cases/missions/closeAddMissionZone'
import { SideWindowMenuKey } from '../constants'
import { ActionForm } from './ActionForm'
import { ActionList } from './ActionList'
import { MainForm } from './MainForm'
import { MissionDeleteModal } from './MissionDeleteModal'

import type { PartialAction } from './types'
import type { MutableRefObject } from 'react'

export type MissionFormProps = {
  baseRef: RefObject<HTMLDivElement>
}
export function MissionForm({ baseRef }) {
  const headerRef = useRef() as MutableRefObject<HTMLDivElement>
  const [createMission, { isLoading: isLoadingCreateMission }] = missionApi.useCreateMutation()
  const [, { isLoading: isLoadingUpdateMission }] = missionApi.useUpdateMutation()
  // const [] = missionApi.useDeleteMutation()
  // TODO Add the actionsApi.useCreateAction
  // const [createAction, { isLoading: isLoadingCreateAction }] = missionApi.useCreateMutation()
  const [selectedType, setSelectedType] = useState<MissionType>(MissionType.SEA)
  /** Header height in pixels */
  const [headerHeight, setHeaderHeight] = useState<number>(0)
  const [newAction, setNewAction] = useState<PartialAction | undefined>(undefined)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const unsetNewAction = useCallback(() => {
    setNewAction(undefined)
  }, [])

  const handleResize = useCallback(() => {
    setHeaderHeight(headerRef.current.offsetHeight)
  }, [])

  useEffect(() => {
    handleResize()

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [handleResize])

  const handleCreateMission = useCallback(
    mission => {
      // Create the mission in MonitorEnv API
      Promise.all([
        createMission(mission),
        // TODO Create the action in our API
        // createAction(newAction)
        createMission(mission)
      ]).then(([missionResponse, actionResponse]) => {
        const hasMissionError = 'error' in missionResponse
        const hasActionError = 'error' in actionResponse

        if (hasMissionError || hasActionError) {
          if (hasMissionError) {
            dispatch(setError(missionResponse.error) as any)
          }
          if (hasActionError) {
            dispatch(setError(actionResponse.error) as any)
          }

          return
        }

        dispatch(closeAddMissionZone as any)
        dispatch(openSideWindowTab(SideWindowMenuKey.MISSION_LIST) as any)
      })
    },
    [createMission]
  )

  const handleReturnToEdition = () => {
    setIsDeleteModalOpen(false)
  }

  const handleDelete = () => {
    // TODO Delete mission
  }

  return (
    <Wrapper heightOffset={headerHeight}>
      <Header ref={headerRef}>
        <HeaderTitle>
          Ajout d’une nouvelle mission
          {(isLoadingCreateMission || isLoadingUpdateMission) && ' - Enregistrement en cours'}
        </HeaderTitle>
        <HeaderButtonGroup>
          <Button accent={Accent.TERTIARY}>Annuler</Button>
          <Button accent={Accent.SECONDARY} form="mission-form" Icon={Icon.Save} type="submit">
            Enregistrer
          </Button>
          <Button accent={Accent.SECONDARY} form="mission-form" Icon={Icon.Confirm}>
            Enregistrer et clôturer
          </Button>
        </HeaderButtonGroup>
      </Header>

      <Body>
        <MainForm createMission={handleCreateMission} onTypeChange={setSelectedType} />
        <ActionList
          actions={[]}
          newAction={newAction}
          onAddAction={setNewAction}
          onDeleteAction={noop}
          onDeleteNewAction={unsetNewAction}
          selectedType={selectedType}
        />
        <ActionForm action={newAction} baseRef={baseRef} onChange={setNewAction} />
      </Body>

      <MissionDeleteModal isOpen={isDeleteModalOpen} onCancel={handleReturnToEdition} onConfirm={handleDelete} />
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
