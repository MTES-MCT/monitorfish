import { Dropdown, Icon } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { Item } from './Item'
import { Mission } from '../../../../domain/entities/mission/types'
import { MissionAction } from '../../../../domain/types/missionAction'
import { FrontendErrorBoundary } from '../../../../ui/FrontendErrorBoundary'
import { FormBody } from '../shared/FormBody'
import { FormHead } from '../shared/FormHead'

import type { MissionActionFormValues } from '../types'
import type { Promisable } from 'type-fest'

export type ActionListProps = {
  actionsFormValues: MissionActionFormValues[]
  currentIndex: number | undefined
  missionTypes: Mission.MissionType[] | undefined
  onAdd: (actionType: MissionAction.MissionActionType) => Promisable<void>
  onDuplicate: (actionIndex: number) => Promisable<void>
  onRemove: (actionIndex: number) => Promisable<void>
  onSelect: (actionIndex: number) => Promisable<void>
}
export function ActionList({
  actionsFormValues,
  currentIndex,
  missionTypes = [],
  onAdd,
  onDuplicate,
  onRemove,
  onSelect
}: ActionListProps) {
  return (
    <Wrapper>
      <FormHead>
        <h2>Actions réalisées en mission</h2>

        <Dropdown Icon={Icon.Plus} title="Ajouter">
          {missionTypes.includes(Mission.MissionType.AIR) && (
            <>
              <Dropdown.Item Icon={Icon.Plane} onClick={() => onAdd(MissionAction.MissionActionType.AIR_CONTROL)}>
                Ajouter un contrôle aérien
              </Dropdown.Item>
              <Dropdown.Item
                Icon={Icon.Observation}
                onClick={() => onAdd(MissionAction.MissionActionType.AIR_SURVEILLANCE)}
              >
                Ajouter une surveillance aérienne
              </Dropdown.Item>
            </>
          )}
          {missionTypes.includes(Mission.MissionType.LAND) && (
            <Dropdown.Item Icon={Icon.Anchor} onClick={() => onAdd(MissionAction.MissionActionType.LAND_CONTROL)}>
              Ajouter un contrôle à la débarque
            </Dropdown.Item>
          )}
          {missionTypes.includes(Mission.MissionType.SEA) && (
            <Dropdown.Item Icon={Icon.FleetSegment} onClick={() => onAdd(MissionAction.MissionActionType.SEA_CONTROL)}>
              Ajouter un contrôle en mer
            </Dropdown.Item>
          )}
          <Dropdown.Item Icon={Icon.Note} onClick={() => onAdd(MissionAction.MissionActionType.OBSERVATION)}>
            Ajouter une note libre
          </Dropdown.Item>
        </Dropdown>
      </FormHead>

      <FormBody>
        <FrontendErrorBoundary>
          {!actionsFormValues.length && <Placeholder>Aucune action n’est ajoutée pour le moment.</Placeholder>}

          {actionsFormValues.length > 0 &&
            actionsFormValues.map((actionInitialValues, index) => (
              <Item
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                initialValues={actionInitialValues}
                isSelected={index === currentIndex}
                onDuplicate={() => onDuplicate(index)}
                onRemove={() => onRemove(index)}
                onSelect={() => onSelect(index)}
              />
            ))}
        </FrontendErrorBoundary>
      </FormBody>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  background-color: ${p => p.theme.color.cultured};
  display: flex;
  flex-direction: column;
  max-width: 33.33%;
  min-width: 33.33%;
  overflow-y: auto;
`

const Placeholder = styled.div`
  align-items: center;
  display: flex;
  flex-grow: 1;
  font-size: 13px;
  font-style: italic;
  justify-content: center;
`
