import { Dropdown, Icon } from '@mtes-mct/monitor-ui'
import { useCallback } from 'react'
import styled from 'styled-components'

import { Item } from './Item'
import { Mission } from '../../../../domain/types/mission'
import { NEW_ACTION_BY_TYPE } from '../constants'
import { FormBody } from '../FormBody'
import { FormHead } from '../FormHead'

import type { Action, PartialAction } from '../types'
import type { Promisable } from 'type-fest'

export type ActionListProps = {
  actions: Action[] | undefined
  newAction: PartialAction | undefined
  onAddAction: (newAction: PartialAction) => Promisable<void>
  onDeleteAction: (index: number) => Promisable<void>
  onDeleteNewAction: () => Promisable<void>
  selectedType: Mission.MissionType
}
export function ActionList({
  actions = [],
  newAction,
  onDeleteAction,
  onDeleteNewAction,
  selectedType,
  onAddAction
}: ActionListProps) {
  const addAction = useCallback(
    (type: Action['type']) => {
      const nextNewAction = NEW_ACTION_BY_TYPE[type || 'default']()

      onAddAction(nextNewAction)
    },
    [onAddAction]
  )

  return (
    <Wrapper>
      <FormHead>
        <h2>Actions réalisées en mission</h2>

        <Dropdown Icon={Icon.Plus} title="Ajouter">
          <Dropdown.Item Icon={Icon.FleetSegment} onClick={() => addAction(selectedType)}>
            {selectedType === Mission.MissionType.AIR && 'Ajouter un contrôle aérien'}
            {selectedType === Mission.MissionType.LAND && 'Ajouter un contrôle à la débarque'}
            {selectedType === Mission.MissionType.SEA && 'Ajouter un contrôle en mer'}
          </Dropdown.Item>
          <Dropdown.Item Icon={Icon.Observation} onClick={() => addAction(undefined)}>
            Ajouter une note libre
          </Dropdown.Item>
        </Dropdown>
      </FormHead>

      <FormBody>
        {!actions.length && !newAction && <Placeholder>Aucune action n’est ajoutée pour le moment.</Placeholder>}
        {newAction && <Item action={newAction} isNew onDelete={onDeleteNewAction} />}
        {Boolean(actions.length) &&
          actions.map((action, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <Item key={index} action={action} onDelete={() => onDeleteAction(index)} />
          ))}
      </FormBody>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  background-color: ${p => p.theme.color.cultured};
  display: flex;
  flex-direction: column;
  width: 33.33%;
`

const Placeholder = styled.div`
  align-items: center;
  display: flex;
  flex-grow: 1;
  font-size: 13px;
  font-style: italic;
  justify-content: center;
`
