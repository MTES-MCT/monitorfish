import { Dropdown, Icon } from '@mtes-mct/monitor-ui'
import { useCallback, useMemo } from 'react'
import styled from 'styled-components'

import { Item } from './Item'
import { getMissionActionFormInitialValues } from './utils'
import { missionActions } from '../../../../domain/actions'
import { Mission } from '../../../../domain/entities/mission/types'
import { MissionAction } from '../../../../domain/types/missionAction'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { FrontendErrorBoundary } from '../../../../ui/FrontendErrorBoundary'
import { FormBody } from '../shared/FormBody'
import { FormHead } from '../shared/FormHead'

import type { MissionActionFormValues, MissionFormValues } from '../types'

export type ActionListProps = {
  initialValues: MissionFormValues
}
export function ActionList({ initialValues }: ActionListProps) {
  const dispatch = useMainAppDispatch()

  const { mission } = useMainAppSelector(store => store)

  const currentMissionTypes = useMemo(() => initialValues.missionTypes || [], [initialValues.missionTypes])

  const add = useCallback(
    (type: MissionActionFormValues['actionType']) => {
      const newMissionActionFormValues = getMissionActionFormInitialValues(type)

      dispatch(missionActions.addDraftAction(newMissionActionFormValues))
    },
    [dispatch]
  )

  const edit = useCallback(
    (index: number) => {
      dispatch(missionActions.setEditedDraftActionIndex(index))
    },
    [dispatch]
  )

  const duplicate = useCallback(
    (missionActionIndex: number) => {
      dispatch(missionActions.duplicateDraftActionAtIndex(missionActionIndex))
    },
    [dispatch]
  )

  const remove = useCallback(
    (missionActionIndex: number) => {
      dispatch(missionActions.removeDraftActionAtIndex(missionActionIndex))
    },
    [dispatch]
  )

  return (
    <Wrapper>
      <FormHead>
        <h2>Actions réalisées en mission</h2>

        <Dropdown Icon={Icon.Plus} title="Ajouter">
          {currentMissionTypes.includes(Mission.MissionType.AIR) && (
            <>
              <Dropdown.Item Icon={Icon.Plane} onClick={() => add(MissionAction.MissionActionType.AIR_CONTROL)}>
                Ajouter un contrôle aérien
              </Dropdown.Item>
              <Dropdown.Item
                Icon={Icon.Observation}
                onClick={() => add(MissionAction.MissionActionType.AIR_SURVEILLANCE)}
              >
                Ajouter une surveillance aérienne
              </Dropdown.Item>
            </>
          )}
          {currentMissionTypes.includes(Mission.MissionType.LAND) && (
            <Dropdown.Item Icon={Icon.Anchor} onClick={() => add(MissionAction.MissionActionType.LAND_CONTROL)}>
              Ajouter un contrôle à la débarque
            </Dropdown.Item>
          )}
          {currentMissionTypes.includes(Mission.MissionType.SEA) && (
            <Dropdown.Item Icon={Icon.FleetSegment} onClick={() => add(MissionAction.MissionActionType.SEA_CONTROL)}>
              Ajouter un contrôle en mer
            </Dropdown.Item>
          )}
          <Dropdown.Item Icon={Icon.Note} onClick={() => add(MissionAction.MissionActionType.OBSERVATION)}>
            Ajouter une note libre
          </Dropdown.Item>
        </Dropdown>
      </FormHead>

      <FormBody>
        <FrontendErrorBoundary>
          {!initialValues.actions.length && <Placeholder>Aucune action n’est ajoutée pour le moment.</Placeholder>}

          {Boolean(initialValues.actions.length) &&
            initialValues.actions.map((actionInitialValues, index) => (
              <Item
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                initialValues={actionInitialValues}
                isSelected={index === mission.editedDraftActionIndex}
                onDelete={() => remove(index)}
                onDuplicate={() => duplicate(index)}
                onEdit={() => edit(index)}
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
`

const Placeholder = styled.div`
  align-items: center;
  display: flex;
  flex-grow: 1;
  font-size: 13px;
  font-style: italic;
  justify-content: center;
`
