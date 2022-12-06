import { Dropdown, Icon } from '@mtes-mct/monitor-ui'
import { useCallback } from 'react'
import styled from 'styled-components'

import { MissionType } from '../../../../domain/types/mission'
import { NEW_ACTION_BY_TYPE } from '../constants'
import { FormTitle } from '../FormTitle'

import type { Action, PartialAction } from '../types'
import type { Promisable } from 'type-fest'

export type ActionListProps = {
  actions?: Action[]
  onAddAction: (newAction: PartialAction) => Promisable<void>
  selectedType: MissionType
}
export function ActionList({ actions = [], selectedType, onAddAction }: ActionListProps) {
  const addAction = useCallback(() => {
    onAddAction(NEW_ACTION_BY_TYPE[selectedType])
  }, [onAddAction, selectedType])

  return (
    <Wrapper>
      <Header>
        <FormTitle>Informations générales</FormTitle>

        <Dropdown Icon={Icon.Plus} title="Ajouter">
          <Dropdown.Item Icon={Icon.FleetSegment} onClick={addAction}>
            {selectedType === MissionType.AIR && 'Ajouter un contrôle aérien'}
            {selectedType === MissionType.GROUND && 'Ajouter un contrôle à la débarque'}
            {selectedType === MissionType.SEA && 'Ajouter un contrôle en mer'}
          </Dropdown.Item>
          <Dropdown.Item Icon={Icon.Observation}>Ajouter une note libre</Dropdown.Item>
        </Dropdown>
      </Header>

      {actions.map((_, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <p key={index}>{index}</p>
      ))}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  background-color: ${p => p.theme.color.cultured};
  display: flex;
  flex-direction: column;
  padding: 2rem;
  overflow-y: auto;
  width: 33.33%;
`

const Header = styled.div`
  align-items: center;
  display: flex;

  > h2 {
    margin: 0;
  }

  > div {
    margin-left: 1.5rem;
  }
`
